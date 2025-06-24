import { useState, useEffect } from "react";

// Function that returns the Shipping Lines options array
export const getShippingLinesOptions = () => {
  return [
     "Allcargo Logistics",
    "Antong Holdings",
    "Arkas Line",
    "ANL",
    "Bahri",
    "Balaji Shipping",
    "CMA CGM",
    "COSCO",
    "Emirates Shipping",
    "Evergreen",
    "FESCO LINE",
    "Gold Star Line",
    "Goodrich Maritime",
    "HMM",
    "Hapag-Lloyd",
    "IRISL",
    "INOX",
    "KMTC",
    "Maersk",
    "Maxicon Shipping Agencies",
    "MSC",
    "NAVIS",
    "NAVIO",
    "ONE",
    "OOCL",
    "PIL",
    "SCI",
    "SITC Container",
    "SM Line",
    "Samudera Shipping",
    "Sarjak Container Lines",
    "SeaLead Shipping",
    "Sealand",
    "Shreyas",
    "Sinokor Merchant",
    "TASS",
    "TGLS",
    "Trans Asia",
    "TLPL",
    "TS Lines",
    "Transworld Group",
    "UAFL",
    "Unifeeder",
    "UNITED LINER",
    "WINWIN Lines",
    "Wan Hai",
    "X-Press Feeders",
    "Yang Ming",
    "ZIM",
  ];
};

// Function to fetch Shipping Lines options from API
export const fetchShippingLinesOptions = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return getShippingLinesOptions(); // Fallback to static list
    }

    const response = await fetch(
      "https://freightpro-4kjlzqm0.b4a.run/api/forms/all",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Shipping Lines options");
    }

    const forms = await response.json();
    
    // Extract unique shipping lines from forms
    const dynamicShippingLines = [...new Set(forms.map(form => form.shipping_lines).filter(Boolean))];
    
    // Combine with static options and remove duplicates
    const allShippingLines = [...new Set([...getShippingLinesOptions(), ...dynamicShippingLines])].sort();
    
    return allShippingLines;
  } catch (error) {
    console.error("Error fetching Shipping Lines options:", error);
    return getShippingLinesOptions(); // Fallback to static list
  }
};

// Function to add a new shipping line to the existing list
export const addNewShippingLine = (currentOptions, newShippingLine) => {
  if (!newShippingLine || currentOptions.includes(newShippingLine)) {
    return currentOptions;
  }
  return [...currentOptions, newShippingLine].sort();
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

  const refreshOptions = async () => {
    setLoading(true);
    try {
      const result = await fetchShippingLinesOptions();
      setOptions(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { options, loading, error, refreshOptions };
};

export default getShippingLinesOptions;
