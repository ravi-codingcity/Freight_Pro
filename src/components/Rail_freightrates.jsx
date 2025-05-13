// Cache mechanism to avoid excessive API calls
let cachedRailFreightRates = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Fetch all rail freight data from the API
const fetchAllRailFreightRates = async () => {
  const currentTime = Date.now();
  
  // Use cached data if available and still valid
  if (cachedRailFreightRates && (currentTime - lastFetchTime < CACHE_DURATION)) {
    console.log('Using cached rail freight rates data');
    return cachedRailFreightRates;
  }
  
  try {
    console.log('Fetching rail freight rates from API');
    const response = await fetch('https://origin-backend-3v3f.onrender.com/api/railfreight/forms/all');
    
    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }
    
    const data = await response.json();
    cachedRailFreightRates = data;
    lastFetchTime = currentTime;
    return data;
  } catch (error) {
    console.error('Error fetching rail freight rates:', error);
    // Return empty array in case of error
    return [];
  }
};

// Function to find rail freight rates based on POR, POL, Shipping Line, and Container Type
export const getRailFreightRates = async (por, pol, shippingLine, containerType) => {
  // Update default rates to include currency
  const getDefaultRates = (containerType) => {
    if (containerType && containerType.startsWith('20')) {
      return {
        "(0-10 ton)": "₹0",
        "(10-20 ton)": "₹0",
        "(20+ ton)": "₹0"
      };
    } else if (containerType && (containerType.startsWith('40') || containerType.startsWith('45'))) {
      return {
        "(0-10 ton)": "₹0",
        "(10-20 ton)": "₹0",
        "(20+ ton)": "₹0"
      };
    }
    return {};
  };
  
  // If any required parameter is missing, return default rates
  if (!por || !pol || !shippingLine || !containerType) {
    console.log('Missing required parameters for rail freight rates lookup');
    return getDefaultRates(containerType);
  }
  
  try {
    // Fetch all rail freight rates
    const allRates = await fetchAllRailFreightRates();
    
    if (!Array.isArray(allRates) || allRates.length === 0) {
      console.log('No rail freight rates data available');
      return getDefaultRates(containerType);
    }
    
    console.log(`Searching for rail freight rates with POR: ${por}, POL: ${pol}, Shipping Line: ${shippingLine}, Container Type: ${containerType}`);
    
    // Find the first matching rate
    const matchedRate = allRates.find(rate => 
      rate.por === por && 
      rate.pol === pol && 
      rate.shipping_lines === shippingLine && 
      rate.container_type === containerType
    );
    
    // If a matching rate is found, use the correct property names from the API
    if (matchedRate) {
      console.log('Found matching rail freight rate:', matchedRate);
      const currency = matchedRate.currency || "₹"; // Default to ₹ if currency is not provided
      
      // Ensure currency is included in the returned values
      // Check if it's a 20ft container
      if (containerType.startsWith('20')) {
        return {
          "(0-10 ton)": `${currency}${matchedRate.weight20ft0_10 || "0"}`,
          "(10-20 ton)": `${currency}${matchedRate.weight20ft10_20 || "0"}`,
          "(20+ ton)": `${currency}${matchedRate.weight20ft20Plus || "0"}`
        };
      } 
      // Check if it's a 40ft container
      else if (containerType.startsWith('40') || containerType.startsWith('45')) {
        return {
          "(10-20 ton)": `${currency}${matchedRate.weight40ft10_20 || "0"}`,
          "(20+ ton)": `${currency}${matchedRate.weight40ft20Plus || "0"}`
        };
      }
    }
    
    console.log('No matching rail freight rate found, returning defaults');
    return getDefaultRates(containerType);
  } catch (error) {
    console.error('Error getting rail freight rates:', error);
    return getDefaultRates(containerType);
  }
};

// Legacy function kept for compatibility
export const getWeightRates = () => {
  return {
    "20ft": {
      "(0-10 ton)": "0",
      "(10-20 ton)": "0",
      "(20+ ton)": "0"
    },
    "40ft": {
      "(10-20 ton)": "0",
      "(20+ ton)": "0"
    }
  };
};

// Legacy function kept for compatibility
export const getWeightRatesByPOR = (por, containerSize) => {
  console.log('Warning: getWeightRatesByPOR is deprecated, use getRailFreightRates instead');
  return containerSize === "20ft" ? 
    { "(0-10 ton)": "0", "(10-20 ton)": "0", "(20+ ton)": "0" } : 
    { "(10-20 ton)": "0", "(20+ ton)": "0" };
};

// Legacy function kept for compatibility
export const isICD = (por) => {
  return por && por.toLowerCase().includes('icd');
};
