import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "../components/Navbar";
// Import all user profile images
import harmeetImg from "../assets/harmeet.jpg";
import vikramImg from "../assets/vikram.jpg";
import kapilImg from "../assets/kapil.jpg";
import rajeevImg from "../assets/omtrans.jpg"; // Using default for Rajeev if no specific image
// Default profile image for fallback
import defaultUserImg from "../assets/omtrans.jpg";

function Expired_rates() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  // New filter states
  const [showOnlyWithRemarks, setShowOnlyWithRemarks] = useState(false);
  const [selectedPOL, setSelectedPOL] = useState("");
  const [selectedPOD, setSelectedPOD] = useState("");
  const [uniquePOLs, setUniquePOLs] = useState([]);
  const [uniquePODs, setUniquePODs] = useState([]);

  // Add optimization with useMemo for frequently accessed data
  const userImages = useMemo(
    () => ({
      Vikram: vikramImg,
      Harmeet: harmeetImg,
      Kapil: kapilImg,
     
    }),
    []
  );

  // Function to get user profile image by name - optimized with useCallback
  const getUserProfileImage = useCallback(
    (name) => {
      return userImages[name] || defaultUserImg;
    },
    [userImages]
  );

  // Memoize user data
  const userProfiles = useMemo(
    () => ({
      Vikram: { branch: "Delhi", phoneNumber: "123456789" },
      Harmeet: { branch: "Mumbai", phoneNumber: "987654321" },
      Rajeev: { branch: "Kolkata", phoneNumber: "972586412" },
      Kapil: { branch: "Bangalore", phoneNumber: "456789123" },
    }),
    []
  );

  const getUserData = useCallback(
    (name) => {
      return userProfiles[name] || { branch: "N/A", phoneNumber: "N/A" };
    },
    [userProfiles]
  );

  // Optimize other functions with useCallback for better performance
  const isValidityExpired = useCallback((validityDate) => {
    if (!validityDate) return false;

    try {
      const validDate = new Date(validityDate);
      if (isNaN(validDate.getTime())) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      validDate.setHours(0, 0, 0, 0);

      return validDate < today;
    } catch (e) {
      console.error("Error checking validity expiration:", e);
      return false;
    }
  }, []);

  const toggleRowExpansion = useCallback((id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-GB");
    } catch (e) {
      return "Invalid Date";
    }
  }, []);

  const clearAllFilters = useCallback(() => {
    setShowOnlyWithRemarks(false);
    setSelectedPOL("");
    setSelectedPOD("");
  }, []);

  // Add this utility function at the top of your component
  const handleAuthError = (error) => {
    if (error?.response?.status === 401 || error?.message?.includes('token')) {
      // Clear user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('currentUser');
      
      // Alert the user
      alert('Your session has expired. Please login again.');
      
      // Redirect to login page
      window.location.href = '/';
      return true;
    }
    return false;
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem("currentUser") || "";
    setCurrentUser(loggedInUser);

    // Check if token exists
    const token = localStorage.getItem("token");
    if (!token) {
      // If no token exists, redirect to login
      alert('Authentication required. Please login.');
      window.location.href = '/';
      return;
    }

    // Add AbortController for proper fetch cleanup
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchAllForms = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("https://freightpro-4kjlzqm0.b4a.run/api/forms/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          signal, // Pass the signal to make the fetch abortable
        });

        if (response.status === 401) {
          // Handle expired token
          handleAuthError({ response: { status: 401 } });
          return;
        }

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const forms = await response.json();

        const sortedData = forms.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Extract unique POLs and PODs using more efficient Set operations
        const polSet = new Set();
        const podSet = new Set();

        sortedData.forEach((form) => {
          if (form.pol) polSet.add(form.pol);
          // Use fdrr if present, otherwise pod
          const podValue = form.fdrr ? form.fdrr : form.pod;
          if (podValue) podSet.add(podValue);
        });

        setUniquePOLs([...polSet].sort());
        setUniquePODs([...podSet].sort());

        setData(sortedData);

        const expiredCards = sortedData.filter((item) =>
          isValidityExpired(item.validity)
        );

        setFilteredData(expiredCards);
      } catch (error) {
        // Only set error if the fetch wasn't aborted
        if (!signal.aborted) {
          // Check if this is an auth error
          if (!handleAuthError(error)) {
            console.error("Error fetching forms:", error);
            setError("Failed to fetch data. Please try again later.");
          }
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAllForms();

    // Cleanup function to abort fetch request if component unmounts
    return () => controller.abort();
  }, [isValidityExpired]);

  // Optimize filter logic with useMemo
  useEffect(() => {
    if (!data.length) return;

    // First filter expired cards
    const expiredCards = data.filter((item) =>
      isValidityExpired(item.validity)
    );

    // Then apply all the other filters
    const filtered = expiredCards.filter((item) => {
      // Remarks filter
      if (
        showOnlyWithRemarks &&
        (!item.remarks || item.remarks.trim().length === 0)
      ) {
        return false;
      }

      // POL filter
      if (selectedPOL && item.pol !== selectedPOL) {
        return false;
      }

      // POD filter
      if (selectedPOD && (item.fdrr ? item.fdrr : item.pod) !== selectedPOD) {
        return false;
      }

      return true;
    });

    setFilteredData(filtered);
  }, [data, showOnlyWithRemarks, selectedPOL, selectedPOD, isValidityExpired]);

  // Optimize weight rates formatting with caching
  const weightRatesCache = useMemo(() => new Map(), []);

  // Add rail freight rates cache for better performance
  const railFreightRatesCache = useMemo(() => new Map(), []);

  const formatWeightRatesForDisplay = useCallback(
    (weightRatesString) => {
      if (!weightRatesString) return "N/A";

      // Create a cache key based on the input type
      const cacheKey =
        typeof weightRatesString === "string"
          ? weightRatesString
          : JSON.stringify(weightRatesString);

      // Check cache first for better performance
      if (weightRatesCache.has(cacheKey)) {
        return weightRatesCache.get(cacheKey);
      }

      try {
        let result;
        if (typeof weightRatesString === "string") {
          const ratesObj = JSON.parse(weightRatesString);
          const containerType = Object.keys(ratesObj)[0]; // Get first container type (20ft or 40ft)
          if (!containerType) return "No rates defined";

          result = (
            <div className="flex flex-col gap-1 mt-1">
              {Object.entries(ratesObj[containerType]).map(
                ([weight, price]) => (
                  <span key={weight} className="text-xs">
                    <span className="font-medium">Weight:</span> {weight} Ton:{" "}
                    <span className="text-blue-600">{price}</span>
                    <span className="text-gray-500"> /Container</span>
                  </span>
                )
              )}
            </div>
          );
        } else if (typeof weightRatesString === "object") {
          const containerType = Object.keys(weightRatesString)[0];
          if (!containerType) return "No rates defined";

          result = (
            <div className="grid grid-cols-3 gap-2 mt-1">
              {Object.entries(weightRatesString[containerType]).map(
                ([weight, price]) => (
                  <span key={weight} className="text-xs">
                    <span className="font-medium">Weight:</span> {weight} Ton:{" "}
                    <span className="text-blue-600">{price}</span>
                  </span>
                )
              )}
            </div>
          );
        } else {
          result = "Invalid format";
        }

        // Cache the result for future use
        weightRatesCache.set(cacheKey, result);
        return result;
      } catch (error) {
        console.error("Error formatting weight rates:", error);
        return "Error displaying rates";
      }
    },
    [weightRatesCache]
  );

  // Add rail freight rates formatting function
  const formatRailFreightRatesForDisplay = useCallback(
    (railFreightRates, containerType) => {
      if (!railFreightRates) return "No rail freight rates available";

      // Create a cache key based on the input type and container type
      const cacheKey =
        (typeof railFreightRates === "string"
          ? railFreightRates
          : JSON.stringify(railFreightRates)) + (containerType || "");

      // Check cache first for better performance
      if (railFreightRatesCache.has(cacheKey)) {
        return railFreightRatesCache.get(cacheKey);
      }

      try {
        let ratesObj;
        // Handle string or object format
        if (typeof railFreightRates === "string") {
          ratesObj = JSON.parse(railFreightRates);
        } else {
          ratesObj = railFreightRates;
        }

        // Check if the object is empty
        if (!ratesObj || Object.keys(ratesObj).length === 0) {
          return "No rail freight rates available";
        }

        // Determine container size display based on container type
        const containerSize = containerType && 
          (containerType.startsWith("40") || containerType.startsWith("45")) 
          ? "40ft" 
          : "20ft";

        const result = (
          <div className="grid gap-1 mt-1">
            {Object.entries(ratesObj).map(([weightRange, rate]) => (
              <span key={weightRange} className="text-xs">
                <span className="font-medium">{containerSize}:</span> {weightRange}{" "}
                <span className="text-blue-600">{rate}</span>
                <span className="text-gray-500"> /Container</span>
              </span>
            ))}
          </div>
        );

        // Cache the result for future use
        railFreightRatesCache.set(cacheKey, result);
        return result;
      } catch (error) {
        console.error("Error formatting rail freight rates:", error);
        return "Error displaying rail freight rates";
      }
    },
    [railFreightRatesCache]
  );

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-2 sm:p-4 max-w-full">
        {/* Advanced Search Filters - Make responsive */}
        <div className="mt-1 bg-white rounded-xl shadow-sm overflow-hidden px-2 sm:px-6 mb-4">
          <div className="p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap justify-evenly">
              <div className="flex justify-around items-center w-full sm:w-auto gap-3">
                {/* POL Filter */}
                <div className="w-full sm:max-w-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2 sm:p-3 border border-gray-200 hover:shadow-md transition-shadow duration-200 flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Port of Loading (POL)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-4 w-4 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </div>
                    <select
                      value={selectedPOL}
                      onChange={(e) => setSelectedPOL(e.target.value)}
                      className="appearance-none pl-10 pr-8 py-2 w-full bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">POL - Any</option>
                      {uniquePOLs.map((pol) => (
                        <option key={pol} value={pol}>
                          {pol}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* POD Filter */}
                <div className="w-full sm:max-w-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-2 sm:p-3 border border-gray-200 hover:shadow-md transition-shadow duration-200 flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Port of Delivery (POD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-4 w-4 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017a2 2 0 01-1.789-2.894l3.5-7A2 2 0 0114 10z"
                        />
                      </svg>
                    </div>
                    <select
                      value={selectedPOD}
                      onChange={(e) => setSelectedPOD(e.target.value)}
                      className="appearance-none pl-10 pr-8 py-2 w-full bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">POD - Any</option>
                      {uniquePODs.map((pod) => (
                        <option key={pod} value={pod}>
                          {pod}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks Filter */}
              <div className="w-full sm:max-w-64 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-2 sm:p-3 border border-gray-200 hover:shadow-md transition-shadow duration-200 flex-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Remarks
                </label>
                <button
                  onClick={() => setShowOnlyWithRemarks(!showOnlyWithRemarks)}
                  className={`flex items-center justify-between w-full px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    showOnlyWithRemarks
                      ? "bg-yellow-200 text-yellow-900 border border-yellow-300"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center">
                    <svg
                      className={`w-4 h-4 mr-2 ${
                        showOnlyWithRemarks
                          ? "text-yellow-600"
                          : "text-gray-500"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Only With Remarks</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      showOnlyWithRemarks ? "bg-yellow-500" : "bg-gray-200"
                    }`}
                  >
                    {showOnlyWithRemarks && (
                      <svg
                        className="w-3 h-3 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Active filters display */}
            {(showOnlyWithRemarks || selectedPOL || selectedPOD) && (
              <div className="mt-4 pt-4 border-t border-gray-200 overflow-x-auto">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Active Filters:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {showOnlyWithRemarks && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 group">
                      <svg
                        className="h-3 w-3 mr-1 text-yellow-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Has Remarks
                      <button
                        onClick={() => setShowOnlyWithRemarks(false)}
                        className="ml-1.5 text-yellow-500 opacity-60 group-hover:opacity-100 hover:text-yellow-700 focus:outline-none"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  )}

                  {selectedPOL && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 group">
                      <svg
                        className="h-3 w-3 mr-1 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      POL: {selectedPOL}
                      <button
                        onClick={() => setSelectedPOL("")}
                        className="ml-1.5 text-blue-500 opacity-60 group-hover:opacity-100 hover:text-blue-700 focus:outline-none"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  )}

                  {selectedPOD && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 group">
                      <svg
                        className="h-3 w-3 mr-1 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017a2 2 0 01-1.789-2.894l3.5-7A2 2 0 0114 10z"
                        />
                      </svg>
                      POD: {selectedPOD}
                      <button
                        onClick={() => setSelectedPOD("")}
                        className="ml-1.5 text-indigo-500 opacity-60 group-hover:opacity-100 hover:text-indigo-700 focus:outline-none"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Loading State with Skeleton UI */}
        {loading && (
          <div className="animate-pulse">
            {/* Loading spinner at the top */}
            <div className="flex justify-center my-6">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
            </div>

            {/* Stats Bar Skeleton */}
            <div className="flex flex-wrap gap-3 items-center justify-between mb-5 bg-white p-3 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-lg mr-2 h-9 w-9"></div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
              </div>

              <div className="bg-red-50 rounded-lg px-4 py-3 h-10 w-48">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>

            {/* Table Skeleton */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-red-300">
              {/* Table Header Skeleton */}
              <div className="grid grid-cols-8 gap-4 bg-red-50 px-3 py-3 border-b border-red-200">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-5 bg-red-100 rounded"></div>
                ))}
              </div>

              {/* Table Rows Skeleton */}
              {[...Array(5)].map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-8 gap-4 px-3 py-4 border-b border-gray-200"
                >
                  {/* User column skeleton */}
                  <div className="flex items-center">
                    <div className="rounded-full bg-gray-200 h-10 w-10 mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>

                  {/* Other columns */}
                  {[...Array(6)].map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className="flex flex-col justify-center"
                    >
                      <div className="h-4 bg-gray-200 rounded w-full max-w-[120px]"></div>
                      {colIndex === 5 && (
                        <div className="h-5 bg-red-100 rounded w-24 mt-1"></div>
                      )}
                    </div>
                  ))}

                  {/* Action button column */}
                  <div className="flex justify-center">
                    <div className="h-8 bg-red-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State - Keep existing implementation */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter summary and action bar */}
        {!loading && !error && (
          <div className="flex flex-col mb-3 bg-white p-3 rounded-xl shadow-sm mx-4">
            {/* Top row container for mobile and desktop */}
            <div className="flex flex-col justify-between items-center w-full gap-2 sm:gap-3">
              {/* Filters label and rates count - stacked in column on mobile, row on desktop */}
              <div className="flex flex-row items-center sm:items-center justify-between w-full ">
                {/* Filters label with count */}
                <div className="flex items-center w-full sm:w-auto  sm:justify-start">
                  <div className="bg-red-100 p-1.5 sm:p-2 rounded-lg mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5 text-red-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-base font-medium text-gray-700">
                    Filters
                  </h3>
                  {(showOnlyWithRemarks || selectedPOL || selectedPOD) && (
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full ml-2">
                      {
                        [showOnlyWithRemarks, selectedPOL, selectedPOD].filter(
                          Boolean
                        ).length
                      }
                    </span>
                  )}
                </div>

                {/* Showing rates count - below filters on mobile, same row on desktop */}
                <div className="bg-red-50 text-red-700 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 font-medium inline-flex items-center justify-center w-full sm:w-auto text-xs sm:text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  Showing{" "}
                  <span className="font-bold ml-1">{filteredData.length} </span>{" "}
                  <span className="ml-1">
                    expired rate{filteredData.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Reset filters button - below on both mobile and desktop */}
              <div className="w-full">
                {(showOnlyWithRemarks || selectedPOL || selectedPOD) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-700 flex items-center bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md shadow-sm font-bold transition-colors duration-200 w-full justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Reset filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No results message */}
        {!loading && !error && filteredData.length === 0 && (
          <div className="bg-gray-50 rounded-xl p-4 sm:p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mt-4">
              {showOnlyWithRemarks || selectedPOL || selectedPOD
                ? "No results matching your filters"
                : "No expired rates found"}
            </h3>
            <p className="text-gray-500 mt-2">
              {showOnlyWithRemarks || selectedPOL || selectedPOD
                ? "Try adjusting your filter criteria"
                : "All your rate cards appear to be valid at this time"}
            </p>
            {(showOnlyWithRemarks || selectedPOL || selectedPOD) && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Table View for Expired Rates - Make responsive */}
        {!loading && !error && filteredData.length > 0 && (
          <div className="overflow-x-auto shadow-md rounded-lg border border-red-300 mx-5">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 table-fixed border-collapse">
                <thead className="bg-red-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-2 sm:px-3 py-3 text-left text-xs sm:text-sm font-bold text-red-600 tracking-wider border-r border-red-200"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-3 py-3 text-left text-xs sm:text-sm font-bold text-red-600 tracking-wider border-r border-red-200"
                    >
                      Shipping Lines
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-3 py-3 text-left text-xs sm:text-sm font-bold text-red-600 tracking-wider border-r border-red-200"
                    >
                      POL
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-3 py-3 text-left text-xs sm:text-sm font-bold text-red-600 tracking-wider border-r border-red-200"
                    >
                      POD
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-3 py-3 text-left text-xs sm:text-sm font-bold text-red-600 tracking-wider border-r border-red-200"
                    >
                      Container
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-3 py-3 text-left text-xs sm:text-sm font-bold text-red-600 tracking-wider border-r border-red-200"
                    >
                      Ocean Freight
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-3 py-3 text-left text-xs sm:text-sm font-bold text-red-600 tracking-wider border-r border-red-200"
                    >
                      Expired On
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-3 py-3 text-center text-xs sm:text-sm font-bold text-red-600 tracking-wider"
                    >
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => {
                    const hasRemarks =
                      item.remarks && item.remarks.trim().length > 0;
                    const isExpanded = expandedRows[item._id || item.id];
                    const userData = getUserData(item.name);

                    return (
                      <React.Fragment key={item._id || item.id}>
                        <tr
                          className={`${
                            hasRemarks
                              ? "bg-yellow-50 hover:bg-yellow-100"
                              : "hover:bg-gray-50"
                          } transition-colors duration-150`}
                        >
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap border-r border-gray-200">
                            <div className="flex flex-col items-center sm:flex-row sm:items-center">
                              {/* Fix user info layout for mobile */}
                              <img
                                src={getUserProfileImage(item.name)}
                                alt={item.name}
                                className="h-8 w-8 rounded-full object-cover border border-gray-200 mb-1 sm:mb-0 sm:mr-3"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = defaultUserImg;
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="sm:flex sm:items-center">
                                  <span className="text-xs sm:text-sm font-medium text-gray-900 sm:mr-2 block truncate">
                                    {item.name || "N/A"}
                                  </span>

                                  {/* Remarks badge - Only visible on desktop */}
                                  {hasRemarks && (
                                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse">
                                      <svg
                                        className="w-3 h-3 mr-1 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2zm0 0v-2a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <span>Remarks</span>
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center">
                                  <span className="text-[10px] sm:text-xs text-gray-500 truncate">
                                    {userData.branch}
                                  </span>

                                  {/* Remarks badge - Only visible on mobile, after the branch */}
                                  {hasRemarks && (
                                    <span className="sm:hidden inline-flex items-center ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse">
                                      <svg
                                        className="w-2 h-2 mr-0.5 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2zm0 0v-2a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <span className="sr-only">Remarks</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap border-r border-gray-200">
                              <span className="text-[10px] sm:text-xs font-medium text-gray-900">
                                {item.shipping_lines}
                              </span>
                            </td>
                          <td className="px-2  py-2 border-r border-gray-200">
                              <div className="flex items-center text-[8px] sm:text-xs">
                                <div className="">
                                  <span className="text-[10px] sm:text-xs font-medium text-gray-900">
                                    {item.pol}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-2  py-2 border-r border-gray-300">
                              <div className="flex items-center text-[10px] sm:text-xs">
                                <span className="font-medium text-black">
                                  {item.fdrr ? item.fdrr : item.pod}
                                </span>
                              </div>
                            </td>
                            <td className="px-2 sm:px-3 py-2 whitespace-nowrap border-r border-gray-200">
                              <span className="text-[10px] sm:text-xs font-medium text-gray-900">
                                {item.container_type}
                              </span>
                            </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap border-r border-gray-200">
                            <div className="text-xs sm:text-sm font-medium text-red-600">
                              {item.ocean_freight || "N/A"}
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap border-r border-gray-200">
                            <span className="px-1.5 sm:px-2 py-1 inline-flex text-[10px] sm:text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              {formatDate(item.validity)}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-2 text-center">
                            <button
                              onClick={() =>
                                toggleRowExpansion(item._id || item.id)
                              }
                              className={`px-2 sm:px-3 py-1 sm:py-2 rounded-md text-white text-[10px] sm:text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                                isExpanded
                                  ? "bg-red-600 hover:bg-red-700 shadow-md"
                                  : "bg-red-500 hover:bg-red-600"
                              }`}
                            >
                              <div className="flex items-center">
                                {isExpanded ? (
                                  <>
                                    <span className="mr-1">Hide</span>
                                    <svg
                                      className="h-2 w-2 sm:h-3 sm:w-3"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 15l7-7 7 7"
                                      />
                                    </svg>
                                  </>
                                ) : (
                                  <>
                                    <span className="mr-1 hidden sm:inline">
                                      Details
                                    </span>
                                    <span className="mr-1 sm:hidden">Info</span>
                                    <svg
                                      className="h-2 w-2 sm:h-3 sm:w-3"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </>
                                )}
                              </div>
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr
                            className={`${
                              hasRemarks ? "bg-yellow-50" : "bg-gray-100"
                            }`}
                          >
                            <td colSpan="8" className="px-3 sm:px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                                {/* First detail card */}
                                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-300">
                                  <h4 className="font-medium text-xs sm:text-sm text-red-500 mb-2">
                                    Route & Commodity Details
                                  </h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] sm:text-xs">
                                    <div>
                                      <span className="text-gray-500">
                                        POR:
                                      </span>
                                      <p className="font-medium">
                                        {item.por || "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        POL:
                                      </span>
                                      <p className="font-medium">
                                        {item.pol || "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        POD:
                                      </span>
                                      <p className="font-medium">
                                        {item.fdrr ? item.fdrr : item.pod}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        FDRR:
                                      </span>
                                      <p className="font-medium">
                                        {item.fdrr || "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Commodity Type:
                                      </span>
                                      <p className="font-medium">
                                        {item.commodity || "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Transit Time:
                                      </span>
                                      <p className="font-medium">
                                        {item.transit
                                          ? `${item.transit} ${
                                              parseInt(item.transit) === 1
                                                ? "Day"
                                                : "Days"
                                            }`
                                          : "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Route Type:
                                      </span>
                                      <p className="font-medium">
                                        {item.routing || "Direct"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-3 border-t border-gray-200 pt-2">
                                    <div>
                                      <span className="text-red-500 text-xs font-medium">
                                        Shipping Line Contact Person Details
                                      </span>
                                      <p className=" text-xs ">
                                        Name: {item.shipping_name || "N/A"}
                                      </p>
                                      <p className=" text-xs ">
                                        Contact No:{" "}
                                        {item.shipping_number || "N/A"}
                                      </p>
                                      <p className=" text-xs ">
                                        Address:{" "}
                                        {item.shipping_address || "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Second detail card */}
                                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-300">
                                  <h4 className="font-medium text-xs sm:text-sm text-red-500 mb-2">
                                    Origin Charges
                                  </h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] sm:text-xs">
                                    <div>
                                      <span className="text-gray-500">
                                        BL Fees:
                                      </span>
                                      <p className="font-medium">
                                        {item.bl_fees || "N/A"} /BL
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        THC:
                                      </span>
                                      <p className="font-medium">
                                        {item.thc || "N/A"} /Container
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        MUC:
                                      </span>
                                      <p className="font-medium">
                                        {item.muc || "N/A"} /BL
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Toll:
                                      </span>
                                      <p className="font-medium">
                                        {item.toll || "N/A"} /Container
                                      </p>
                                    </div>
                                 
                                  </div>

                                  {/* Custom Charges Section */}
                                  {item.customCharges &&
                                    Array.isArray(item.customCharges) &&
                                    item.customCharges.length > 0 && (
                                      <div className="mt-2 border-t border-gray-200 pt-2">
                                        <span className="text-xs font-medium text-gray-500">
                                          Other Charges:
                                        </span>
                                        <div className="mt-1 grid grid-cols-2 gap-2">
                                          {item.customCharges.map(
                                            (charge, index) => (
                                              <p
                                                key={index}
                                                className="text-xs font-medium"
                                              >
                                                {charge.label}: {charge.value}
                                              </p>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {/* For backward compatibility with old format */}
                                  {!item.customCharges &&
                                    item.customLabel &&
                                    item.customValue && (
                                      <div className="mt-2 border-t border-gray-200 pt-2">
                                        <span className="text-xs font-medium text-gray-500">
                                          Other Charges:
                                        </span>
                                        {/* Parse and display multiple charges if they use the delimiter */}
                                        {item.customLabel.includes("|||") ? (
                                          <div className="mt-1 grid grid-cols-3 gap-2">
                                            {item.customLabel
                                              .split("|||")
                                              .map((label, index) => {
                                                const values =
                                                  item.customValue.split("|||");

                                                // Properly split the units string and get the corresponding unit for this charge
                                                const units = item.customUnit
                                                  ? item.customUnit.split("|||")
                                                  : [];
                                                const unit =
                                                  units[index] || "/BL"; // Default to /BL if no unit is found

                                                return label &&
                                                  values[index] ? (
                                                  <p
                                                    key={index}
                                                    className="text-xs font-medium pr-2"
                                                  >
                                                    {label}: {values[index]}{" "}
                                                    <span className="text-gray-500">
                                                      {unit}
                                                    </span>
                                                  </p>
                                                ) : null;
                                              })}
                                          </div>
                                        ) : (
                                          // Display single charge (legacy format)
                                          <p className="text-xs font-medium">
                                            {item.customLabel}:{" "}
                                            {item.customValue} {item.customUnit}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                </div>

                                {/* Third detail card */}
                                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-300">
                                  <h4 className="font-medium text-xs sm:text-sm text-red-500 mb-2">
                                    Additional Information
                                  </h4>
                                  {hasRemarks && (
                                    <div className="mb-2 bg-yellow-100 p-2 rounded text-xs">
                                      <span className="text-yellow-700 font-medium">
                                        Remarks:
                                      </span>
                                      <p className="mt-1 text-gray-800">
                                        {item.remarks}
                                      </p>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                      <span className="text-gray-500">
                                        Created:
                                      </span>
                                      <p className="font-medium">
                                        {formatDate(item.createdAt)}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Expired:
                                      </span>
                                      <p className="font-medium text-red-600">
                                        {formatDate(item.validity)}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        User Contact:
                                      </span>
                                      <p className="font-medium">
                                        {userData.phoneNumber}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-2 border-t border-gray-200 pt-2">
                                    <span className="text-gray-500 text-xs">
                                     IHC Rail Freight (Based on Cargo Weight + Tare
                                      Weight)
                                    </span>
                                    <div className="mt-1">
                                      {item.railFreightRates ? (
                                        formatRailFreightRatesForDisplay(
                                          item.railFreightRates,
                                          item.container_type
                                        )
                                      ) : (
                                        <p className="text-xs text-gray-500">
                                          No rail freight rates available
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(Expired_rates);
