import { useState, useEffect } from "react";

// Function that returns the POR options as a flat array
export const getPOROptions = () => {
  const data = {
    ICDs: [
      "ICD Tughlakabad (DL)",
      "ICD Patparganj (DL)",
      "ICD Dadri (UP)",
      "ICD Ludhiana (LDH)",
      "ICD Kanpur (KNP)",
      "ICD Moradabad (MBQ)",
      "ICD Ahmedabad (AMD)",
      "ICD Nagpur (NGP)",
      "ICD Bhiwadi (BWD)",
      "ICD Loni (LON)",
      "ICD Khodiyar (KHODIYAR)",
      "ICD Bangalore Whitefield (WFD)",
      "ICD Durgapur (DGP)",
      "ICD Hyderabad (HYD)",
      "ICD Jaipur (JPR)",
      "ICD Ankleshwar (AKV)",
      "ICD Coimbatore (CBE)",
      "ICD Irugur (IRUGUR)",
      "ICD Madurai (MDU)",
      "ICD Garhi Harsaru (HR)",
      "ICD Patli (HR)",
      "ICD Pali (HR)",
      "ACTL Faridabad (HR)",
      "ICD Piyala (HR)",
      "ICD Palwal (HR)",
      "ICD Modinagar (UP)",
      "ICD Jattipur/ICD Panipat (HR)",
      "ICD Sonepat (HR)",
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
