import { useState, useEffect } from "react";

// Function that returns the POL options array
export const getPOLOptions = () => {
  return [
    "Nhava Sheva (MH)",
    "Mumbai Port (MH)",
    "Mundra Port (GJ)",
    "Kandla Port (GJ)",
    "Hazira Port (GJ)",
    "Pipavav Port (GJ)",
    "Chennai Port (TN)",
    "Ennore Port (TN)",
    "Tuticorin Port (TN)",
    "Kolkata Port (WB)",
    "Haldia Port (WB)",
    "Visakhapatnam Port (AP)",
    "Gangavaram Port (AP)",
    "Kakinada Port (AP)",
    "Krishnapatnam Port (AP)",
    "Paradip Port (OD)",
    "Dhamra Port (OD)",
    "Cochin Port (KL)",
    "Vizhinjam International Seaport (KL)",
    "Mormugao Port (GA)",
    "New Mangalore Port (KA)",
    "Port Blair Port (AN)",
  ];
};

// Function to fetch POL options from API if needed in the future
export const fetchPOLOptions = async () => {
  try {
    // This function can be expanded later to fetch from an API
    // For now, returning the static list
    return getPOLOptions();
  } catch (error) {
    console.error("Error fetching POL options:", error);
    return getPOLOptions(); // Fallback to static list
  }
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

  return { options, loading, error };
};

export default getPOLOptions;
