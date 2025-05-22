import { useState, useEffect } from "react";

// Function that returns the POR options as a flat array
export const getPOROptions = () => {
  const data = {
    POR: [
      "ACTL Faridabad (HR)",
      "Ahmedabad ICD (AMD)",
      "Ankleshwar ICD (AKV)",
      "Bangalore ICD (WFD)",
      "Bhiwadi ICD (BWD)",
      "Chennai Port (TN)",
      "Coimbatore ICD (CBE)",
      "Cochin Port (KL)",
      "Dadri ICD (UP)",
      "Dhamra Port (OD)",
      "Dighi ICD (MH)",
      "Durgapur ICD (DGP)",
      "Ennore Port (TN)",
      "Gangavaram Port (AP)",
      "Garhi Harsaru ICD (HR)",
      "Haldia Port (WB)",
      "Hazira Port (GJ)",
      "Hyderabad ICD (HYD)",
      "Irugur ICD (IRUGUR)",
      "Jaipur ICD (JPR)",
      "Jattipur / Panipat ICD (HR)",
      "Jodhpur ICD (RJ)",
      "Kakinada Port (AP)",
      "Kanpur ICD (KNP)",
      "Kandla Port (GJ)",
      "Khodiyar ICD (KHODIYAR)",
      "Kolkata Port (WB)",
      "Krishnapatnam Port (AP)",
      "KSH ICD (MH)",
      "Loni ICD (LON)",
      "Ludhiana ICD (LDH)",
      "Madurai ICD (MDU)",
      "Modinagar ICD (UP)",
      "Moradabad ICD (MBQ)",
      "Mormugao Port (GA)",
      "Mumbai Port (MH)",
      "Mundra Port (GJ)",
      "Nagpur ICD (NGP)",
      "New Mangalore Port (KA)",
      "Nhava Sheva (MH)",
      "Palwal ICD (HR)",
      "Pali ICD (HR)",
      "Paradip Port (OD)",
      "Patli ICD (HR)",
      "Patparganj ICD (DL)",
      "Pipavav Port (GJ)",
      "Piyala ICD (HR)",
      "Port Blair Port (AN)",
      "Sonepat ICD (HR)",
      "Tughlakabad ICD (DL)",
      "Tuticorin Port (TN)",
      "Visakhapatnam Port (AP)",
      "Vizhinjam International Seaport (KL)",
    ],
  };

  // Return the POR array directly
  return data.POR;
};

// Function to fetch POR options from API if needed in the future
export const fetchPOROptions = async () => {
  try {
    // This function can be expanded later to fetch from an API
    // For now, returning the static list
    return getPOROptions();
  } catch (error) {
    console.error("Error fetching POR options:", error);
    return getPOROptions(); // Fallback to static list
  }
};

// React hook for consuming POR options in components
export const usePOROptions = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getOptions = async () => {
      try {
        const result = await fetchPOROptions();
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

// Add a helper function to check if a location is an ICD
const isICD = (location) => {
  // Assuming locations have a 'type' property or some identifier
  // Modify this based on your actual data structure
  return location && (location.type === "ICD" || location.name.includes("ICD"));
};

export default getPOROptions;
