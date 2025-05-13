import { useState, useEffect } from "react";

// Function that returns the POD options array
export const getPODOptions = () => {
  return [
    "Port of Shanghai, China",
    "Port of Singapore",
    "Port of Ningbo-Zhoushan, China",
    "Port of Shenzhen, China",
    "Port of Guangzhou, China",
    "Port of Busan, South Korea",
    "Port of Hong Kong, China",
    "Port of Qingdao, China",
    "Port of Tianjin, China",
    "Port of Jebel Ali, UAE",
    "Port of Rotterdam, Netherlands",
    "Port of Antwerp, Belgium",
    "Port of Hamburg, Germany",
    "Port of Los Angeles, USA",
    "Port of Long Beach, USA",
    "Port of New York and New Jersey, USA",
    "Port of Tanjung Pelepas, Malaysia",
    "Port of Kaohsiung, Taiwan",
    "Port of Colombo, Sri Lanka",
    "Port of Felixstowe, United Kingdom",
    "Port of Valencia, Spain",
    "Port of Algeciras, Spain",
    "Port of Laem Chabang, Thailand",
    "Port of Ho Chi Minh City, Vietnam",
    "Port of Santos, Brazil",
    "Port of Manzanillo, Mexico",
    "Port of Vancouver, Canada",
    "Port of Melbourne, Australia",
    "Port of Durban, South Africa",
    "Port of Alexandria, Egypt",
  ];
};

// Function to fetch POD options from API if needed in the future
export const fetchPODOptions = async () => {
  try {
    // This function can be expanded later to fetch from an API
    // For now, returning the static list
    return getPODOptions();
  } catch (error) {
    console.error("Error fetching POD options:", error);
    return getPODOptions(); // Fallback to static list
  }
};

// React hook for consuming POD options in components
export const usePODOptions = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getOptions = async () => {
      try {
        const result = await fetchPODOptions();
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

export default getPODOptions;
