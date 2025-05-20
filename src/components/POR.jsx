import { useState, useEffect } from "react";

// Function that returns the POR options as a flat array
export const getPOROptions = () => {
  const data = {
    ICDs: [
      "ACTL Faridabad (HR)",
      "Ahmedabad ICD (AMD)",
      "Ankleshwar ICD (AKV)",
      "Bangalore ICD (WFD)",
      "Bhiwadi ICD (BWD)",
      "Coimbatore ICD (CBE)",
      "Dadri ICD (UP)",
      "Dighi ICD (MH)",
      "Durgapur ICD (DGP)",
      "Garhi Harsaru ICD (HR)",
      "Hyderabad ICD (HYD)",
      "Irugur ICD (IRUGUR)",
      "Jaipur ICD (JPR)",
      "Jattipur / Panipat ICD (HR)",
      "Jodhpur ICD (RJ)",
      "Kanpur ICD (KNP)",
      "Khodiyar ICD (KHODIYAR)",
      "KSH ICD (MH)",
      "Loni ICD (LON)",
      "Ludhiana ICD (LDH)",
      "Madurai ICD (MDU)",
      "Modinagar ICD (UP)",
      "Moradabad ICD (MBQ)",
      "Nagpur ICD (NGP)",
      "Palwal ICD (HR)",
      "Pali ICD (HR)",
      "Patli ICD (HR)",
      "Patparganj ICD (DL)",
      "Piyala ICD (HR)",
      "Sonepat ICD (HR)",
      "Tughlakabad ICD (DL)"
    ],
    
    Seaports: [
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
