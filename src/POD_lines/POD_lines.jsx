import React, { useState, useEffect, useMemo } from "react";
import { IoIosArrowDown } from "react-icons/io";
import {
  LuShip,
  LuFileSpreadsheet,
  LuChevronLeft,
  LuChevronRight,
  LuPlus,
  LuSettings,
  LuRefreshCw,
  LuExternalLink,
  LuClock,
  LuCalendarDays,
} from "react-icons/lu";
import { FiSearch } from "react-icons/fi";
import { HiOutlineGlobeAlt, HiOutlineLocationMarker } from "react-icons/hi";
import { MdDirectionsBoat } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { useDataContext } from "../context/DataContext";
import Navbar from "../components/Navbar";

function POD_lines() {
  // Use the global data context for optimized performance
  const {
    allDestinations: contextDestinations,
    getFreightRatesByPOD,
    getShippingLinesCountByPOD,
    isDataLoading,
    isInitialized,
    error: dataError,
    refreshData,
    totalRates,
  } = useDataContext();

  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [selectedPOD, setSelectedPOD] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [shippingLines, setShippingLines] = useState([]);
  const [freightRates, setFreightRates] = useState([]);
  const [freightRatesLoading, setFreightRatesLoading] = useState(false);
  const [allDestinations, setAllDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [animatingRows, setAnimatingRows] = useState(new Set());
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Search optimization with debouncing
  const [debouncedSearchInput, setDebouncedSearchInput] = useState("");

  // Debounce search input for performance
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  // Pagination settings
  const itemsPerPage = 20;

  // Calculate pagination
  const totalItems = shippingLines.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = shippingLines.slice(startIndex, endIndex);

  // Memoized filtered suggestions for better performance with shipping lines count
  const filteredSuggestions = useMemo(() => {
    if (!debouncedSearchInput || debouncedSearchInput.length < 1) return [];

    const searchTerm = debouncedSearchInput.toLowerCase().trim();

    // Combine destinations from both local and context sources
    const combinedDestinations = new Map();

    // Helper function to add destination with accurate shipping lines count
    const addDestinationWithCount = (destinationName, originalDest = null) => {
      if (!destinationName) return;

      // Get the accurate count of all unique shipping lines for this destination
      const shippingLinesCount = getShippingLinesCountByPOD(destinationName);

      combinedDestinations.set(destinationName, {
        destinationName: destinationName,
        shippingLines: Array(shippingLinesCount)
          .fill()
          .map((_, i) => `Line ${i + 1}`),
        shippingLinesCount: shippingLinesCount,
        isActive: originalDest?.isActive !== false,
        _id: originalDest?._id || originalDest?.id || destinationName,
      });
    }; // Add from local allDestinations (legacy) - but calculate fresh counts
    allDestinations
      .filter((dest) => dest.isActive !== false)
      .forEach((dest) => {
        if (dest.destinationName) {
          addDestinationWithCount(dest.destinationName, dest);
        }
      });

    // Add from context destinations - calculate fresh counts
    contextDestinations.forEach((destination) => {
      let destinationName = "";

      if (typeof destination === "string") {
        destinationName = destination;
      } else if (destination.name) {
        destinationName = destination.name;
      } else if (destination.destination) {
        destinationName = destination.destination;
      } else if (destination.destinationName) {
        destinationName = destination.destinationName;
      }

      if (destinationName) {
        addDestinationWithCount(destinationName, destination);
      }
    });

    // Filter suggestions based on search input and return properly structured objects
    return Array.from(combinedDestinations.values())
      .filter(
        (dest) =>
          dest.destinationName.toLowerCase().includes(searchTerm) &&
          dest.destinationName.toLowerCase() !== searchTerm // Don't show exact matches
      )
      .sort((a, b) => {
        // Prioritize exact prefix matches
        const aStartsWith = a.destinationName
          .toLowerCase()
          .startsWith(searchTerm);
        const bStartsWith = b.destinationName
          .toLowerCase()
          .startsWith(searchTerm);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        return a.destinationName.localeCompare(b.destinationName);
      })
      .slice(0, 8); // Limit to 8 suggestions for performance
  }, [
    debouncedSearchInput,
    allDestinations,
    contextDestinations,
    getShippingLinesCountByPOD,
  ]);

  // Lazy loading animation for table rows
  const triggerRowAnimation = (index) => {
    setTimeout(() => {
      setAnimatingRows((prev) => new Set([...prev, index]));
    }, index * 100); // Stagger animation
  };

  // Optimized freight rates fetching using pre-fetched data
  const fetchFreightRates = async (podDestination) => {
    if (!podDestination) return [];

    console.log(
      "[POD_lines] Fetching freight rates for POD using cached data:",
      podDestination
    );

    try {
      setFreightRatesLoading(true);

      // Use the optimized context method for instant results
      const filteredRates = getFreightRatesByPOD(podDestination);
      console.log(
        "[POD_lines] Filtered freight rates from cache:",
        filteredRates
      );

      setFreightRates(filteredRates);
      return filteredRates;
    } catch (error) {
      console.error(
        "[POD_lines] Error processing cached freight rates:",
        error
      );
      setFreightRates([]);
      return [];
    } finally {
      // Simulate minimal loading for UX (since data is cached, this is very fast)
      setTimeout(() => {
        setFreightRatesLoading(false);
      }, 100);
    }
  };

  // Optimized destinations fetching using pre-fetched data
  const fetchAllDestinations = async () => {
    console.log("[POD_lines] Using pre-fetched destinations from context");

    try {
      setIsLoadingDestinations(true);
      setError("");

      // Use context destinations directly (already loaded)
      const processedDestinations = contextDestinations.map((destination) => {
        if (typeof destination === "string") {
          return { destinationName: destination, isActive: true };
        } else if (destination.name) {
          return {
            destinationName: destination.name,
            isActive: destination.isActive !== false,
          };
        } else if (destination.destination) {
          return {
            destinationName: destination.destination,
            isActive: destination.isActive !== false,
          };
        } else if (destination.destinationName) {
          return destination;
        }
        return { destinationName: destination, isActive: true };
      });

      console.log(
        "[POD_lines] Processed destinations from context:",
        processedDestinations.length
      );
      setAllDestinations(processedDestinations);
      return processedDestinations;
    } catch (error) {
      console.error("[POD_lines] Error processing destinations:", error);
      setError("Failed to process destinations");
      setAllDestinations([]);
      return [];
    } finally {
      setIsLoadingDestinations(false);
    }
  };

  // Helper function to normalize destination names for matching
  const normalizeDestination = (destination) => {
    if (!destination) return "";

    return (
      destination
        .toLowerCase()
        .trim()
        // Remove common country/region suffixes
        .replace(
          /,?\s*(saudi arabia|Argentina|australia|uae|Bangladesh|angola|united arab emirates|cameron|china|india|germany|netherlands|belgium|italy|indonesia|ecuador|mexico|colombia|egypt|vietnam|sri lanka|russia|us|israel|france|uk|oman|united kingdom|usa|united states|port|peru|harbor|NY|japan|uruguay|algeria|harbour)$/i,
          ""
        )
        // Remove common prefixes
        .replace(/^(port of|port|harbor of|harbour of)\s+/i, "")
        // Remove punctuation and extra spaces
        .replace(/[,.\-_\(\)\[\]]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    );
  };

  // Helper function to calculate similarity between two destination names
  const calculateSimilarity = (str1, str2) => {
    const normalize1 = normalizeDestination(str1);
    const normalize2 = normalizeDestination(str2);

    // Exact match after normalization
    if (normalize1 === normalize2) return 1.0;

    // Check if one contains the other (for cases like "JEDDAH" vs "JEDDAH PORT")
    if (normalize1.includes(normalize2) || normalize2.includes(normalize1)) {
      return 0.9;
    }

    // Simple character-based similarity (Jaccard similarity)
    const words1 = new Set(normalize1.split(" ").filter((w) => w.length > 2));
    const words2 = new Set(normalize2.split(" ").filter((w) => w.length > 2));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    if (union.size === 0) return 0;

    const similarity = intersection.size / union.size;
    return similarity;
  };

  // Helper function to find matching destinations with fuzzy logic
  const findSimilarDestinations = (
    searchDestination,
    allDestinations,
    threshold = 0.7
  ) => {
    const matches = [];

    for (const dest of allDestinations) {
      const similarity = calculateSimilarity(searchDestination, dest);
      if (similarity >= threshold) {
        matches.push({
          destination: dest,
          similarity: similarity,
          normalized: normalizeDestination(dest),
        });
      }
    }

    // Sort by similarity (highest first)
    matches.sort((a, b) => b.similarity - a.similarity);

    console.log(
      `[findSimilarDestinations] Search: "${searchDestination}" found ${matches.length} matches:`,
      matches
    );

    return matches;
  };

  // Function to filter and get latest freight rates by POD and shipping line
  const filterAndSortFreightRates = (ratesData, podDestination) => {
    if (!Array.isArray(ratesData) || !podDestination) return [];

    console.log(
      `[filterAndSortFreightRates] Searching for destination: "${podDestination}"`
    );

    // Get all unique POD destinations from the data
    const allPODs = [
      ...new Set(ratesData.map((rate) => rate.pod).filter(Boolean)),
    ];
    console.log("[filterAndSortFreightRates] All available PODs:", allPODs);

    // Find similar destinations using fuzzy matching
    const similarDestinations = findSimilarDestinations(
      podDestination,
      allPODs,
      0.6
    );
    const matchingPODs = similarDestinations.map((match) => match.destination);

    console.log(
      `[filterAndSortFreightRates] Matching PODs for "${podDestination}":`,
      matchingPODs
    );

    // Filter by matching PODs (using fuzzy matching results)
    const podFilteredRates = ratesData.filter(
      (rate) =>
        rate.pod &&
        matchingPODs.some(
          (matchingPOD) => rate.pod.toLowerCase() === matchingPOD.toLowerCase()
        )
    );

    console.log(
      `[filterAndSortFreightRates] Found ${podFilteredRates.length} rates matching similar destinations`
    );

    // Group by shipping line and get latest entry for each
    const latestRatesByLine = {};

    podFilteredRates.forEach((rate) => {
      const shippingLine =
        rate.shipping_lines || rate.shipping_line || "Unknown";
      const dateCreated = new Date(
        rate.created_at || rate.dateCreated || rate.date || Date.now()
      );

      if (
        !latestRatesByLine[shippingLine] ||
        dateCreated >
          new Date(
            latestRatesByLine[shippingLine].created_at ||
              latestRatesByLine[shippingLine].dateCreated ||
              latestRatesByLine[shippingLine].date
          )
      ) {
        latestRatesByLine[shippingLine] = {
          ...rate,
          created_at: rate.created_at || rate.dateCreated || rate.date,
          shipping_line: shippingLine,
        };
      }
    });

    return Object.values(latestRatesByLine);
  };

  // Helper function to get validity date from rate
  const getValidityDate = (rate) => {
    if (!rate) {
      console.log("[getValidityDate] No rate provided");
      return null;
    }

    console.log(
      "[getValidityDate] Processing rate:",
      JSON.stringify(rate, null, 2)
    );

    // List all possible validity date fields
    const possibleFields = [
      "validity",
      "validity_period",
      "valid_until",
      "expiry_date",
      "expires_at",
      "validity_date",
    ];

    // Check each field and log what we find
    for (const field of possibleFields) {
      if (rate[field]) {
        console.log(
          `[getValidityDate] Found ${field}:`,
          rate[field],
          "Type:",
          typeof rate[field]
        );

        // Skip boolean values
        if (typeof rate[field] === "boolean") {
          console.log(`[getValidityDate] Skipping boolean field ${field}`);
          continue;
        }

        // Try to parse as date
        const date = new Date(rate[field]);
        console.log(`[getValidityDate] Parsed ${field} to date:`, date);

        if (!isNaN(date.getTime())) {
          console.log(
            `[getValidityDate] Valid date found from ${field}:`,
            date
          );
          return date;
        }
      }
    }

    // If no explicit validity date, calculate from creation date (default 30 days)
    const createdFields = ["created_at", "dateCreated", "date", "createdAt"];
    for (const field of createdFields) {
      if (rate[field]) {
        console.log(
          `[getValidityDate] Found creation field ${field}:`,
          rate[field]
        );
        const createdDate = new Date(rate[field]);
        if (!isNaN(createdDate.getTime())) {
          const validityDays = 30;
          const calculatedDate = new Date(
            createdDate.getTime() + validityDays * 24 * 60 * 60 * 1000
          );
          console.log(
            `[getValidityDate] Calculated validity date (${field} + ${validityDays} days):`,
            calculatedDate
          );
          return calculatedDate;
        }
      }
    }

    console.log("[getValidityDate] No valid date found, returning null");
    return null;
  };

  // Helper function to format date as DD/MM/YYYY
  const formatDateDDMMYYYY = (date) => {
    if (!date || isNaN(date.getTime())) return "N/A";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // Helper function to check rate validity against current date (September 20, 2025)
  const getRateValidityStatus = (rate) => {
    if (!rate) return { isActive: false, statusText: "No Rate", className: "text-gray-400" };

    const validityDate = getValidityDate(rate);
    if (!validityDate) return { isActive: false, statusText: "No Validity", className: "text-gray-400" };

    // Current date is September 20, 2025
    const currentDate = new Date('2025-09-20');
    currentDate.setHours(0, 0, 0, 0);
    validityDate.setHours(0, 0, 0, 0);

    // Check if rate is active (validity date is today or in the future)
    const isActive = validityDate >= currentDate;

    return {
      isActive,
      statusText: isActive ? "Active" : "Expired", 
      className: isActive ? "text-green-600" : "text-red-600",
      formattedDate: formatDateDDMMYYYY(validityDate)
    };
  };

  // Enhanced function to find the most recent freight rate for a specific POD + shipping line combination
  const findMostRecentRate = (shippingLineName) => {
    console.log(`[findMostRecentRate] === STARTING SEARCH ===`);
    console.log(`[findMostRecentRate] Looking for POD: "${selectedPOD}"`);
    console.log(`[findMostRecentRate] Looking for Shipping Line: "${shippingLineName}"`);
    console.log(`[findMostRecentRate] Total freight rates available:`, freightRates?.length || 0);

    if (!freightRates || freightRates.length === 0) {
      console.log(`[findMostRecentRate] No freight rates data available`);
      return null;
    }
    if (!selectedPOD || !shippingLineName) {
      console.log(`[findMostRecentRate] Missing POD or shipping line name`);
      return null;
    }

    // Log a sample of available data for debugging
    console.log(`[findMostRecentRate] Sample freight rates:`, freightRates.slice(0, 3));

    // Find all rates that match BOTH the POD and shipping line
    const matchingRates = freightRates.filter((rate, index) => {
      // Check POD match (normalize both for comparison)
      const ratePOD = (rate.pod || '').toLowerCase().trim();
      const searchPOD = selectedPOD.toLowerCase().trim();
      
      // More flexible POD matching
      const podMatches = ratePOD.includes(searchPOD) || 
                        searchPOD.includes(ratePOD) ||
                        ratePOD === searchPOD;
      
      // Check shipping line match  
      const rateLine = (rate.shipping_line || rate.shipping_lines || '').toLowerCase().trim();
      const lineName = shippingLineName.toLowerCase().trim();
      
      // More flexible line matching
      const lineMatches = rateLine.includes(lineName) || 
                         lineName.includes(rateLine) ||
                         rateLine === lineName;
      
      const matches = podMatches && lineMatches;
      
      if (index < 5) { // Log first few for debugging
        console.log(`[findMostRecentRate] Rate ${index}: POD: "${ratePOD}" vs "${searchPOD}" = ${podMatches}, Line: "${rateLine}" vs "${lineName}" = ${lineMatches}, Overall: ${matches}`);
      }
      
      return matches;
    });

    console.log(`[findMostRecentRate] Found ${matchingRates.length} matching rates for POD + shipping line combination`);

    if (matchingRates.length === 0) {
      console.log(`[findMostRecentRate] No matching rates found - trying broader search...`);
      
      // Fallback: Try matching just the shipping line
      const lineOnlyRates = freightRates.filter(rate => {
        const rateLine = (rate.shipping_line || rate.shipping_lines || '').toLowerCase().trim();
        const lineName = shippingLineName.toLowerCase().trim();
        return rateLine.includes(lineName) || lineName.includes(rateLine);
      });
      
      console.log(`[findMostRecentRate] Line-only matching found ${lineOnlyRates.length} rates`);
      
      if (lineOnlyRates.length === 0) {
        return null;
      }
      
      // Use line-only rates as fallback
      matchingRates.push(...lineOnlyRates);
    }

    // Sort by createdAt date (newest first) and return the most recent
    matchingRates.sort((a, b) => {
      // Helper function to parse DD/MM/YYYY date format
      const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        
        // If it's already a Date object, return it
        if (dateStr instanceof Date) return dateStr;
        
        // Handle DD/MM/YYYY format (like "10/09/2025")
        if (typeof dateStr === 'string' && dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/').map(num => parseInt(num, 10));
          if (day && month && year) {
            return new Date(year, month - 1, day); // Month is 0-indexed
          }
        }
        
        // Fallback to standard Date parsing
        return new Date(dateStr);
      };

      // Use 'createdAt' as primary field (matches API example), with fallbacks
      const dateA = parseDate(a.createdAt || a.created_at || a.dateCreated || a.date);
      const dateB = parseDate(b.createdAt || b.created_at || b.dateCreated || b.date);
      
      console.log(`[findMostRecentRate] Comparing dates: "${a.createdAt || a.created_at}" (${dateA.getTime()}) vs "${b.createdAt || b.created_at}" (${dateB.getTime()})`);
      
      return dateB.getTime() - dateA.getTime();
    });

    const mostRecentRate = matchingRates[0];
    
    // Log all matching rates to show the date comparison process
    console.log(`[findMostRecentRate] All matching rates sorted by date (newest first):`, 
      matchingRates.map((rate, index) => ({
        index,
        shippingLine: rate.shipping_lines,
        pod: rate.pod,
        createdAt: rate.createdAt || rate.created_at,
        ocean_freight: rate.ocean_freight,
        isSelected: index === 0
      }))
    );
    
    console.log(`[findMostRecentRate] Selected most recent rate for "${shippingLineName}":`, {
      id: mostRecentRate._id,
      shipping_lines: mostRecentRate.shipping_lines,
      pod: mostRecentRate.pod,
      ocean_freight: mostRecentRate.ocean_freight,
      validity: mostRecentRate.validity,
      createdAt: mostRecentRate.createdAt || mostRecentRate.created_at,
      container_type: mostRecentRate.container_type
    });
    
    console.log(`[findMostRecentRate] === SEARCH COMPLETE ===`);
    return mostRecentRate; // Return the most recent rate
  };

  // Helper function to create unique rate identifier
  const createRateIdentifier = (rate) => {
    if (!rate) return "unknown-unknown-unknown";

    const id = rate._id || rate.id || "unknown";
    const shippingLine = (
      rate.shipping_lines ||
      rate.shipping_line ||
      "unknown"
    ).replace(/\s+/g, "_");
    const pod = rate.pod || selectedPOD || "unknown";

    console.log("[POD_lines] Creating rate identifier from:", {
      rate,
      id,
      shippingLine: rate.shipping_lines || rate.shipping_line,
      pod: rate.pod || selectedPOD,
    });

    const identifier = `${id}-${shippingLine}-${pod}`;
    console.log("[POD_lines] Generated rate identifier:", identifier);

    return identifier;
  };

  // Handle navigation to rates page with specific rate data
  const handleRateNavigation = (rate) => {
    if (!rate) {
      console.error(
        "[POD_lines] No rate data provided to handleRateNavigation"
      );
      return;
    }

    console.log("[POD_lines] Navigating with rate data:", rate);
    console.log("[POD_lines] Selected POD:", selectedPOD);

    // Create unique rate identifier
    const rateIdentifier = createRateIdentifier(rate);
    console.log("[POD_lines] Created rate identifier:", rateIdentifier);

    // Create comprehensive navigation state for auto-highlighting
    const navigationState = {
      // Rate identification
      rateIdentifier: rateIdentifier,
      rateId: rate._id || rate.id,

      // Auto-action configuration
      autoActions: {
        highlight: true,
        expand: true,
        scroll: true,
      },

      // UI state for highlighting
      uiState: {
        highlightColor: "#fef3c7", // Yellow highlight
        highlightDuration: 4000, // 4 seconds
        scrollBehavior: "smooth",
      },

      // Rate details for reference
      rateDetails: {
        pod: rate.pod || selectedPOD,
        shippingLine: rate.shipping_line || rate.shipping_lines,
        freightRate: rate.ocean_freight || rate.freight_rate,
        validityDate: getValidityDate(rate),
        containerSize: rate.container_size,
        lastUpdated: rate.created_at || rate.dateCreated || rate.date,
      },

      // Legacy fields for backward compatibility
      pod: rate.pod || selectedPOD,
      shippingLine: rate.shipping_line || rate.shipping_lines,
      freightRate: rate.ocean_freight || rate.freight_rate,
      validityDate: getValidityDate(rate),
      containerSize: rate.container_size,
      autoOpen: true,
    };

    console.log("[POD_lines] Navigation state created:", navigationState);

    // Store in sessionStorage as backup
    sessionStorage.setItem(
      "rateNavigationState",
      JSON.stringify(navigationState)
    );

    // Check if rate is valid and log the decision
    const validityStatus = getRateValidityStatus(rate);
    const rateIsValid = validityStatus.isActive;
    console.log("[POD_lines] Rate validity check result:", rateIsValid);
    console.log("[POD_lines] Validity status:", validityStatus);
    console.log("[POD_lines] Rate data being checked:", rate);

    if (rateIsValid) {
      console.log("[POD_lines] Rate is VALID - Navigating to view_rates");
      navigate("/export/view_rates", { state: navigationState });
    } else {
      console.log("[POD_lines] Rate is EXPIRED - Navigating to expired_rates");
      navigate("/export/expired_rates", { state: navigationState });
    }
  };

  // Optimized data initialization using context
  useEffect(() => {
    console.log(
      "[POD_lines] Component mounted, checking data context state..."
    );
    console.log(
      "[POD_lines] isInitialized:",
      isInitialized,
      "isDataLoading:",
      isDataLoading
    );
    console.log(
      "[POD_lines] totalRates:",
      totalRates,
      "contextDestinations:",
      contextDestinations.length
    );

    if (isInitialized && contextDestinations.length > 0) {
      // Use pre-fetched data immediately
      console.log("[POD_lines] Using pre-fetched destinations from context");
      fetchAllDestinations();
    }

    // Display loading state if data is still being fetched
    if (isDataLoading) {
      setIsLoadingDestinations(true);
    } else {
      setIsLoadingDestinations(false);
    }

    // Handle any context errors
    if (dataError) {
      setError(dataError);
    }
  }, [isInitialized, isDataLoading, dataError, contextDestinations]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-container")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update suggestions visibility based on filtered suggestions
  useEffect(() => {
    setShowSuggestions(
      debouncedSearchInput.length > 0 && filteredSuggestions.length > 0
    );
  }, [debouncedSearchInput, filteredSuggestions]);

  // Handle POD selection and display shipping lines
  const handlePODSelection = async (podName) => {
    setSelectedPOD(podName);
    setSearchInput(podName);
    setShowSuggestions(false);
    setHasSearched(true);
    setCurrentPage(1);
    setAnimatingRows(new Set());

    // Find the selected destination and extract shipping lines
    const selectedDestination = allDestinations.find(
      (dest) => dest.destinationName === podName
    );

    if (selectedDestination && selectedDestination.shippingLines) {
      const lines = selectedDestination.shippingLines
        .filter((line) => line.isActive !== false) // Only show active lines
        .map((line) => ({
          name: line.lineName || line.name,
          isActive: line.isActive,
        }));

      setShippingLines(lines);

      // Trigger lazy loading animation for rows
      setTimeout(() => {
        lines.slice(0, itemsPerPage).forEach((_, index) => {
          triggerRowAnimation(index);
        });
      }, 100);
    } else {
      setShippingLines([]);
    }

    // Fetch freight rates for the selected POD
    await fetchFreightRates(podName);
  };

  // Handle search input changes
  const handleSearchInputChange = (value) => {
    setSearchInput(value);
    setShowSuggestions(value.length > 0 && filteredSuggestions.length > 0);

    // If input is cleared, reset everything
    if (value === "") {
      setSelectedPOD("");
      setHasSearched(false);
      setShippingLines([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    handlePODSelection(suggestion.destinationName);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (!searchInput.trim()) {
      return;
    }

    // Find exact match first
    const exactMatch = allDestinations.find(
      (dest) =>
        dest.destinationName.toLowerCase() === searchInput.toLowerCase().trim()
    );

    if (exactMatch) {
      handlePODSelection(exactMatch.destinationName);
    } else {
      // If no exact match, try partial match
      const partialMatch = allDestinations.find((dest) =>
        dest.destinationName
          .toLowerCase()
          .includes(searchInput.toLowerCase().trim())
      );

      if (partialMatch) {
        handlePODSelection(partialMatch.destinationName);
      } else {
        setError(`No destination found matching "${searchInput}"`);
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  // Updated handleSubmit function to use selected POD
  const handleSubmit = async (e) => {
    e.preventDefault();
    handleSearchSubmit(e);
  };

  const handleReset = () => {
    setSelectedPOD("");
    setSearchInput("");
    setShippingLines([]);
    setFreightRates([]);
    setHasSearched(false);
    setIsLoading(false);
    setFreightRatesLoading(false);
    setCurrentPage(1);
    setAnimatingRows(new Set());
    setError("");
    setShowSuggestions(false);
  };

  const handleRefresh = async () => {
    console.log("[POD_lines] Manual refresh requested");
    setError("");

    try {
      // Use context refresh for optimized data fetching
      await refreshData();

      // Update local destinations after global refresh
      await fetchAllDestinations();

      // If POD is selected, refresh its freight rates too
      if (selectedPOD) {
        await fetchFreightRates(selectedPOD);
      }

      console.log("[POD_lines] Refresh completed successfully");
    } catch (error) {
      console.error("[POD_lines] Refresh failed:", error);
      setError("Failed to refresh data. Please try again.");
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setAnimatingRows(new Set());

      // Trigger animation for new page items
      setTimeout(() => {
        currentItems.forEach((_, index) => {
          triggerRowAnimation(index);
        });
      }, 100);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  // Check user authentication and name
  useEffect(() => {
    const token = localStorage.getItem("token");
    const name =
      localStorage.getItem("username") ||
      localStorage.getItem("userEmail") ||
      "";

    setIsLoggedIn(!!token);
    setUserName(name);
  }, []);

  // Check if user has admin access based on name
  const hasAdminAccess = () => {
    const adminNames = ["Ravi", "Harmeet", "Vikram"];
    const currentName = userName.toLowerCase();

    return (
      isLoggedIn &&
      adminNames.some((name) => currentName.includes(name.toLowerCase()))
    );
  };

  const handleAddPODData = () => {
    navigate("/pod_management");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-2">
            <LuFileSpreadsheet className="text-2xl text-blue-600 mr-2" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Shipping Lines Directory
            </h1>
          </div>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Select a destination port to discover all shipping lines serving
            that route from Indian ports
          </p>
          <div className="mt-2 flex justify-center items-center space-x-4 flex-wrap">
            <span className="text-xs text-gray-500">
              {isLoadingDestinations
                ? "Loading destinations..."
                : `${allDestinations.length} destinations available`}
            </span>

            {/* Performance Status Indicator */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isInitialized
                    ? "bg-green-500"
                    : isDataLoading
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-xs text-gray-500">
                {isInitialized
                  ? `${totalRates} freight rates ready`
                  : isDataLoading
                  ? "Loading data..."
                  : "Data not loaded"}
              </span>
            </div>

            {!isLoadingDestinations && (
              <button
                onClick={handleRefresh}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors duration-200"
                disabled={isDataLoading}
              >
                <LuRefreshCw
                  className={`text-xs ${isDataLoading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-2">⚠️</div>
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Selection Form */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 mb-6 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Unified Search Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <HiOutlineGlobeAlt className="inline mr-1 text-blue-600 text-sm" />
                Search Destination (POD/FPOD)
                <span className="text-red-500 ml-1">*</span>
              </label>

              <div className="flex gap-3 items-start">
                <div className="flex-1 relative search-container">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400 text-base" />
                  </div>
                  <input
                    type="text"
                    placeholder="Type destination name (e.g., Singapore, Dubai, Rotterdam)..."
                    value={searchInput}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onFocus={() =>
                      setShowSuggestions(
                        searchInput.length > 0 && filteredSuggestions.length > 0
                      )
                    }
                    disabled={isLoadingDestinations}
                    className="block w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />

                  {/* Suggestions Dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {filteredSuggestions.map((destination, index) => (
                        <button
                          key={destination._id || index}
                          type="button"
                          onClick={() => handleSuggestionClick(destination)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-200 border-b border-gray-100 last:border-b-0 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <HiOutlineLocationMarker className="text-blue-600 mr-3 flex-shrink-0" />
                              <div>
                                <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                                  {destination.destinationName}
                                </span>
                              </div>
                            </div>
                            <LuShip className="text-gray-400 group-hover:text-blue-600 text-sm" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="submit"
                    disabled={!searchInput.trim() || isLoadingDestinations}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                  >
                    <div className="flex items-center">
                      <FiSearch className="mr-2 text-sm" />
                      Search
                    </div>
                  </button>

                  {hasSearched && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center">
                        <LuRefreshCw className="mr-2 text-sm" />
                        Reset
                      </div>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2 flex items-center space-x-2">
                {isDataLoading && (
                  <span className="flex items-center">
                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-1" />
                    Pre-loading freight rates...
                  </span>
                )}
                {!isDataLoading && (
                  <span>
                    {isLoadingDestinations
                      ? "Loading destinations..."
                      : debouncedSearchInput !== searchInput
                      ? "Searching..."
                      : searchInput
                      ? filteredSuggestions.length > 0
                        ? `${filteredSuggestions.length} instant suggestions`
                        : "No matching destinations found"
                      : isInitialized
                      ? `${totalRates} freight rates ready for instant search`
                      : `${allDestinations.length} destinations available - start typing to search`}
                  </span>
                )}
              </p>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Results Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-white text-2xl mr-3">
                    <LuShip />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Shipping Lines to {selectedPOD}
                      {freightRatesLoading && (
                        <span className="ml-2 text-sm font-normal text-blue-200">
                          • Loading freight rates...
                        </span>
                      )}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {totalItems} shipping lines found • Page {currentPage} of{" "}
                      {totalPages}
                      {freightRates.length > 0 && (
                        <span className="ml-2">
                          • {freightRates.length} freight rates available
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                    <span className="text-white text-sm font-medium">
                      Showing {startIndex + 1}-{Math.min(endIndex, totalItems)}{" "}
                      of {totalItems}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Content */}
            <div className="p-4 sm:p-6">
              {isLoading ? (
                // Loading Animation
                <div className="space-y-3">
                  {[...Array(8)].map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : shippingLines.length === 0 ? (
                <div className="text-center py-12">
                  <MdDirectionsBoat className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Shipping Lines Found
                  </h3>
                  <p className="text-gray-500">
                    No shipping lines are currently serving this destination
                    from Indian ports.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-sm border border-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th
                            scope="col"
                            className="w-16 px-2 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300"
                          >
                            <div className="flex items-center justify-center">
                              <span className="text-xs">S.No</span>
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300"
                          >
                            <div className="flex items-center">
                              <LuShip className="text-blue-600 mr-1.5 text-sm" />
                              <span className="text-xs">Shipping Line</span>
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300"
                          >
                            <div className="flex items-center justify-center">
                              <LuFileSpreadsheet className="text-green-600 mr-1.5 text-sm" />
                              <span className="text-xs">
                                Ocean Freight (USD)
                              </span>
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300"
                          >
                            <div className="flex items-center justify-center">
                              <LuCalendarDays className="text-blue-600 mr-1.5 text-sm" />
                              <span className="text-xs">Validity Date</span>
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300"
                          >
                            <div className="flex items-center justify-center">
                              <LuExternalLink className="text-purple-600 mr-1.5 text-sm" />
                              <span className="text-xs">Action</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentItems.map((line, index) => {
                          const globalIndex = startIndex + index;
                          const isAnimating = animatingRows.has(index);

                          // Find the most recent freight rate for this shipping line
                          const freightRate = findMostRecentRate(line.name);
                          
                          // Get validity status for the rate
                          const validityStatus = getRateValidityStatus(freightRate);

                          return (
                            <tr
                              key={globalIndex}
                              className={`hover:bg-blue-50 transition-all duration-500 group ${
                                isAnimating
                                  ? "opacity-100 translate-y-0"
                                  : "opacity-0 translate-y-4"
                              }`}
                              style={{
                                transitionDelay: isAnimating
                                  ? `${index * 50}ms`
                                  : "0ms",
                              }}
                            >
                              <td className="w-16 px-3 py-3 text-center border-r border-gray-200">
                                <div className="flex justify-center">
                                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm group-hover:from-blue-600 group-hover:to-indigo-700 transition-all duration-200">
                                    <span className="text-white text-xs font-bold">
                                      {globalIndex + 1}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 border-r border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200 truncate pr-2">
                                      {line.name}
                                    </div>
                                    <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mt-1 group-hover:w-16 transition-all duration-300"></div>
                                  </div>
                                  <div className="flex-shrink-0 bg-blue-50 rounded-full p-1.5 group-hover:bg-blue-100 transition-colors duration-200">
                                    <LuShip className="text-blue-600 text-xs" />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center border-r border-gray-200">
                                <div className="flex flex-col items-center">
                                  {freightRatesLoading ? (
                                    <div className="animate-pulse">
                                      <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
                                      <div className="h-2 bg-gray-200 rounded w-12"></div>
                                    </div>
                                  ) : freightRate ? (
                                    <>
                                      <span className={`text-lg font-bold ${validityStatus.className}`}>
                                        {freightRate.ocean_freight ||
                                          freightRate.freight_rate ||
                                          "N/A"}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {freightRate.container_type || "20 FT"}
                                      </span>
                                      <span className={`text-xs ${validityStatus.className} font-medium`}>
                                        {validityStatus.statusText} Rate
                                      </span>
                                    </>
                                  ) : (
                                    <div className="text-center">
                                      <span className="text-sm text-orange-600 font-medium">
                                        Rate Not Available
                                      </span>
                                      <div className="text-xs text-gray-500">
                                        No freight data found
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center border-r border-gray-200">
                                <div className="flex flex-col items-center justify-center">
                                  {freightRate ? (
                                    <div className="text-center">
                                      <div className={`font-medium text-sm ${validityStatus.className}`}>
                                        {validityStatus.formattedDate}
                                        <span className="text-xs block">
                                          {validityStatus.statusText} Rate
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center">
                                      <span className="text-sm text-gray-400">
                                        -
                                      </span>
                                      <div className="text-xs text-gray-400">
                                        No validity date
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center">
                                  {freightRate ? (
                                    <button
                                      onClick={() =>
                                        handleRateNavigation(freightRate)
                                      }
                                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 ${
                                        validityStatus.isActive
                                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                                          : "bg-red-100 text-red-700 hover:bg-red-200"
                                      }`}
                                      title={`Go to ${
                                        validityStatus.isActive
                                          ? "View Rates"
                                          : "Expired Rates"
                                      } page`}
                                    >
                                      <LuExternalLink className="text-sm" />
                                    </button>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                      <span className="text-gray-400 text-xs">
                                        -
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="bg-white px-4 py-3 border-t border-gray-200 rounded-b-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-700">
                            <span>
                              Showing{" "}
                              <span className="font-medium">
                                {startIndex + 1}
                              </span>{" "}
                              to{" "}
                              <span className="font-medium">
                                {Math.min(endIndex, totalItems)}
                              </span>{" "}
                              of{" "}
                              <span className="font-medium">{totalItems}</span>{" "}
                              results
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              <LuChevronLeft className="h-4 w-4" />
                            </button>

                            {getPageNumbers().map((pageNum, index) => (
                              <button
                                key={index}
                                onClick={() =>
                                  typeof pageNum === "number" &&
                                  handlePageChange(pageNum)
                                }
                                disabled={pageNum === "..."}
                                className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium transition-colors duration-200 ${
                                  pageNum === currentPage
                                    ? "z-10 bg-blue-600 border-blue-600 text-white"
                                    : pageNum === "..."
                                    ? "border-gray-300 bg-white text-gray-700 cursor-not-allowed"
                                    : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            ))}

                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              <LuChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compact Table Footer with Summary */}
                  <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 rounded-b-lg mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span className="truncate">
                        Total lines serving {selectedPOD}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold text-xs ml-2 flex-shrink-0">
                        {totalItems}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        {!hasSearched && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6">
            <div className="text-center mb-6">
              <HiOutlineGlobeAlt className="mx-auto text-4xl text-blue-300 mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Discover Global Shipping Routes
              </h3>
              <p className="text-gray-600 max-w-xl mx-auto text-xs sm:text-sm">
                Select any international destination from our comprehensive list
                to view all shipping lines from Indian ports to your chosen
                destination.
              </p>
            </div>

            {/* Quick Access to Popular Destinations */}
            {allDestinations.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                  Popular Destinations
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {allDestinations
                    .filter(
                      (dest) =>
                        dest.shippingLines && dest.shippingLines.length > 0
                    )
                    .sort(
                      (a, b) =>
                        (b.shippingLines?.length || 0) -
                        (a.shippingLines?.length || 0)
                    )
                    .slice(0, 8)
                    .map((destination, index) => (
                      <button
                        key={destination._id || index}
                        onClick={() => {
                          handlePODSelection(destination.destinationName);
                        }}
                        className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-3 text-left transition-all duration-200 group"
                      >
                        <div className="text-xs font-medium text-gray-900 group-hover:text-blue-700 truncate">
                          {destination.destinationName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {destination.shippingLines?.length || 0} lines
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Statistics */}
            {allDestinations.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {allDestinations.length}
                    </div>
                    <div className="text-xs text-gray-600">
                      Total Destinations
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {allDestinations.reduce(
                        (total, dest) =>
                          total + (dest.shippingLines?.length || 0),
                        0
                      )}
                    </div>
                    <div className="text-xs text-gray-600">Shipping Lines</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">
                      {
                        allDestinations.filter(
                          (dest) =>
                            dest.shippingLines && dest.shippingLines.length > 0
                        ).length
                      }
                    </div>
                    <div className="text-xs text-gray-600">Active Routes</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin Action Button - Only visible to authorized users */}
        {hasAdminAccess() && (
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-3 mr-4">
                  <LuSettings className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Data Management Panel
                  </h3>
                  <p className="text-sm text-gray-600">
                    Add new POD destinations and manage shipping lines
                  </p>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Authorized Access
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddPODData}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <LuPlus className="mr-2 text-lg" />
                <span className="font-medium">Manage POD Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default POD_lines;
