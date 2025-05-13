import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
// Import all user profile images
import harmeetImg from "../assets/harmeet.jpg";
import vikramImg from "../assets/vikram.jpg";
import kapilImg from "../assets/kapil.jpg";
// Default profile image for fallback
import defaultUserImg from "../assets/omtrans.jpg";

const View_rates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New filter states
  const [showOnlyWithRemarks, setShowOnlyWithRemarks] = useState(false);
  const [selectedPOL, setSelectedPOL] = useState("");
  const [selectedPOD, setSelectedPOD] = useState("");
  const [uniquePOLs, setUniquePOLs] = useState([]);
  const [uniquePODs, setUniquePODs] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Function to get user profile image by name
  const getUserProfileImage = (name) => {
    const userImages = {
      Vikram: vikramImg,
      Harmeet: harmeetImg,
      Kapil: kapilImg,
    };
    return userImages[name] || defaultUserImg;
  };

  const getUserData = (name) => {
    const userData = {
      Vikram: { branch: "Delhi", phoneNumber: "123456789" },
      Harmeet: { branch: "Kolkata", phoneNumber: "987654321" },
      Kapil: { branch: "Mumbai", phoneNumber: "456789123" },
    };
    return userData[name] || { branch: "N/A", phoneNumber: "N/A" };
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem("currentUser") || "";
    setCurrentUser(loggedInUser);

    const fetchAllForms = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("https://freightpro-4kjlzqm0.b4a.run/api/forms/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const forms = await response.json();

        const processedForms = forms.map((form) => {
          return {
            ...form,
            origin_charges: form.origin_charges || "N/A",
            thc: form.thc || "N/A",
            muc: form.muc || "N/A",
            tou: form.tou || "N/A",
            acd_ams: form.acd_ams || "N/A",
            ens: form.ens || "N/A",
          };
        });

        // Extract unique POLs and PODs for dropdowns
        const pols = [
          ...new Set(processedForms.map((form) => form.pol).filter(Boolean)),
        ].sort();
        const pods = [
          ...new Set(processedForms.map((form) => form.pod).filter(Boolean)),
        ].sort();
        setUniquePOLs(pols);
        setUniquePODs(pods);

        setData(
          processedForms.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      } catch (error) {
        console.error("Error fetching forms:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllForms();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setShowOnlyWithRemarks(false);
    setSelectedPOL("");
    setSelectedPOD("");
  };

  const isValidityExpired = (validityDate) => {
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
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const formatRailFreightRatesForDisplay = (railFreightRates, containerType) => {
    if (!railFreightRates) return "No rail freight rates available";

    try {
      let ratesObj;
      // Handle string or object format
      if (typeof railFreightRates === "string") {
        ratesObj = JSON.parse(railFreightRates);
      } else {
        ratesObj = railFreightRates;
      }

      // Check if the object is empty
      if (Object.keys(ratesObj).length === 0) {
        return "No rail freight rates available";
      }

      // Get container type - use the item's container_type or default to 20ft
      const displayContainerType = containerType || "20ft";

      return (
        <div className="grid gap-1 mt-1">
          {Object.entries(ratesObj).map(([weightRange, rate]) => (
            <span key={weightRange} className="text-xs">
              <span className="font-medium">{displayContainerType}:</span> {weightRange}{" "}
              <span className="text-blue-600">{rate}</span>
              <span className="text-gray-500"> /Container</span>
            </span>
          ))}
        </div>
      );
    } catch (error) {
      console.error("Error formatting rail freight rates:", error);
      return "Error displaying rail freight rates";
    }
  };

  const sortedData = React.useMemo(() => {
    return data
      .filter((item) => !isValidityExpired(item.validity))
      .filter((item) => {
        // General search term filter
        if (searchTerm !== "") {
          const searchLower = searchTerm.toLowerCase();
          const shipping_linesMatch = item.shipping_lines
            ? item.shipping_lines.toLowerCase().includes(searchLower)
            : false;
          const porMatch = item.por
            ? item.por.toLowerCase().includes(searchLower)
            : false;
          const polMatch = item.pol
            ? item.pol.toLowerCase().includes(searchLower)
            : false;
          const podMatch = item.pod
            ? item.pod.toLowerCase().includes(searchLower)
            : false;

          if (!(shipping_linesMatch || porMatch || polMatch || podMatch)) {
            return false;
          }
        }

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
        if (selectedPOD && item.pod !== selectedPOD) {
          return false;
        }

        return true;
      });
  }, [data, searchTerm, showOnlyWithRemarks, selectedPOL, selectedPOD]);

  // Calculate pagination values
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showOnlyWithRemarks, selectedPOL, selectedPOD]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-2 sm:p-4 max-w-full">
        {/* Filters section */}
        <div className="mt-1 bg-white rounded-xl shadow-sm overflow-hidden px-2 sm:px-6 mb-4">
          <div className="p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap justify-evenly">
              <div className="flex justify-around items-center w-full sm:w-auto gap-3">
                {/* POL Filter */}
                <div className="w-full sm:max-w-60 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2 sm:p-3 border border-gray-200 hover:shadow-md transition-shadow duration-200 flex-1">
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
                <div className="w-full sm:max-w-60 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-2 sm:p-3 border border-gray-200 hover:shadow-md transition-shadow duration-200 flex-1">
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
              <div className="w-full sm:max-w-60 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-2 sm:p-3 border border-gray-200 hover:shadow-md transition-shadow duration-200 flex-1">
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
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2zm0 0v-2a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
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

            {/* Active filters section */}
            {(showOnlyWithRemarks ||
              selectedPOL ||
              selectedPOD ||
              searchTerm) && (
              <div className="mt-4 pt-4 border-t border-gray-200 overflow-x-auto">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Active Filters:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 group">
                      <svg
                        className="h-3 w-3 mr-1 text-gray-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm("")}
                        className="ml-1.5 text-gray-500 opacity-60 group-hover:opacity-100 hover:text-gray-700 focus:outline-none"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  )}

                  {showOnlyWithRemarks && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 group">
                      <svg
                        className="h-3 w-3 mr-1 text-yellow-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
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
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
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
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
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
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
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

        {/* Filter stats and controls */}
        <div className="flex flex-col gap-3 mb-5 bg-white p-3 rounded-xl shadow-sm mt-3 sm:mx-5 mx-0">
          {/* Top row for both mobile and desktop - Filters and Showing rates count */}
          <div className="flex flex-row items-center justify-between w-full">
            {/* Filters label with count - Left side */}
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
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
              <h3 className="text-base font-medium text-gray-700">Filters</h3>
              {(showOnlyWithRemarks ||
                selectedPOL ||
                selectedPOD ||
                searchTerm) && (
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full ml-2">
                  {
                    [
                      showOnlyWithRemarks,
                      selectedPOL,
                      selectedPOD,
                      searchTerm,
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </div>

            {/* Showing rates count */}
            <div className="bg-blue-50 text-blue-700 rounded-lg px-4 py-2 font-medium inline-flex items-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              <span>
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading rates...
                  </span>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-bold">{currentItems.length}</span> of{" "}
                    <span className="font-bold">{totalItems}</span> active rate
                    {totalItems !== 1 ? "s" : ""}
                    {showOnlyWithRemarks ||
                      selectedPOL ||
                      selectedPOD ||
                      searchTerm}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Bottom row for both mobile and desktop - Last updated and reset filters */}
          <div className="flex flex-row items-center justify-between w-full">
            {/* Reset filters button */}
            <div className="flex items-center">
              {(showOnlyWithRemarks ||
                selectedPOL ||
                selectedPOD ||
                searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-700 flex items-center bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md shadow-sm font-bold transition-colors duration-200"
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

        {isLoading ? (
          // Loading State UI
          <div className="animate-pulse">
            {/* Loading spinner */}
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>

            {/* Skeleton UI for the table */}
            <div className="bg-white shadow-md rounded-lg p-4">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-8 gap-4 border-b pb-2 mb-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded"></div>
                ))}
              </div>

              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-8 gap-4 py-4 border-b">
                  {/* User column */}
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>

                  {/* Other columns */}
                  {[...Array(7)].map((_, j) => (
                    <div key={j} className="flex flex-col">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      {j === 6 && (
                        <div className="h-6 bg-blue-100 rounded w-16 mt-1"></div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          // Error state
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-5 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading data
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
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
        ) : sortedData.length === 0 ? (
          // Empty state
          <div className="bg-gray-50 rounded-xl p-12 text-center">
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
              No results found
            </h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          // Data loaded state - The table needs the most significant changes for mobile
          <>
            {/* Responsive table with horizontal scrolling on small screens */}
            <div className="overflow-x-auto shadow-md rounded-lg border border-gray-300 mx-5">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200 table-fixed border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-red-500 tracking-wider border-r border-gray-300"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-red-500 tracking-wider border-r border-gray-300"
                      >
                        Shipping Lines
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-red-500 tracking-wider border-r border-gray-300"
                      >
                        POL
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-red-500 tracking-wider border-r border-gray-300"
                      >
                        POD
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-red-500 tracking-wider border-r border-gray-300"
                      >
                        Container
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-red-500 tracking-wider border-r border-gray-300"
                      >
                        Ocean Freight
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-red-500 tracking-wider border-r border-gray-300"
                      >
                        Validity
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-center text-xs sm:text-sm font-bold text-red-500 tracking-wider"
                      >
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((item) => {
                      const hasRemarks =
                        item.remarks && item.remarks.trim().length > 0;
                      const isExpanded = expandedRows[item._id];
                      const userData = getUserData(item.name);

                      return (
                        <React.Fragment key={item._id}>
                          <tr
                            className={`${
                              hasRemarks
                                ? "bg-yellow-50 hover:bg-yellow-100"
                                : "hover:bg-gray-50"
                            } transition-colors duration-150`}
                          >
                            {/* User column */}
                            <td className="px-2 sm:px-3 py-2 whitespace-nowrap border-r border-gray-200">
                              <div className="flex flex-col items-center sm:flex-row sm:items-center">
                                <img
                                  src={getUserProfileImage(item.name)}
                                  alt={item.name}
                                  className="h-8 w-8 rounded-full object-cover border border-gray-200 mb-1 sm:mb-0 sm:mr-3"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = defaultUserImg;
                                  }}
                                />
                                <div className="flex flex-col items-center sm:items-start">
                                  <span className="text-xs sm:text-sm font-medium text-gray-900 text-center sm:text-left">
                                    {item.name}
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-gray-500 text-center sm:text-left">
                                    {userData.branch}
                                  </span>
                                </div>
                                {hasRemarks && (
                                  <div className="hidden sm:block mt-0 ml-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse">
                                      <svg
                                        className="w-3 h-3 mr-1"
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
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Other columns */}
                            <td className="px-2 sm:px-3 py-2 whitespace-nowrap border-r border-gray-200">
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {item.shipping_lines}
                              </span>
                            </td>
                            <td className="px-2 sm:px-3 py-2 border-r border-gray-200">
                              <div className="flex items-center text-[10px] sm:text-xs">
                                <div className="bg-blue-50 px-1.5 sm:px-2 py-1 rounded-l border border-blue-200 flex items-center">
                                  <span className="font-medium text-gray-700">
                                    {item.pol}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 sm:px-3 py-2 border-r border-gray-200">
                              <div className="flex items-center text-[10px] sm:text-xs">
                                <div className="bg-indigo-50 px-1.5 sm:px-2 py-1 rounded-r border border-indigo-200 flex items-center">
                                  <span className="font-medium text-gray-700">
                                    {item.pod}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 sm:px-3 py-2 whitespace-nowrap border-r border-gray-200">
                              <span className="text-sm text-gray-900">
                                {item.container_type}
                              </span>
                            </td>
                            <td className="px-2 sm:px-3 py-2 whitespace-nowrap border-r border-gray-200">
                              <div className="text-sm font-medium text-gray-900">
                                {item.ocean_freight}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.acd_ens_afr}
                              </div>
                            </td>
                            <td className="px-2 sm:px-3 py-2 whitespace-nowrap border-r border-gray-200">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  isValidityExpired(item.validity)
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {formatDate(item.validity)}{" "}
                                {item.validity_for
                                  ? `(${item.validity_for})`
                                  : ""}
                              </span>
                            </td>
                            <td className="px-2 sm:px-3 py-2 text-center">
                              <button
                                onClick={() => toggleRowExpansion(item._id)}
                                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-white text-[10px] sm:text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                  isExpanded
                                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                                    : "bg-blue-500 hover:bg-blue-600"
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
                                        More Details
                                      </span>
                                      <span className="mr-1 sm:hidden">
                                        Details
                                      </span>
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

                          {/* Expanded row with details */}
                          {isExpanded && (
                            <tr
                              className={`${
                                hasRemarks ? "bg-yellow-50" : "bg-gray-100"
                              }`}
                            >
                              <td colSpan="8" className="px-3 sm:px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                                  {/* First detail card */}
                                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border-[1px] border-gray-400">
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
                                          {item.pod || "N/A"}
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
                                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border-[1px] border-gray-400">
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
                                          TOLL:
                                        </span>
                                        <p className="font-medium">
                                          {item.toll || "N/A"} /Container
                                        </p>
                                      </div>

                                      <div>
                                        <span className="text-gray-500">
                                          IHC (Railing costs):
                                        </span>
                                        <p className="font-medium">
                                          {item.ihc || "N/A"} /Container
                                        </p>
                                      </div>
                                    </div>
                                    {/* Add custom field to display if it exists */}
                                    {!item.customCharges &&
                                      item.customLabel &&
                                      item.customValue && (
                                        <div className="mt-2 border-t border-gray-200 pt-2">
                                          <span className="text-xs font-medium text-gray-500">
                                            Other Charges:
                                          </span>
                                          {/* Parse and display multiple charges if they use the delimiter */}
                                          {item.customLabel.includes("|||") ? (
                                            <div className="mt-1 grid grid-cols-3 gap-2 ">
                                              {item.customLabel
                                                .split("|||")
                                                .map((label, index) => {
                                                  const values =
                                                    item.customValue.split(
                                                      "|||"
                                                    );

                                                  // Properly split the units string and get the corresponding unit for this charge
                                                  const units = item.customUnit
                                                    ? item.customUnit.split(
                                                        "|||"
                                                      )
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
                                              {item.customValue}{" "}
                                              <span className="text-gray-500">
                                                {item.customUnit}
                                              </span>
                                            </p>
                                          )}
                                        </div>
                                      )}
                                  </div>

                                  {/* Third detail card */}
                                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border-[1px] border-gray-400">
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
                                    <div className=" grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] sm:text-xs">
                                      <div>
                                        <span className="text-gray-500">
                                          Created:
                                        </span>
                                        <p className="font-medium">
                                          {new Date(
                                            item.createdAt
                                          ).toLocaleDateString("en-GB")}
                                          ,
                                          {new Date(
                                            item.createdAt
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          Updated:
                                        </span>
                                        <p className="font-medium">
                                          {new Date(
                                            item.updatedAt
                                          ).toLocaleDateString("en-GB")}
                                          ,
                                          {new Date(
                                            item.updatedAt
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
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
                                    {/* Rail Freight Rates Section */}
                                    <div className="mt-0">
                                      {item.railFreightRates &&
                                        Object.keys(item.railFreightRates)
                                          .length > 0 && (
                                          <div className="mt-2 border-t border-gray-200 pt-2">
                                            <span className="text-gray-500 text-xs ">
                                              Rail Freight (Based on Cargo
                                              Weight + Tare Weight)
                                            </span>
                                            <div className="mt-1">
                                              {formatRailFreightRatesForDisplay(
                                                item.railFreightRates,
                                                item.container_type
                                              )}
                                            </div>
                                          </div>
                                        )}
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

            {/* Pagination Controls */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between bg-white p-3 sm:p-4 rounded-lg shadow-sm">
              <div className="flex items-center text-xs sm:text-sm text-gray-700 mb-3 sm:mb-0">
                <span>
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, totalItems)}
                  </span>{" "}
                  of <span className="font-medium">{totalItems}</span> results
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 border rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Prev
                </button>

                <span className="px-2 sm:px-4 py-1.5 sm:py-2 border rounded-md bg-blue-50 text-blue-700 text-xs sm:text-sm font-medium">
                  {currentPage} / {totalPages || 1}
                </span>

                <button
                  onClick={nextPage}
                  disabled={currentPage >= totalPages}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 border rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 ${
                    currentPage >= totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default React.memo(View_rates);
