import { useState, useEffect } from "react";

// Function that returns the POR options as a flat array
export const getPOROptions = () => {
  const data = {
    ICDs: [
       "Tughlakabad ICD (DL)",
      "Patparganj ICD (DL)",
      "Dadri ICD (UP)",
      "Ludhiana ICD (LDH)",
      "Kanpur ICD (KNP)",
      "Jaipur ICD (JPR)",
      "Jattipur / Panipat ICD (HR)",
      "Sonepat ICD (HR)",
      "Moradabad ICD (MBQ)",
      "Garhi Harsaru ICD (HR)",
      "Patli ICD (HR)",
      "Pali ICD (HR)",
      "Ahmedabad ICD (AMD)",
      "Nagpur ICD (NGP)",
      "Bhiwadi ICD (BWD)",
      "ACTL Faridabad (HR)",
      "Piyala ICD (HR)",
      "Palwal ICD (HR)",
      "Loni ICD (LON)",
      "Jodhpur ICD (RJ)",
      "Khodiyar ICD (KHODIYAR)",
      "Bangalore ICD (WFD)",
      "Durgapur ICD (DGP)",
      "Hyderabad ICD (HYD)",
      "Ankleshwar ICD (AKV)",
      "Coimbatore ICD (CBE)",
      "Irugur ICD (IRUGUR)",
      "Madurai ICD (MDU)",
      "Modinagar ICD (UP)",
      "Dighi ICD (MH)",
      "KSH ICD (MH)",
    ],
    Seaports: [
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
    ],
  };

  // Return a flat array combining ICDs and Seaports
  const combinedOptions = [...data.ICDs, ...data.Seaports];
  console.log("POR options generated:", combinedOptions.length);
  return combinedOptions;
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
