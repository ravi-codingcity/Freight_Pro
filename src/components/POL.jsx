import { useState, useEffect } from "react";

// Function that returns the POL options array
export const getPOLOptions = () => {
  return [
    "Chennai Port (TN)",
    "Cochin Port (KL)",
    "Dhamra Port (OD)",
    "Ennore Port (TN)",
    "Gangavaram Port (AP)",
    "Haldia Port (WB)",
    "Hazira Port (GJ)",
    "Kakinada Port (AP)",
    "Kandla Port (GJ)",
    "Kolkata Port (WB)",
    "Krishnapatnam Port (AP)",
    "Mormugao Port (GA)",
    "Mumbai Port (MH)",
    "Mundra Port (GJ)",
    "New Mangalore Port (KA)",
    "Nhava Sheva (MH)",
    "Paradip Port (OD)",
    "Pipavav Port (GJ)",
    "Port Blair Port (AN)",
    "Tuticorin Port (TN)",
    "Visakhapatnam Port (AP)",
    "Vizhinjam International Seaport (KL)"
  ];
};

// Function to fetch POL options from API
export const fetchPOLOptions = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return getPOLOptions(); // Fallback to static list
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
      throw new Error("Failed to fetch POL options");
    }

    const forms = await response.json();
    
    // Extract unique POLs from forms
    const dynamicPOLs = [...new Set(forms.map(form => form.pol).filter(Boolean))];
    
    // Combine with static options and remove duplicates
    const allPOLs = [...new Set([...getPOLOptions(), ...dynamicPOLs])].sort();
    
    return allPOLs;
  } catch (error) {
    console.error("Error fetching POL options:", error);
    return getPOLOptions(); // Fallback to static list
  }
};

// Function to add a new POL to the existing list
export const addNewPOL = (currentOptions, newPOL) => {
  if (!newPOL || currentOptions.includes(newPOL)) {
    return currentOptions;
  }
  return [...currentOptions, newPOL].sort();
};

// React hook for consuming POL options in components
export const usePOLOptions = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getOptions = async () => {
      try {
        const result = await fetchPOLOptions();
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
      const result = await fetchPOLOptions();
      setOptions(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { options, loading, error, refreshOptions };
};

export default getPOLOptions;
