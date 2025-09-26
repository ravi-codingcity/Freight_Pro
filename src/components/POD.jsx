import { useState, useEffect } from "react";

// Function that returns the POD options array
export const getPODOptions = () => {
  return [
    "Abidjan, Ivory Coast",
    "Abu Dhabi Port, UAE",
    "Aden, Yemen",
    "Adelaide Port, Australia",
    "Alexandria, Egypt",
    "Algeciras, Spain",
    "Al Maqal, Iraq",
    "Altamira Port, Mexico",
    "Antofagasta Port, Chile",
    "Antwerp, Belgium",
    "Auckland, New Zealand",
    "Bahía Blanca Port, Argentina",
    "Bangkok Port, Thailand",
    "Bandar Abbas Port, Iran",
    "Bandar-e Anzali, Iran",
    "Banjul, Gambia",
    "Baltimore, MD",
    "Barcelona, Spain",
    "Barranquilla Port, Colombia",
    "Beira, Mozambique",
    "Belawan Port, Indonesia",
    "Belize, Belize",
    "Boston, MA",
    "Brisbane Port, Australia",
    "Buenos Aires, Argentina",
    "Buenaventura Port, Colombia",
    "Burnie Port, Australia",
    "Busan, South Korea",
    "Cai Mep Port, Vietnam",
    "Calgary, AB",
    "Cairns Port, Australia",
    "Callao Port, Peru",
    "Cam Ranh Port, Vietnam",
    "Cape Town, South Africa",
    "Cartagena Port, Colombia",
    "Casablanca, Morocco",
    "Charleston, SC",
    "Chicago (Joliet), IL",
    "Chicago, IL",
    "Chippewa Falls, WI",
    "Chennai Port, India",
    "Chittagong, Bangladesh",
    "Cincinnati, OH",
    "Cleveland, OH",
    "Colombo, Sri Lanka",
    "Colonia Port, Uruguay",
    "Columbus, OH",
    "Conakry, Guinea",
    "Dakar, Senegal",
    "Da Nang Port, Vietnam",
    "Dampier Port, Australia",
    "Dar es Salaam, Tanzania",
    "Darwin Port, Australia",
    "Detroit, MI",
    "Djibouti, Djibouti",
    "Doha, Qatar",
    "Duqm, Oman",
    "Durban, South Africa",
    "Edmonton, AB",
    "Elizabeth, South Africa",
    "Ensenada Port, Mexico",
    "Felixstowe, United Kingdom",
    "Freeport Port, Bahamas",
    "Fremantle Port, Australia",
    "Fujairah, UAE",
    "Geelong Port, Australia",
    "Genoa, Italy",
    "Geraldton Port, Australia",
    "Gladstone Port, Australia",
    "Greer, SC",
    "Guangzhou, China",
    "Guayaquil Port, Ecuador",
    "Guaymas Port, Mexico",
    "Gwangyang Port, South Korea",
    "Haifa Port, Israel",
    "Hamad, Qatar",
    "Hambantota Port, Sri Lanka",
    "Hamburg, Germany",
    "Harcourt, Nigeria",
    "Halifax, NS",
    "Haiphong, Vietnam",
    "Hedland Port, Australia",
    "Hobart Port, Australia",
    "Ho Chi Minh City, Vietnam",
    "Hodeidah, Yemen",
    "Hong Kong, Hong Kong",
    "Houston, TX",
    "Incheon Port, South Korea",
    "Indianapolis, IN",
    "Iquique Port, Chile",
    "Itajaí Port, Brazil",
    "Jakarta (Tanjung Priok), Indonesia",
    "Jebel Ali, UAE",
    "Jeddah, Saudi Arabia",
    "Kansas City, KS",
    "Kaohsiung Port, Taiwan",
    "Kaohsiung, Taiwan",
    "Karachi, Pakistan",
    "Keelung Port, Taiwan",
    "Kelang Port, Malaysia",
    "Khalid, UAE",
    "Khalifa Bin Salman, Bahrain",
    "Khalifa, UAE",
    "King Abdul Aziz, Saudi Arabia",
    "King Fahad Industrial, Saudi Arabia",
    "Kingston Port, Jamaica",
    "Khor Al Zubair, Iraq",
    "Khor Fakkan, UAE",
    "Klang, Malaysia",
    "Kobe Port, Japan",
    "Kolkata Port, India",
    "La Guaira Port, Venezuela",
    "Laem Chabang, Thailand",
    "Lagos (Apapa), Nigeria",
    "Lázaro Cárdenas Port, Mexico",
    "Libreville, Gabon",
    "Lomé, Togo",
    "Long Beach, CA",
    "Los Angeles, CA",
    "Luanda, Angola",
    "Manila, Philippines",
    "Manzanillo, Mexico",
    "Map Ta Phut Port, Thailand",
    "Maputo, Mozambique",
    "Matarani Port, Peru",
    "Medan Port, Indonesia",
    "Melbourne, Australia",
    "Memphis, TN",
    "Mendoza Port, Argentina",
    "Mesaieed, Qatar",
    "Miami, FL",
    "Minneapolis, MN",
    "Mina Salman, Bahrain",
    "Mina Saqr, UAE",
    "Mobile, AL",
    "Mombasa, Kenya",
    "Monrovia, Liberia",
    "Montevideo Port, Uruguay",
    "Montreal, QC",
    "Mongla Port, Bangladesh",
    "Mukalla, Yemen",
    "Mumbai Port, India",
    "Nashville, TN",
    "Nagoya Port, Japan",
    "Nassau Port, Bahamas",
    "Nhava Sheva (JNPT) Port, India",
    "New Orleans, LA",
    "New York, NY",
    "Newark, NJ",
    "Nha Trang Port, Vietnam",
    "Ningbo-Zhoushan, China",
    "Norfolk, VA",
    "Nouakchott, Mauritania",
    "Oakland, CA",
    "Omaha, NE",
    "Osaka, Japan",
    "Paita Port, Peru",
    "Paranaguá Port, Brazil",
    "Pasir Gudang Port, Malaysia",
    "Perth Port (Fremantle), Australia",
    "Philadelphia, PA",
    "Phu My Port, Vietnam",
    "Piraeus, Greece",
    "Pittsburgh, PA",
    "Pointe-Noire, Republic of Congo",
    "Port Everglades, FL",
    "Prince Rupert, BC",
    "Puerto Bolívar Port, Ecuador",
    "Puerto Cabello Port, Venezuela",
    "Puerto Cortes, Honduras",
    "Quebec City Port, Canada",
    "Qingdao, China",
    "Quy Nhon Port, Vietnam",
    "Rashid, UAE",
    "Richards Bay, South Africa",
    "Rio de Janeiro Port, Brazil",
    "Riyadh, Saudi Arabia",
    "Rosario Port, Argentina",
    "Rotterdam, Netherlands",
    "Salalah, Oman",
    "Salvador Port, Brazil",
    "San Antonio Port, Chile",
    "San Juan, Puerto Rico",
    "Santos, Brazil",
    "Santo Domingo, Dominican Republic",
    "Savannah, GA",
    "Seattle, WA",
    "Shanghai, China",
    "Shenzhen Port, China",
    "Shuaiba, Kuwait",
    "Shuwaikh, Kuwait",
    "Singapore, Singapore",
    "Sittwe Port, Myanmar",
    "Sohar, Oman",
    "Southampton, United Kingdom",
    "Sudan Port, Sudan",
    "Sultan Qaboos, Oman",
    "Surabaya Port, Indonesia",
    "Sydney, Australia",
    "Tacoma, WA",
    "Takoradi, Ghana",
    "Tan Cang Port, Vietnam",
    "Tanganyika (Kalemie), DRC",
    "Tangier, Morocco",
    "Tampa, FL",
    "Tianjin, China",
    "Tokyo, Japan",
    "Townsville Port, Australia",
    "Ulsan Port, South Korea",
    "Umm Qasr, Iraq",
    "USEC",
    "USWC",
    "Valencia, Spain",
    "Valparaíso Port, Chile",
    "Vancouver, BC",
    "Veracruz Port, Mexico",
    "Virginia Port (Norfolk), USA",
    "Visakhapatnam Port, India",
    "Vung Tau Port, Vietnam",
    "Walvis Bay, Namibia",
    "Winnipeg, MB",
    "Yangon Port, Myanmar",
    "Yanbu Commercial, Saudi Arabia",
    "Yokohama, Japan",
    "Zayed, UAE",
  ];
};

