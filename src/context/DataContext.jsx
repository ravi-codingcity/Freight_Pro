import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create the DataContext
const DataContext = createContext();

// Custom hook to use the DataContext
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataContextProvider');
  }
  return context;
};

// DataContext Provider Component
export const DataContextProvider = ({ children }) => {
  // Global state for all freight rates data
  const [allFreightRates, setAllFreightRates] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]);
  
  // Loading and error states
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [error, setError] = useState('');
  
  // Cache configuration
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  const RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  // Helper function to sleep/delay
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Function to fetch all freight rates data with retry logic
  const fetchAllFreightRates = useCallback(async (retryCount = 0) => {
    console.log('[DataContext] Fetching all freight rates data...');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://freightpro-4kjlzqm0.b4a.run/api/forms/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[DataContext] Freight rates data fetched successfully:', data?.length || 0, 'records');
      
      // Ensure we have an array
      const ratesArray = Array.isArray(data) ? data : [];
      
      setAllFreightRates(ratesArray);
      setLastFetchTime(new Date());
      setError('');
      
      return ratesArray;
      
    } catch (error) {
      console.error('[DataContext] Error fetching freight rates:', error);
      
      // Retry logic
      if (retryCount < RETRY_ATTEMPTS) {
        console.log(`[DataContext] Retrying... Attempt ${retryCount + 1}/${RETRY_ATTEMPTS}`);
        await sleep(RETRY_DELAY);
        return fetchAllFreightRates(retryCount + 1);
      }
      
      setError(`Failed to fetch freight rates: ${error.message}`);
      throw error;
    }
  }, []);

  // Function to fetch all destinations with retry logic
  const fetchAllDestinations = useCallback(async (retryCount = 0) => {
    console.log('[DataContext] Fetching all destinations...');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://freightpro-4kjlzqm0.b4a.run/api/destinations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[DataContext] Destinations data fetched successfully');
      
      // Handle different response structures
      let destinations = [];
      if (Array.isArray(data)) {
        destinations = data;
      } else if (data.data && Array.isArray(data.data)) {
        destinations = data.data;
      } else if (data.destinations && Array.isArray(data.destinations)) {
        destinations = data.destinations;
      }
      
      setAllDestinations(destinations);
      setError('');
      
      return destinations;
      
    } catch (error) {
      console.error('[DataContext] Error fetching destinations:', error);
      
      // Retry logic
      if (retryCount < RETRY_ATTEMPTS) {
        console.log(`[DataContext] Retrying destinations... Attempt ${retryCount + 1}/${RETRY_ATTEMPTS}`);
        await sleep(RETRY_DELAY);
        return fetchAllDestinations(retryCount + 1);
      }
      
      setError(`Failed to fetch destinations: ${error.message}`);
      throw error;
    }
  }, []);

  // Main function to initialize all data
  const initializeData = useCallback(async (force = false) => {
    // Check if data is already fresh and we're not forcing a refresh
    if (!force && isInitialized && lastFetchTime && 
        (new Date() - lastFetchTime) < CACHE_DURATION) {
      console.log('[DataContext] Data is fresh, skipping fetch');
      return;
    }

    setIsDataLoading(true);
    setError('');
    
    try {
      console.log('[DataContext] Initializing data...');
      
      // Fetch both datasets in parallel for better performance
      const [ratesData, destinationsData] = await Promise.all([
        fetchAllFreightRates(),
        fetchAllDestinations()
      ]);
      
      console.log('[DataContext] Data initialization completed successfully');
      console.log('[DataContext] Freight rates:', ratesData?.length || 0);
      console.log('[DataContext] Destinations:', destinationsData?.length || 0);
      
      setIsInitialized(true);
      
    } catch (error) {
      console.error('[DataContext] Failed to initialize data:', error);
      setError(`Failed to initialize data: ${error.message}`);
    } finally {
      setIsDataLoading(false);
    }
  }, [fetchAllFreightRates, fetchAllDestinations, isInitialized, lastFetchTime]);

  // Function to refresh data manually
  const refreshData = useCallback(() => {
    console.log('[DataContext] Manual data refresh requested');
    return initializeData(true);
  }, [initializeData]);

  // Function to check if data needs refresh
  const isDataStale = useCallback(() => {
    if (!lastFetchTime) return true;
    return (new Date() - lastFetchTime) > CACHE_DURATION;
  }, [lastFetchTime]);

  // Advanced filtering function with fuzzy matching for POD destinations
  const getFreightRatesByPOD = useCallback((podDestination) => {
    if (!podDestination || !allFreightRates.length) return [];
    
    console.log(`[DataContext] Filtering freight rates for POD: "${podDestination}"`);
    
    // Helper function to normalize destination names for matching
    const normalizeDestination = (destination) => {
      if (!destination) return '';
      
      return destination
        .toLowerCase()
        .trim()
        .replace(/[,\.\-_]/g, ' ')  // Replace punctuation with spaces
        .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
        .replace(/\b(saudi arabia|Argentina|australia|uae|Bangladesh|angola|united arab emirates|cameron|china|india|germany|netherlands|belgium|italy|indonesia|ecuador|mexico|colombia|egypt|vietnam|sri lanka|russia|us|israel|france|uk|oman|united kingdom|usa|united states|port|peru|harbor|NY|japan|uruguay|algeria|harbour)\b/g, '')  // Remove country names
        .replace(/\b(port of|port)\b/g, '')  // Remove "port of" prefix
        .trim();
    };

    // Helper function to calculate similarity between two strings
    const calculateSimilarity = (str1, str2) => {
      const normalized1 = normalizeDestination(str1);
      const normalized2 = normalizeDestination(str2);
      
      // Exact match after normalization
      if (normalized1 === normalized2) return 1.0;
      
      // Check if one contains the other
      if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
        return 0.9;
      }
      
      // Word-based similarity using Jaccard index
      const words1 = normalized1.split(' ').filter(w => w.length > 0);
      const words2 = normalized2.split(' ').filter(w => w.length > 0);
      
      if (words1.length === 0 || words2.length === 0) return 0;
      
      const set1 = new Set(words1);
      const set2 = new Set(words2);
      
      const intersection = new Set([...set1].filter(x => set2.has(x)));
      const union = new Set([...set1, ...set2]);
      
      return intersection.size / union.size;
    };

    // Find similar destinations
    const findSimilarDestinations = (searchDestination, threshold = 0.6) => {
      const allPODs = [...new Set(allFreightRates.map(rate => rate.pod).filter(Boolean))];
      
      return allPODs
        .map(pod => ({
          destination: pod,
          similarity: calculateSimilarity(searchDestination, pod)
        }))
        .filter(match => match.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity);
    };

    // Get all unique POD destinations from the data
    const similarDestinations = findSimilarDestinations(podDestination, 0.6);
    const matchingPODs = similarDestinations.map(match => match.destination);
    
    console.log(`[DataContext] Found ${matchingPODs.length} matching PODs:`, matchingPODs);
    
    // Filter by matching PODs (using fuzzy matching results)
    const podFilteredRates = allFreightRates.filter(rate => 
      rate.pod && matchingPODs.some(matchingPOD => 
        rate.pod.toLowerCase() === matchingPOD.toLowerCase()
      )
    );
    
    console.log(`[DataContext] Found ${podFilteredRates.length} rates for matching PODs, now sorting by date...`);
    
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

    // Sort all filtered rates by creation date (newest first) to ensure we process latest rates first
    podFilteredRates.sort((a, b) => {
      const dateA = parseDate(a.createdAt || a.created_at || a.dateCreated || a.date);
      const dateB = parseDate(b.createdAt || b.created_at || b.dateCreated || b.date);
      return dateB.getTime() - dateA.getTime(); // Newest first
    });
    
    // Group by shipping line and get the latest (first) entry for each shipping line
    const latestRatesByLine = {};
    
    podFilteredRates.forEach(rate => {
      const shippingLine = rate.shipping_lines || rate.shipping_line || 'Unknown';
      
      // Since rates are sorted by date (newest first), only take the first occurrence for each shipping line
      if (!latestRatesByLine[shippingLine]) {
        latestRatesByLine[shippingLine] = {
          ...rate,
          created_at: rate.createdAt || rate.created_at || rate.dateCreated || rate.date,
          shipping_line: shippingLine
        };
      }
    });

    // Convert to array and sort final results by creation date (newest first) for consistent display
    const filteredRates = Object.values(latestRatesByLine).sort((a, b) => {
      const dateA = parseDate(a.createdAt || a.created_at || a.dateCreated || a.date);
      const dateB = parseDate(b.createdAt || b.created_at || b.dateCreated || b.date);
      return dateB.getTime() - dateA.getTime(); // Newest first
    });
    console.log(`[DataContext] Returning ${filteredRates.length} freight rates after filtering and grouping`);
    
    return filteredRates;
  }, [allFreightRates]);

  // Function to get count of all unique shipping lines for a POD destination
  const getShippingLinesCountByPOD = useCallback((podDestination) => {
    if (!podDestination || !allFreightRates.length) {
      return 0;
    }
    
    // Helper function to normalize destination names for matching
    const normalizeDestination = (destination) => {
      if (!destination) return '';
      
      return destination
        .toLowerCase()
        .trim()
        .replace(/[,\.\-_]/g, ' ')  // Replace punctuation with spaces
        .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
        .replace(/\b(saudi arabia|uae|ksa|india|china|usa|uk)\b/g, '')  // Remove country names
        .replace(/\b(port of|port)\b/g, '')  // Remove "port of" prefix
        .trim();
    };

    // Helper function to calculate similarity between two strings
    const calculateSimilarity = (str1, str2) => {
      const normalized1 = normalizeDestination(str1);
      const normalized2 = normalizeDestination(str2);
      
      // Exact match after normalization
      if (normalized1 === normalized2) return 1.0;
      
      // Check if one contains the other
      if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
        return 0.9;
      }
      
      // Word-based similarity using Jaccard index
      const words1 = normalized1.split(' ').filter(w => w.length > 0);
      const words2 = normalized2.split(' ').filter(w => w.length > 0);
      
      if (words1.length === 0 || words2.length === 0) return 0;
      
      const set1 = new Set(words1);
      const set2 = new Set(words2);
      
      const intersection = new Set([...set1].filter(x => set2.has(x)));
      const union = new Set([...set1, ...set2]);
      
      return intersection.size / union.size;
    };

    // Find similar destinations
    const findSimilarDestinations = (searchDestination, threshold = 0.6) => {
      const allPODs = [...new Set(allFreightRates.map(rate => rate.pod).filter(Boolean))];
      
      return allPODs
        .map(pod => ({
          destination: pod,
          similarity: calculateSimilarity(searchDestination, pod)
        }))
        .filter(match => match.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity);
    };

    // Get all unique POD destinations from the data - use lower threshold for counting
    const similarDestinations = findSimilarDestinations(podDestination, 0.3);
    let matchingPODs = similarDestinations.map(match => match.destination);
    
    // ALSO add exact match check (case-insensitive) to ensure we don't miss obvious matches
    const allPODs = [...new Set(allFreightRates.map(rate => rate.pod).filter(Boolean))];
    const exactMatches = allPODs.filter(pod => 
      pod && pod.toLowerCase() === podDestination.toLowerCase()
    );
    
    // Combine exact matches and fuzzy matches, removing duplicates
    matchingPODs = [...new Set([...exactMatches, ...matchingPODs])];
    
    // Filter by matching PODs (using fuzzy matching results)
    const podFilteredRates = allFreightRates.filter(rate => 
      rate.pod && matchingPODs.some(matchingPOD => 
        rate.pod.toLowerCase() === matchingPOD.toLowerCase()
      )
    );
    
    // Get ALL unique shipping lines (without grouping by latest)
    const allShippingLineNames = podFilteredRates
      .map(rate => rate.shipping_lines || rate.shipping_line)
      .filter(Boolean)
      .map(line => line.trim()); // Trim whitespace for accurate matching
    
    const uniqueShippingLines = [...new Set(allShippingLineNames)];
    
    const count = uniqueShippingLines.length;
    
    // Only log for debugging specific cases
    if (podDestination.toLowerCase().includes('jeddah')) {
      console.log(`[DataContext] JEDDAH DEBUG - Found ${count} unique shipping lines:`, uniqueShippingLines);
      console.log(`[DataContext] JEDDAH DEBUG - Matching PODs:`, matchingPODs);
      console.log(`[DataContext] JEDDAH DEBUG - Total filtered rates:`, podFilteredRates.length);
    }
    
    return count;
  }, [allFreightRates]);

  // Auto-initialize data when token is available
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isInitialized && !isDataLoading) {
      console.log('[DataContext] Token found, auto-initializing data...');
      initializeData();
    }
  }, [initializeData, isInitialized, isDataLoading]);

  // Set up periodic data refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDataStale() && !isDataLoading) {
        console.log('[DataContext] Data is stale, refreshing automatically...');
        initializeData();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [initializeData, isDataStale, isDataLoading]);

  // Context value
  const contextValue = {
    // Data
    allFreightRates,
    allDestinations,
    
    // States
    isDataLoading,
    isInitialized,
    lastFetchTime,
    error,
    
    // Functions
    initializeData,
    refreshData,
    isDataStale,
    getFreightRatesByPOD,
    getShippingLinesCountByPOD,
    
    // Stats
    totalRates: allFreightRates.length,
    totalDestinations: allDestinations.length
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};