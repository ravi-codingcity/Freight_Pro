import { useState, useEffect } from "react";

// Function that returns the POD options array
export const getPODOptions = () => {
  return [
    "Port Klang, Malaysia",
  "Port of Alexandria, Egypt",
  "Port of Algeciras, Spain",
  "Port of Antwerp, Belgium",
  "Port of Antwerp-Bruges, Belgium",
  "Port of Auckland, New Zealand",
  "Port of Barcelona, Spain",
  "Port of Buenos Aires, Argentina",
  "Port of Busan, South Korea",
  "Port of Cape Town, South Africa",
  "Port of Chittagong, Bangladesh",
  "Port of Colombo, Sri Lanka",
  "Port of Durban, South Africa",
  "Port of Felixstowe, United Kingdom",
  "Port of Genoa, Italy",
  "Port of Guangzhou (Nansha), China",
  "Port of Guangzhou, China",
  "Port of Haiphong, Vietnam",
  "Port of Hamburg, Germany",
  "Port of Ho Chi Minh City (Cat Lai), Vietnam",
  "Port of Ho Chi Minh City, Vietnam",
  "Port of Hong Kong, China",
  "Port of Hong Kong, Hong Kong",
  "Port of Jakarta (Tanjung Priok), Indonesia",
  "Port of Jebel Ali, UAE",
  "Port of Jebel Ali, United Arab Emirates",
  "Port of Jeddah, Saudi Arabia",
  "Port of Kaohsiung, Taiwan",
  "Port of Karachi, Pakistan",
  "Port of Laem Chabang, Thailand",
  "Port of Long Beach, USA",
  "Port of Long Beach, United States",
  "Port of Los Angeles, USA",
  "Port of Los Angeles, United States",
  "Port of Manila, Philippines",
  "Port of Manzanillo, Mexico",
  "Port of Melbourne, Australia",
  "Port of Montreal, Canada",
  "Port of New York and New Jersey, USA",
  "Port of New York and New Jersey, United States",
  "Port of Ningbo-Zhoushan, China",
  "Port of Osaka, Japan",
  "Port of Piraeus, Greece",
  "Port of Qingdao, China",
  "Port of Rotterdam, Netherlands",
  "Port of Salalah, Oman",
  "Port of Santos, Brazil",
  "Port of Savannah, United States",
  "Port of Shanghai, China",
  "Port of Shenzhen, China",
  "Port of Singapore",
  "Port of Singapore, Singapore",
  "Port of Southampton, United Kingdom",
  "Port of Sydney, Australia",
  "Port of Tanjung Pelepas, Malaysia",
  "Port of Tianjin, China",
  "Port of Tokyo, Japan",
  "Port of Valencia, Spain",
  "Port of Vancouver, Canada",
  "Port of Yokohama, Japan"
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