// Function to fetch POD options from API
export const fetchPODOptions = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return getPODOptions(); // Fallback to static list
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
      throw new Error("Failed to fetch POD options");
    }

    const forms = await response.json();
    
    // Extract unique PODs from forms
    const dynamicPODs = [...new Set(forms.map(form => form.pod).filter(Boolean))];
    
    // Combine with static options and remove duplicates
    const allPODs = [...new Set([...getPODOptions(), ...dynamicPODs])].sort();
    
    return allPODs;
  } catch (error) {
    console.error("Error fetching POD options:", error);
    return getPODOptions(); // Fallback to static list
  }
};

// Function to add a new POD to the existing list
export const addNewPOD = (currentOptions, newPOD) => {
  if (!newPOD || currentOptions.includes(newPOD)) {
    return currentOptions;
  }
  return [...currentOptions, newPOD].sort();
};

// React hook for consuming POD options in components
export const usePODOptions = () => {
  const [options, setOptions] = useState(getPODOptions()); // Initialize with static options
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const fetchOptions = async (forceRefresh = false) => {
    // Only fetch if it's been more than 5 seconds since last fetch or if force refresh
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime < 5000) {
      return;
    }

    try {
      const result = await fetchPODOptions();
      if (Array.isArray(result)) {
        setOptions(result);
        setLastFetchTime(now);
      }
    } catch (err) {
      setError(err.message);
      // Keep the static options if there's an error
      setOptions(getPODOptions());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions(true); // Initial fetch
  }, []);

  const addPOD = (newPOD) => {
    if (!newPOD || options.includes(newPOD)) {
      return;
    }
    
    // Immediately update local state
    setOptions(prevOptions => [...prevOptions, newPOD].sort());
    
    // Force refresh from server
    fetchOptions(true);
  };

  const refreshOptions = () => {
    fetchOptions(true);
  };

  return { options, loading, error, addPOD, refreshOptions };
};

export default getPODOptions;
