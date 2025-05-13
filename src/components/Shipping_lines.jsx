import { useState, useEffect } from "react";

// Function that returns the Shipping Lines options array
export const getShippingLinesOptions = () => {
  return [
    "Maersk",
    "MSC",
    "CMA CGM",
    "Hapag-Lloyd",
    "COSCO Shipping Lines",
    "ONE",
    "Evergreen Marine",
    "HMM",
    "Unifeeder",
    "TS Lines",
    "ZIM",
    "Yang Ming Marine Transport",
    "Wan Hai Lines",
    "PIL",
    "X-Press Feeders",
    "SITC Container Lines",
    "Sinokor Merchant Marine",
    "Emirates Shipping Line",
    "IRISL",
    "Bahri",
    "Arkas Line",
    "Antong Holdings",
    "SM Line",
    "Sealand",
    "Gold Star Line",
    "Samudera Shipping Line",
    "Balaji Shipping",
    "Shreyas Shipping and Logistics",
    "Transworld Group",
    "SCI ",
  ];
};

// Function to fetch Shipping Lines options from API if needed in the future
export const fetchShippingLinesOptions = async () => {
  try {
    // This function can be expanded later to fetch from an API
    // For now, returning the static list
    return getShippingLinesOptions();
  } catch (error) {
    console.error("Error fetching Shipping Lines options:", error);
    return getShippingLinesOptions(); // Fallback to static list
  }
};

// React hook for consuming Shipping Lines options in components
export const useShippingLinesOptions = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getOptions = async () => {
      try {
        const result = await fetchShippingLinesOptions();
        setOptions(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getOptions();
  }, []);

  return { options, loading, error };
};

export default getShippingLinesOptions;
