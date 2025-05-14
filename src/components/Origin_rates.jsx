// Cache mechanism to avoid excessive API calls
let cachedOriginRates = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Fetch all origin rates data from the API
const fetchAllOriginRates = async () => {
  const currentTime = Date.now();

  // Use cached data if available and still valid
  if (cachedOriginRates && currentTime - lastFetchTime < CACHE_DURATION) {
    console.log("Using cached origin rates data");
    return cachedOriginRates;
  }

  try {
    console.log("Fetching origin rates from API");
    const response = await fetch(
      "https://origin-backend-3v3f.onrender.com/api/origin/forms/all"
    );

    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }

    const data = await response.json();
    cachedOriginRates = data;
    lastFetchTime = currentTime;
    return data;
  } catch (error) {
    console.error("Error fetching origin rates:", error);
    // Return empty array in case of error
    return [];
  }
};

// Function to find rates by port, shipping line, container type, and POL
export const getRatesByPortAndLine = async (
  por,
  shippingLine,
  containerType,
  pol
) => {
  // Default rates object
  const defaultRates = {
    bl_fees: "0",
    thc: "0",
    muc: "0",
    toll: "0",
  };

  // If any required parameter is missing, return default rates
  if (!por || !shippingLine || !containerType || !pol) {
    console.log("Missing required parameters for rates lookup");
    return defaultRates;
  }

  try {
    // Fetch the origin rates data
    const allRates = await fetchAllOriginRates();

    if (!Array.isArray(allRates) || allRates.length === 0) {
      console.log("No rates data available");
      return defaultRates;
    }

    console.log(
      `Searching for rates with POR: ${por}, POL: ${pol}, Shipping Line: ${shippingLine}, Container: ${containerType}`
    );

    // Find the first matching rate from all rates
    const matchedRate = allRates.find(
      (rate) =>
        rate.por === por &&
        rate.pol === pol &&
        rate.shipping_lines === shippingLine &&
        rate.container_type === containerType
    );

    // If a matching rate is found, return its values with currency embedded, otherwise return default rates
    if (matchedRate) {
      console.log("Found matching rate:", matchedRate);
      const currency = matchedRate.currency || "₹"; // Default to ₹ if currency is not provided

      return {
        bl_fees: `${currency}${matchedRate.bl_fees || "0"}`,
        thc: `${currency}${matchedRate.thc || "0"}`,
        muc: `${currency}${matchedRate.muc || "0"}`,
        toll: `${currency}${matchedRate.toll || "0"}`,
      };
    } else {
      console.log("No matching rate found, returning defaults");
      return defaultRates;
    }
  } catch (error) {
    console.error("Error getting rates by port and line:", error);
    return defaultRates;
  }
};
