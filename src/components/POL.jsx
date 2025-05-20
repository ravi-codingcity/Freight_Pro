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
