import React, { useState, useEffect, useRef } from "react";
import { TbRoute } from "react-icons/tb";
import { LuRefreshCcw } from "react-icons/lu";
import { LuTruck } from "react-icons/lu";
import { TbReceiptTax } from "react-icons/tb";
import { IoLocationOutline } from "react-icons/io5";
import { LuMessageSquareMore } from "react-icons/lu";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { GoPencil } from "react-icons/go";
import { FaRegBookmark } from "react-icons/fa";
import { AiOutlineControl } from "react-icons/ai";
import { LuContact, LuFileSpreadsheet, LuShip } from "react-icons/lu";
import { PiNewspaper } from "react-icons/pi";
import { LiaShipSolid } from "react-icons/lia";
import { MdDeleteForever } from "react-icons/md";
import { IoMailOutline } from "react-icons/io5";
import { FiHome } from "react-icons/fi";
import { MdOutlineEditLocation } from "react-icons/md";
import { IoMdTimer } from "react-icons/io";
import { PiShippingContainer } from "react-icons/pi";
import { HiOutlineBuildingOffice } from "react-icons/hi2";
import { IoCallOutline } from "react-icons/io5";
import { FiBox } from "react-icons/fi";
import { IoIosContact } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "../components/Navbar";
import { getPOROptions, usePOROptions } from "../components/POR";
import { getPOLOptions, usePOLOptions } from "../components/POL";
import { fetchPODOptions, usePODOptions } from "../components/POD";
import {
  getShippingLinesOptions,
  useShippingLinesOptions,
} from "../components/Shipping_lines";
import { getRatesByPortAndLine } from "../components/Origin_rates";
import { getRailFreightRates } from "../components/Rail_freightrates";
import {
  getContainerSizeOptions,
  getContainerSizeCategory,
} from "../components/Container_size"; // Import the container size functions
import DatePicker from "react-datepicker";
import { fetchUniqueRailRamps } from "../components/FDRR";
// Import needed functions from ShippingLine_PersonDetails
import {
  getContactSuggestions,
  prefetchShippingLineContactDetails,
  clearShippingLineContactCache, // <-- Add this import
} from "../components/ShippingLine_PersonDetails";
import { toast } from "react-toastify";

const Add_rates = () => {
  // Basic form state variables
  const [showDescription, setShowDescription] = useState(false);
  const [showRouteDescription, setShowRouteDescription] = useState(false);
  const [name, setName] = useState("");
  const [por, setpor] = useState("");
  const [pol, setpol] = useState("");
  const [polInput, setPolInput] = useState("");
  const [showPolSuggestions, setShowPolSuggestions] = useState(false);
  const [polSuggestions, setPolSuggestions] = useState([]);
  const [pod, setpod] = useState("");
  const [podInput, setPodInput] = useState("");
  const [podSuggestions, setPodSuggestions] = useState([]);
  const [showPodSuggestions, setShowPodSuggestions] = useState(false);
  const [fdrr, setfdrr] = useState("");
  const [shipping_lines, setshipping_lines] = useState("");
  const [shippingLineInput, setShippingLineInput] = useState("");
  const [showShippingLineSuggestions, setShowShippingLineSuggestions] =
    useState(false);
  const [shippingLineSuggestions, setShippingLineSuggestions] = useState([]);
  const [shipping_name, setshipping_name] = useState("");
  const [shipping_number, setshipping_number] = useState("");
  const [shipping_address, setshipping_address] = useState("");
  const [shipping_email, setshipping_email] = useState("");
  const [container_type, setContainer_type] = useState("");
  const [commodity, setCommodity] = useState("");
  const [route, setRoute] = useState("");
  const [ocean_freight, setOcean_freight] = useState("");
  const [acd_ens_afr, setacd_ens_afr] = useState("");
  const [acdCurrency, setAcdCurrency] = useState("USD");
  const [validity, setValidity] = useState("");
  const [validity_for, setValidity_for] = useState("");
  const [remarks, setRemarks] = useState("");
  const [transit, setTransittime] = useState("");
  const [bl_fees, setbl_fees] = useState("");
  const [thc, setthc] = useState("");
  const [muc, setmuc] = useState("");
  const [toll, settoll] = useState("");
  const [railFreightRates, setRailFreightRates] = useState({
    "(0-10 ton)": "₹0",
    "(10-20 ton)": "₹0",
    "(20-26 ton)": "₹0",
    "(26+ ton)": "₹0",
  });
  const datePickerRef = useRef(null);
  // UI state variables
  const [forms, setForms] = useState([]);
  const [editFormId, setEditFormId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedContainerSize, setSelectedContainerSize] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [remainingTimes, setRemainingTimes] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // Add this new state variable

  // OPTIONS STATE - DEFINE THESE ONLY ONCE!
  const {
    options: porOptions,
    loading: porLoading,
    error: porError,
  } = usePOROptions();
  const {
    options: polOptions,
    loading: polLoading,
    error: polError,
    refreshOptions: refreshPOLOptions,
  } = usePOLOptions();
  const {
    options: podOptions,
    loading: podLoading,
    error: podError,
    addPOD,
    refreshOptions: refreshPODOptions,
  } = usePODOptions();
  const {
    options: shippingLinesOptions,
    loading: shippingLinesLoading,
    error: shippingLinesError,
    refreshOptions: refreshShippingLinesOptions,
  } = useShippingLinesOptions();
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  // Calculator rates and related state
  const [currentRates, setCurrentRates] = useState({
    bl_fees: "0",
    thc: "0",
    muc: "0",
    toll: "0",
  });
  const [currentCurrencySymbol, setCurrentCurrencySymbol] = useState("$");

  // Weight rates and custom charges
  const [customCharges, setCustomCharges] = useState([
    { label: "", value: "", currency: "INR", unit: "" },
  ]);
  const [showCustomCharges, setShowCustomCharges] = useState(true);

  // Get container size options once when component initializes
  const containerSizeOptions = getContainerSizeOptions();

  // Add state for rail ramp options and dropdown control
  const [railRampOptions, setRailRampOptions] = useState([]);
  const [filteredRailRamps, setFilteredRailRamps] = useState([]);
  const [showRailRampDropdown, setShowRailRampDropdown] = useState(false);

  // Add state for contact suggestions
  const [contactSuggestions, setContactSuggestions] = useState([]);
  const [showContactSuggestions, setShowContactSuggestions] = useState(false);

  // Add state for contact suggestions loading
  const [contactSuggestionsLoading, setContactSuggestionsLoading] =
    useState(false);

  // Add this with other state declarations at the top
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Define toggle row expansion function
  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Currency symbol helper function
  const getCurrencySymbol = (currency) => {
    const symbols = {
      USD: "$",
      INR: "₹",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
    };
    return symbols[currency] || "$";
  };

  // Define the missing handleEdit function to populate the form with existing data
  const handleEdit = (item) => {
    console.log("Editing item:", item);
    setEditFormId(item._id);
    setName(item.name || "");
    setbl_fees(item.bl_fees || "");
    setthc(item.thc || "");
    setmuc(item.muc || "");
    settoll(item.toll || "");
    setpor(item.por || "");
    setpol(item.pol || "");
    setpod(item.pod || "");
    setPodInput(item.pod || "");
    setfdrr(item.fdrr || "");
    setshipping_lines(item.shipping_lines || "");
    setshipping_name(item.shipping_name || "");
    setshipping_number(item.shipping_number || "");
    setshipping_address(item.shipping_address || "");
    setshipping_email(item.shipping_email || "");
    setContainer_type(item.container_type || "");
    setCommodity(item.commodity || "");
    setRoute(item.route || "");

    // Handle Ocean Freight with currency name - Fixed parsing
    if (item.ocean_freight) {
      // Try to extract currency code, symbol, and amount from formats like "USD $1030" or "$100"
      const match = item.ocean_freight.match(
        /(USD|INR|EUR|GBP|JPY)\s*([₹$€£¥])\s*([0-9.]*)/
      );
      if (match) {
        const [, currencyCode, symbol, amount] = match;
        setSelectedCurrency(currencyCode);
        setOcean_freight(`${currencyCode} ${symbol}${amount}`);
      } else {
        // Fallback: try to parse symbol and amount only
        const symbolMatch = item.ocean_freight.match(/([₹$€£¥])\s*([0-9.]*)/);
        if (symbolMatch) {
          const [, symbol, amount] = symbolMatch;
          const currency = getCurrencyFromSymbol(symbol);
          setSelectedCurrency(currency);
          setOcean_freight(`${currency} ${symbol}${amount}`);
        } else {
          setOcean_freight("");
          setSelectedCurrency("USD");
        }
      }
    } else {
      setOcean_freight("");
      setSelectedCurrency("USD");
    }

    // Handle ACD/ENS/AFR
    setacd_ens_afr(() => {
      if (!item.acd_ens_afr) return "";
      // Split and strip currency symbol from amount
      const [type, amountRaw] = item.acd_ens_afr.split(" ");
      const amount = amountRaw ? amountRaw.replace(/[₹$€£¥]/g, "") : "";
      return `${type || "ACD"} ${amount}`.trim();
    });

    setValidity(item.validity || "");
    setValidity_for(item.validity_for || "");
    setRemarks(item.remarks || "");
    setTransittime(item.transit || "");

    // Set container size based on the container type
    const sizeCategory = getContainerSizeCategory(item.container_type || "");
    setSelectedContainerSize(sizeCategory);

    // Handle ACD currency separately
    if (item.acd_ens_afr) {
      const match = item.acd_ens_afr.match(/[₹$€£¥]/);
      if (match) {
        const symbol = match[0];
        switch (symbol) {
          case "$":
            setAcdCurrency("USD");
            break;
          case "€":
            setAcdCurrency("EUR");
            break;
          case "£":
            setAcdCurrency("GBP");
            break;
          case "¥":
            setAcdCurrency("JPY");
            break;
          case "₹":
            setAcdCurrency("INR");
            break;
          default:
            setAcdCurrency("USD");
        }
      } else {
        setAcdCurrency("USD"); // Default if no currency symbol found
      }
    }

    // Handle custom charges - different formats possible
    if (
      item.customCharges &&
      Array.isArray(item.customCharges) &&
      item.customCharges.length > 0
    ) {
      // New format: array of objects
      setCustomCharges(
        item.customCharges.map((charge) => ({
          label: charge.label || "",
          value: charge.value ? charge.value.replace(/[₹$€£¥]/g, "") : "",
          currency: getCurrencyFromSymbol(charge.value) || "USD",
          unit: charge.unit || "",
        }))
      );
    } else if (item.customLabel && item.customValue) {
      // Old format: delimited strings
      if (item.customLabel.includes("|||")) {
        // Multiple custom charges
        const labels = item.customLabel.split("|||");
        const values = item.customValue.split("|||");
        const units = item.customUnit ? item.customUnit.split("|||") : [];

        const charges = labels.map((label, i) => ({
          label: label || "",
          value: values[i] ? values[i].replace(/[₹$€£¥]/g, "") : "",
          currency: getCurrencyFromSymbol(values[i]) || "USD",
          unit: units[i] || "",
        }));

        setCustomCharges(charges);
      } else {
        // Single custom charge
        setCustomCharges([
          {
            label: item.customLabel || "",
            value: item.customValue
              ? item.customValue.replace(/[₹$€£¥]/g, "")
              : "",
            currency: getCurrencyFromSymbol(item.customValue) || "USD",
            unit: item.customUnit || "",
          },
        ]);
      }
    } else {
      // No custom charges found, set default
      setCustomCharges([{ label: "", value: "", currency: "USD", unit: "" }]);
    }

    // Handle rail freight rates
    if (item.railFreightRates) {
      let rates;

      if (typeof item.railFreightRates === "string") {
        try {
          rates = JSON.parse(item.railFreightRates);
        } catch (e) {
          console.error("Failed to parse railFreightRates string:", e);
          rates = {
            "(0-10 ton)": "₹0",
            "(10-20 ton)": "₹0",
            "(20-26 ton)": "₹0",
            "(26+ ton)": "₹0",
          };
        }
      } else if (typeof item.railFreightRates === "object") {
        rates = item.railFreightRates;
      } else {
        rates = {
          "(0-10 ton)": "₹0",
          "(10-20 ton)": "₹0",
          "(20-26 ton)": "₹0",
          "(26+ ton)": "₹0",
        };
      }

      setRailFreightRates(rates);
    } else {
      // Set default rail freight rates
      setRailFreightRates({
        "(0-10 ton)": "₹0",
        "(10-20 ton)": "₹0",
        "(20-26 ton)": "₹0",
        "(26+ ton)": "₹0",
      });
    }

    // Scroll to the top of the form for better UX
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper function to determine currency from a symbol
  const getCurrencyFromSymbol = (value) => {
    if (!value) return "USD";

    if (value.includes("$")) return "USD";
    if (value.includes("€")) return "EUR";
    if (value.includes("£")) return "GBP";
    if (value.includes("¥")) return "JPY";
    if (value.includes("₹")) return "INR";

    return "USD"; // Default currency
  };

  // DEDICATED useEffect for loading dropdown options - RUN ONCE ONLY
  useEffect(() => {
    console.log("Loading dropdown options...");

    const loadOptions = async () => {
      try {
        // Load POD options
        const podData = await fetchPODOptions();
        if (podData) {
          podData.forEach((pod) => addPOD(pod));
        }

        // Load POL options
        const polData = await getPOLOptions();
        if (polData) {
          refreshPOLOptions();
        }

        // Load Shipping Lines options
        const shippingLinesData = await getShippingLinesOptions();
        if (shippingLinesData) {
          console.log("Shipping lines options loaded:", shippingLinesData);
          refreshShippingLinesOptions();
        }

        setOptionsLoaded(true);
      } catch (error) {
        console.error("Error loading options:", error);
      }
    };

    loadOptions();
  }, []); // Empty dependency array - run once on mount

  // useEffect for user data and forms
  useEffect(() => {
    // Get the logged-in user's name from local storage
    const loggedInName = localStorage.getItem("username");
    if (loggedInName) {
      setName(loggedInName);
    }

    getUserForms();
  }, []);

  // useEffect for the rates calculator - now using all parameters
  useEffect(() => {
    // Only update rates if all four selections are made
    if (por && pol && shipping_lines && container_type) {
      console.log("All selections made, fetching rates...");

      // Get rates using the enhanced function with all four parameters
      getRatesByPortAndLine(por, shipping_lines, container_type, pol)
        .then((rates) => {
          console.log("Received rates from API:", rates);

          // Set rates without currency symbols
          setCurrentRates({
            bl_fees: rates.bl_fees,
            thc: rates.thc,
            muc: rates.muc,
            toll: rates.toll,
          });
        })
        .catch((error) => {
          console.error("Error fetching rates:", error);
          // Reset to zeros on error
          setCurrentRates({
            bl_fees: "0",
            thc: "0",
            muc: "0",
            toll: "0",
          });
        });

      // Also fetch rail freight rates with the same criteria
      getRailFreightRates(por, pol, shipping_lines, container_type)
        .then((rates) => {
          console.log("Received rail freight rates from API:", rates);
          setRailFreightRates(rates);
        })
        .catch((error) => {
          console.error("Error fetching rail freight rates:", error);
          // Reset to default rates
          setRailFreightRates({
            "(0-10 ton)": "₹0",
            "(10-20 ton)": "₹0",
            "(20-26 ton)": "₹0",
            "(26+ ton)": "₹0",
          });
        });
    } else {
      // Reset to zeros if not all selections are made
      console.log("Not all selections made, using default rates");
      setCurrentRates({
        bl_fees: "0",
        thc: "0",
        muc: "0",
        toll: "0",
      });
      setRailFreightRates({
        "(0-10 ton)": "₹0",
        "(10-20 ton)": "₹0",
        "(20-26 ton)": "₹0",
        "(26+ ton)": "₹0",
      });
    }
  }, [por, pol, shipping_lines, container_type]); // Updated dependency array

  // Add effect to update timer for each form
  useEffect(() => {
    // Calculate initial remaining times for all forms
    const initialTimes = {};
    forms.forEach((form) => {
      const creationTime = new Date(form.createdAt).getTime();
      const currentTime = new Date().getTime();
      const twoHoursInMs = 30 * 60 * 1000; // 30 minutes in milliseconds
      const remainingMs = Math.max(
        0,
        creationTime + twoHoursInMs - currentTime
      );
      initialTimes[form._id] = remainingMs;
    });
    setRemainingTimes(initialTimes);

    // Set up interval to update remaining times
    const timerInterval = setInterval(() => {
      setRemainingTimes((prevTimes) => {
        const updatedTimes = { ...prevTimes };
        let needsUpdate = false;
        forms.forEach((form) => {
          if (updatedTimes[form._id] > 0) {
            updatedTimes[form._id] = Math.max(0, updatedTimes[form._id] - 1000);
            needsUpdate = true;
          }
        });

        return needsUpdate ? updatedTimes : prevTimes;
      });
    }, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(timerInterval);
  }, [forms]);

  // Helper function to format the remaining time
  const formatRemainingTime = (ms) => {
    if (ms <= 0) return "Edit period expired";

    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds} minutes remaining for edit`;
  };

  // Helper function to format dates consistently in DD/MM/YYYY format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // This uses DD/MM/YYYY format
  };

  // Enhance clearFormFields to reset everything completely
  const clearFormFields = () => {
    setEditFormId(null);
    setShowDescription(false);
    setShowRouteDescription(false);
    setName("");
    setpor("");
    setpol("");
    setpod("");
    setPodInput(""); // Add this line to reset podInput
    setPodSuggestions([]); // Add this line to reset suggestions
    setShowPodSuggestions(false); // Add this line to hide suggestions
    setfdrr("");
    setshipping_lines("");
    setshipping_name("");
    setshipping_number("");
    setshipping_address("");
    setshipping_email("");
    setContainer_type("");
    setCommodity("");
    setRoute("");
    setOcean_freight("");
    setacd_ens_afr("");
    setAcdCurrency("USD");
    setValidity("");
    setValidity_for("");
    setRemarks("");
    setTransittime("");
    setbl_fees("");
    setthc("");
    setmuc("");
    settoll("");
    setRailFreightRates({
      "(0-10 ton)": "₹0",
      "(10-20 ton)": "₹0",
      "(20-26 ton)": "₹0",
      "(26+ ton)": "₹0",
    });
    setCustomCharges([{ label: "", value: "", currency: "USD", unit: "" }]);
    setShowCustomCharges(true);
    setSubmitError(null);

    console.log("Form fields have been cleared");
  };

  // Update the createForm function to handle the array of custom charges
  async function createForm(
    name,
    bl_fees,
    thc,
    muc,
    toll,
    por,
    pol,
    pod,
    fdrr,
    shipping_lines,
    shipping_name,
    shipping_number,
    shipping_address,
    shipping_email,
    container_type,
    commodity,
    route,
    ocean_freight,
    acd_ens_afr,
    validity,
    validity_for,
    remarks,
    transit,
    customCharges,
    customLabel, // Add parameter
    customValue, // Add parameter
    customUnit, // Add parameter
    railFreightRates // Make sure this parameter is included
  ) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // If no token, treat as an auth error
        handleAuthError({ message: "token not found" });
        return false;
      }

      // Make sure railFreightRates is defined and properly formatted
      const safeRailFreightRates = railFreightRates || {
        "(0-10 ton)": "₹0",
        "(10-20 ton)": "₹0",
        "(20-26 ton)": "₹0",
        "(26+ ton)": "₹0",
      };

      // Create a clean payload with no undefined values and both formats
      const payload = {
        name: name || "",
        bl_fees: bl_fees || "",
        thc: thc || "",
        muc: muc || "",
        toll: toll || "",
        por: por || "",
        pol: pol || "",
        pod: pod || "",
        fdrr: fdrr || "", // Include fdrr in the payload
        shipping_lines: shipping_lines || "",
        shipping_name: shipping_name || "",
        shipping_number: shipping_number || "",
        shipping_address: shipping_address || "",
        shipping_email: shipping_email || "",
        container_type: container_type || "",
        commodity: commodity || "",
        route: route || "",
        ocean_freight: ocean_freight || "",
        acd_ens_afr: acd_ens_afr || "",
        validity: validity || "",
        validity_for: validity_for || "",
        remarks: remarks || "",
        transit: transit || "",
        customCharges: customCharges || "[]", // Save the array of custom charges
        customLabel: customLabel || "", // Save old format for compatibility
        customValue: customValue || "", // Save old format for compatibility
        customUnit: customUnit || "", // Save unit for custom charges
        railFreightRates: safeRailFreightRates, // Ensure this is included in the payload
      };

      console.log("Full payload being submitted:", JSON.stringify(payload));
      console.log("customCharges in payload:", customCharges);
      console.log("customLabel in payload:", customLabel);
      console.log("customValue in payload:", customValue);
      console.log("customUnit in payload:", customUnit);

      const response = await fetch(
        "https://freightpro-4kjlzqm0.b4a.run/api/forms/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
          cache: "no-store",
        }
      );

      // Check for authentication errors
      if (response.status === 401) {
        handleAuthError({ response: { status: 401 } });
        return false;
      }

      // Enhanced error handling with response details
      if (!response.ok) {
        let errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error("Server error details:", errorData);
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Form created successfully:", data);

      // Clear form fields immediately to prevent accidental resubmission
      clearFormFields();

      // Delay fetching the updated forms list to ensure the server has processed the change
      setTimeout(() => {
        getUserForms();
        setIsSubmitting(false);
      }, 800); // Increase delay to 800ms to give server more time
      return true;
    } catch (error) {
      console.error("Error creating form:", error);
      // Check if this is an auth error
      if (!handleAuthError(error)) {
        // Only set other errors if not an auth error
        console.error("Error details:", error.message);
        setSubmitError(
          error.message || "Failed to submit form. Please try again."
        );
      }
      setIsSubmitting(false);
      return false;
    }
  }

  // Update the editForm function to correctly handle customCharges formatting
  async function editForm(
    formId,
    name,
    bl_fees,
    thc,
    muc,
    toll,
    por,
    pol,
    pod,
    fdrr,
    shipping_lines,
    shipping_name,
    shipping_number,
    shipping_address,
    shipping_email,
    container_type,
    commodity,
    route,
    ocean_freight,
    acd_ens_afr,
    validity,
    validity_for,
    remarks,
    transit,
    customCharges,
    customLabel,
    customValue,
    customUnit,
    railFreightRates
  ) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        handleAuthError({ message: "token not found" });
        return false;
      }

      // Ensure all required fields are present
      if (
        !name ||
        !por ||
        !pol ||
        !pod ||
        !shipping_lines ||
        !container_type ||
        !ocean_freight
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Format the data for submission
      const formattedData = {
        name,
        bl_fees: bl_fees || "0",
        thc: thc || "0",
        muc: muc || "0",
        toll: toll || "0",
        por,
        pol,
        pod,
        fdrr: fdrr || "",
        shipping_lines,
        shipping_name: shipping_name || "",
        shipping_number: shipping_number || "",
        shipping_address: shipping_address || "",
        shipping_email: shipping_email || "",
        container_type,
        commodity: commodity || "",
        route: route || "",
        ocean_freight,
        acd_ens_afr: acd_ens_afr || "",
        validity: validity || new Date().toISOString(),
        validity_for: validity_for || "30",
        remarks: remarks || "",
        transit: transit || "",
        customCharges: customCharges || "[]", // Store new format
        customLabel: customLabel || "", // Store old format for compatibility
        customValue: customValue || "", // Store old format for compatibility
        customUnit: customUnit || "", // Store old format for compatibility
        railFreightRates: railFreightRates || {},
      };

      console.log("Edit form data being submitted:", formattedData);

      const response = await fetch(
        `https://freightpro-4kjlzqm0.b4a.run/api/forms/${formId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update form");
      }

      return true;
    } catch (error) {
      console.error("Error updating form:", error);
      setSubmitError(
        error.message || "Failed to update form. Please try again."
      );
      return false;
    }
  }

  // Update the handleSubmit function to properly format the charges
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate required fields
      if (
        !por ||
        !pol ||
        !pod ||
        !shipping_lines ||
        !container_type ||
        !ocean_freight
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Get the current rates from the calculator
      const currentCalculatorRates = {
        bl_fees: currentRates.bl_fees || "0",
        thc: currentRates.thc || "0",
        muc: currentRates.muc || "0",
        toll: currentRates.toll || "0",
      };

      // Format monetary values by removing currency symbols and using calculator values
      const formattedBlFees =
        currentCalculatorRates.bl_fees.replace(/[₹$€£¥]/g, "") || "0";
      const formattedThc =
        currentCalculatorRates.thc.replace(/[₹$€£¥]/g, "") || "0";
      const formattedMuc =
        currentCalculatorRates.muc.replace(/[₹$€£¥]/g, "") || "0";
      const formattedToll =
        currentCalculatorRates.toll.replace(/[₹$€£¥]/g, "") || "0";

      // Format Ocean Freight with currency code and symbol - FIXED
      const oceanFreightValue =
        ocean_freight.split(" ").slice(1).join(" ") || "0"; // Get everything after currency code
      const oceanFreightAmount =
        oceanFreightValue.replace(/[₹$€£¥]/g, "") || "0"; // Remove any symbols
      const oceanFreightSymbol = getCurrencySymbol(selectedCurrency);
      const formattedOceanFreight = `${selectedCurrency} ${oceanFreightSymbol}${oceanFreightAmount}`;

      // Format ACD/ENS/AFR with currency symbol
      const acdCurrencySymbol = getCurrencySymbol(acdCurrency);
      const acdAmount =
        acd_ens_afr.split(" ")[1]?.replace(/[₹$€£¥]/g, "") || "0";
      const formattedAcdEnsAfr = acd_ens_afr
        ? `${acd_ens_afr.split(" ")[0]} ${acdCurrencySymbol}${acdAmount}`
        : "";

      // Format custom charges with currency symbols for new format
      const formattedCustomCharges = customCharges
        .filter((charge) => charge.label && charge.value) // Only include charges with both label and value
        .map((charge) => ({
          ...charge,
          value: charge.value
            ? `${getCurrencySymbol(charge.currency)}${charge.value.replace(
                /[₹$€£¥]/g,
                ""
              )}`
            : "0",
        }));

      // Format custom charges for old format (backward compatibility)
      const customLabels = customCharges
        .filter((charge) => charge.label && charge.value)
        .map((charge) => charge.label);
      const customValues = customCharges
        .filter((charge) => charge.label && charge.value)
        .map(
          (charge) =>
            `${getCurrencySymbol(charge.currency)}${charge.value.replace(
              /[₹$€£¥]/g,
              ""
            )}`
        );
      const customUnits = customCharges
        .filter((charge) => charge.label && charge.value)
        .map((charge) => charge.unit || "");

      // Join with delimiter for old format
      const formattedCustomLabel = customLabels.join("|||");
      const formattedCustomValue = customValues.join("|||");
      const formattedCustomUnit = customUnits.join("|||");

      // Get name from localStorage - Updated to use username instead of name
      const username = localStorage.getItem("username");
      if (!username) {
        toast.error("User session expired. Please login again.");
        return;
      }

      // Log the custom charges being submitted for debugging
      console.log("Submitting custom charges:", {
        newFormat: formattedCustomCharges,
        oldFormat: {
          label: formattedCustomLabel,
          value: formattedCustomValue,
          unit: formattedCustomUnit,
        },
      });

      if (editFormId) {
        // Editing existing form - Pass editFormId as the first parameter
        await editForm(
          editFormId, // Pass the form ID first
          username, // Then pass the username
          formattedBlFees,
          formattedThc,
          formattedMuc,
          formattedToll,
          por,
          pol,
          pod,
          fdrr,
          shipping_lines,
          shipping_name,
          shipping_number,
          shipping_address,
          shipping_email,
          container_type,
          commodity,
          route,
          formattedOceanFreight,
          formattedAcdEnsAfr,
          validity,
          validity_for,
          remarks,
          transit,
          JSON.stringify(formattedCustomCharges), // Store the new format
          formattedCustomLabel, // Store old format for compatibility
          formattedCustomValue,
          formattedCustomUnit,
          JSON.stringify(railFreightRates)
        );
        toast.success("Rate filing updated successfully!");
      } else {
        // Creating new form
        await createForm(
          username,
          formattedBlFees,
          formattedThc,
          formattedMuc,
          formattedToll,
          por,
          pol,
          pod,
          fdrr,
          shipping_lines,
          shipping_name,
          shipping_number,
          shipping_address,
          shipping_email,
          container_type,
          commodity,
          route,
          formattedOceanFreight,
          formattedAcdEnsAfr,
          validity,
          validity_for,
          remarks,
          transit,
          JSON.stringify(formattedCustomCharges), // Store the new format
          formattedCustomLabel, // Store old format for compatibility
          formattedCustomValue,
          formattedCustomUnit,
          JSON.stringify(railFreightRates)
        );
        toast.success("Rate filing created successfully!");
      }

      // Clear form fields after successful submission
      clearFormFields();

      // Refresh the rates list
      getUserForms();

      // After successful submission, refresh POL options
      await refreshPOLOptions();

      // After successful submission, refresh shipping lines options
      await refreshShippingLinesOptions();
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Improve getUserForms with better error handling and loading states
  async function getUserForms() {
    setIsDataLoading(true); // Set loading state to true before fetching
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // If no token exists, redirect to login
        alert("Authentication required. Please login.");
        window.location.href = "/";
        return;
      }

      const response = await fetch(
        "https://freightpro-4kjlzqm0.b4a.run/api/forms/user",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        // Handle expired token
        handleAuthError({ response: { status: 401 } });
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Check if data is an array before trying to sort it
      if (Array.isArray(data)) {
        console.log("Forms data from API:", data);
        // Debug custom charges data

        // Don't modify the validity field, just sort by creation date
        setForms(
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      } else {
        console.error("API returned non-array data:", data);
        setForms([]);
      }
    } catch (error) {
      console.error("Error fetching user forms:", error);
      // Check if this is an auth error before proceeding
      if (!handleAuthError(error)) {
        // Only set other errors if not an auth error
        // Don't clear existing forms on error
      }
    } finally {
      setIsDataLoading(false); // End loading state regardless of outcome
    }
  }

  // Function to check if a form is editable (within 30 minutes of creation)
  const isFormEditable = (createdAt) => {
    const creationTime = new Date(createdAt).getTime();
    const currentTime = new Date().getTime();
    const thirtyMinutesInMs = 30 * 60 * 1000; // 30 minutes in milliseconds
    return currentTime - creationTime <= thirtyMinutesInMs;
  };

  // Add a helper function to check if a form's validity has expired
  const isValidityExpired = (validityDate) => {
    if (!validityDate) return false;
    try {
      const validDate = new Date(validityDate);
      if (isNaN(validDate.getTime())) return false;
      const today = new Date();
      // Set hours, minutes, seconds to 0 to compare only the date
      today.setHours(0, 0, 0, 0);
      validDate.setHours(0, 0, 0, 0);

      return validDate < today;
    } catch (e) {
      console.error("Error checking validity expiration:", e);
      return false;
    }
  };

  // Simplified container type change handler with fixed dummy data
  const handleContainerTypeChange = (e) => {
    const containerType = e.target.value;
    setContainer_type(containerType);

    // Use the helper function from Container_size.jsx
    const newSize = getContainerSizeCategory(containerType);
    setSelectedContainerSize(newSize);

    // The useEffect hook will handle updating rates based on POR and container size
  };

  // Update the formatRailFreightRatesForDisplay function to handle currency symbols
  const formatRailFreightRatesForDisplay = (railFreightRates) => {
    if (!railFreightRates) return "No rail freight rates available";

    try {
      let ratesObj;
      if (typeof railFreightRates === "string") {
        ratesObj = JSON.parse(railFreightRates);
      } else {
        ratesObj = railFreightRates;
      }

      // Check if the object is empty
      if (Object.keys(ratesObj).length === 0) {
        return "No rail freight rates available";
      }

      return (
        <div className="grid gap-1 mt-1">
          {Object.entries(ratesObj).map(([weightRange, rate]) => (
            <span key={weightRange} className="text-xs">
              <span className="font-medium"></span> {weightRange}:{" "}
              <span className="text-black font-semibold">
                {rate} {/* The rate already includes the currency symbol */}
              </span>
              <span className="text-gray-600"> /Container</span>
            </span>
          ))}
        </div>
      );
    } catch (error) {
      console.error("Error formatting rail freight rates:", error);
      return "Error displaying rail freight rates";
    }
  };

  // POR dropdown rendering - This is where many errors happen
  const renderPOROptions = () => {
    if (!Array.isArray(porOptions) || porOptions.length === 0) {
      return (
        <option value="" disabled>
          {optionsLoaded ? "No options available" : "Loading options..."}
        </option>
      );
    }

    return porOptions.map((option, index) => (
      <option key={`por-${index}`} value={option}>
        {option}
      </option>
    ));
  };

  // Function to handle adding a new custom charge field
  const addCustomCharge = () => {
    if (customCharges.length < 5) {
      setCustomCharges([
        ...customCharges,
        { label: "", value: "", currency: "USD", unit: "" },
      ]);
    }
  };

  // Function to handle removing a custom charge
  const removeCustomCharge = (index) => {
    const updatedCharges = [...customCharges];
    updatedCharges.splice(index, 1);
    setCustomCharges(updatedCharges);
  };

  // Function to update custom charge fields
  const updateCustomCharge = (index, field, value) => {
    const updatedCharges = [...customCharges];
    updatedCharges[index] = { ...updatedCharges[index], [field]: value };
    setCustomCharges(updatedCharges);
  };

  // Rendering functions for dropdowns
  const renderShippingLinesOptions = () => {
    if (
      !Array.isArray(shippingLinesOptions) ||
      shippingLinesOptions.length === 0
    ) {
      return (
        <option value="" disabled>
          {optionsLoaded ? "No options available" : "Loading options..."}
        </option>
      );
    }

    return shippingLinesOptions.map((option, index) => (
      <option key={`shipping-${index}`} value={option}>
        {option}
      </option>
    ));
  };

  // Add this utility function near the top of your component - make sure it's defined only once
  const handleAuthError = (error) => {
    if (error?.response?.status === 401 || error?.message?.includes("token")) {
      // Clear user data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("currentUser");

      // Alert the user
      alert("Your session has expired. Please login again.");

      // Redirect to login page
      window.location.href = "/";
      return true;
    }
    return false;
  };

  // Enhance rail ramp useEffect to refresh on form submission
  useEffect(() => {
    // Fetch rail ramp options when component mounts or after form submission
    const getRailRampOptions = async () => {
      try {
        const ramps = await fetchUniqueRailRamps();
        // Sort alphabetically for consistent display
        const sortedRamps = ramps.sort((a, b) =>
          a.toLowerCase().localeCompare(b.toLowerCase())
        );
        setRailRampOptions(sortedRamps);
      } catch (error) {
        console.error("Error fetching rail ramp options:", error);
      }
    };

    getRailRampOptions();

    // After successful form submission, refresh the data
    if (!isSubmitting && !editFormId) {
      const refreshTimer = setTimeout(() => {
        getRailRampOptions();
      }, 1000);

      return () => clearTimeout(refreshTimer);
    }
  }, [isSubmitting, editFormId]); // Add dependencies to trigger refresh after submission

  // Update handleRailRampInputChange to show all options when empty
  const handleRailRampInputChange = (e) => {
    const value = e.target.value;
    setfdrr(value);

    // Filter options based on input value
    if (value.trim()) {
      const filtered = railRampOptions.filter((ramp) =>
        ramp.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredRailRamps(filtered);
    } else {
      // When input is empty, show all options
      setFilteredRailRamps(railRampOptions);
    }
    setShowRailRampDropdown(true);
  };

  // New function to handle input field focus
  const handleRailRampFocus = () => {
    // Show all options when the field is focused
    setFilteredRailRamps(railRampOptions);
    setShowRailRampDropdown(true);
  };

  // Add function to handle input field focus for contact name
  const handleContactNameFocus = () => {
    // Always check for fresh suggestions when focusing, even if we already have some
    if (shipping_lines) {
      // Show loading state first
      setContactSuggestionsLoading(true);
      setShowContactSuggestions(true);

      // Get fresh suggestions or from cache
      getContactSuggestions(shipping_lines)
        .then((suggestions) => {
          setContactSuggestions(suggestions);
          setContactSuggestionsLoading(false);
          // Keep the dropdown open even if we have no suggestions
          // (we'll show a "No suggestions found" message)
        })
        .catch((error) => {
          console.error("Error fetching contact suggestions on focus:", error);
          setContactSuggestionsLoading(false);
        });
    }
  };

  // Add missing function for rail ramp selection
  const handleRailRampSelect = (ramp) => {
    setfdrr(ramp);
    setShowRailRampDropdown(false);
  };

  // Add a new useEffect at the beginning of the component to prefetch contact data
  useEffect(() => {
    // Prefetch shipping line contact details in the background
    const prefetchContacts = async () => {
      try {
        console.log("Prefetching shipping line contact details...");
        await prefetchShippingLineContactDetails();
        console.log("Contact details prefetched successfully");
      } catch (error) {
        console.error("Error prefetching contact details:", error);
        // Non-critical error, can continue without blocking the UI
      }
    };

    prefetchContacts();
  }, []); // Run once when component mounts

  // Enhance the existing useEffect for contact suggestions to handle loading states better
  useEffect(() => {
    let isMounted = true;
    if (shipping_lines) {
      setContactSuggestionsLoading(true);
      getContactSuggestions(shipping_lines)
        .then((suggestions) => {
          if (isMounted) {
            setContactSuggestions(suggestions);
            setContactSuggestionsLoading(false);
          }
        })
        .catch((error) => {
          if (isMounted) {
            setContactSuggestions([]);
            setContactSuggestionsLoading(false);
          }
        });
    } else {
      setContactSuggestions([]);
      setContactSuggestionsLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [shipping_lines]);

  const handleContactSelect = (suggestion) => {
    console.log("Selected contact:", suggestion);

    // Only update fields that have values, preserving any manually entered data
    if (suggestion.name) setshipping_name(suggestion.name);
    if (suggestion.number) setshipping_number(suggestion.number);
    if (suggestion.email) setshipping_email(suggestion.email);
    if (suggestion.address) setshipping_address(suggestion.address);

    setShowContactSuggestions(false);
  };

  // Then modify the shipping line contact person section to add the suggestions dropdown
  // Find the Person Name input field inside the "Shipping Line Contact Person Details" section
  // and replace it with this code:

  // Add a function to copy a row's data into the form for new submission
  const handleCopy = (item) => {
    setEditFormId(null); // Clear edit form ID for copy
    setName(item.name || "");
    setbl_fees(item.bl_fees || "");
    setthc(item.thc || "");
    setmuc(item.muc || "");
    settoll(item.toll || "");
    setpor(item.por || "");
    setpol(item.pol || "");
    setpod(item.pod || "");
    setPodInput(item.pod || "");
    setfdrr(item.fdrr || "");
    setshipping_lines(item.shipping_lines || "");
    setshipping_name(item.shipping_name || "");
    setshipping_number(item.shipping_number || "");
    setshipping_address(item.shipping_address || "");
    setshipping_email(item.shipping_email || "");
    setContainer_type(item.container_type || "");
    setCommodity(item.commodity || "");
    setRoute(item.route || "");

    // Handle Ocean Freight with currency name - Fixed parsing for copy
    if (item.ocean_freight) {
      // Try to extract currency code, symbol, and amount from formats like "USD $1030" or "$100"
      const match = item.ocean_freight.match(
        /(USD|INR|EUR|GBP|JPY)\s*([₹$€£¥])\s*([0-9.]*)/
      );
      if (match) {
        const [, currencyCode, symbol, amount] = match;
        setSelectedCurrency(currencyCode);
        setOcean_freight(`${currencyCode} ${symbol}${amount}`);
      } else {
        // Fallback: try to parse symbol and amount only
        const symbolMatch = item.ocean_freight.match(/([₹$€£¥])\s*([0-9.]*)/);
        if (symbolMatch) {
          const [, symbol, amount] = symbolMatch;
          const currency = getCurrencyFromSymbol(symbol);
          setSelectedCurrency(currency);
          setOcean_freight(`${currency} ${symbol}${amount}`);
        } else {
          setOcean_freight("");
          setSelectedCurrency("USD");
        }
      }
    } else {
      setOcean_freight("");
      setSelectedCurrency("USD");
    }

    // Handle ACD/ENS/AFR
    setacd_ens_afr(() => {
      if (!item.acd_ens_afr) return "";
      // Split and strip currency symbol from amount
      const [type, amountRaw] = item.acd_ens_afr.split(" ");
      const amount = amountRaw ? amountRaw.replace(/[₹$€£¥]/g, "") : "";
      return `${type || "ACD"} ${amount}`.trim();
    });

    setValidity(item.validity || "");
    setValidity_for(item.validity_for || "");
    setRemarks(item.remarks || "");
    setTransittime(item.transit || "");

    // Set container size based on the container type
    const sizeCategory = getContainerSizeCategory(item.container_type || "");
    setSelectedContainerSize(sizeCategory);

    // Handle ACD currency separately
    if (item.acd_ens_afr) {
      const match = item.acd_ens_afr.match(/[₹$€£¥]/);
      if (match) {
        const symbol = match[0];
        switch (symbol) {
          case "$":
            setAcdCurrency("USD");
            break;
          case "€":
            setAcdCurrency("EUR");
            break;
          case "£":
            setAcdCurrency("GBP");
            break;
          case "¥":
            setAcdCurrency("JPY");
            break;
          case "₹":
            setAcdCurrency("INR");
            break;
          default:
            setAcdCurrency("USD");
        }
      } else {
        setAcdCurrency("USD"); // Default if no currency symbol found
      }
    }

    // Handle custom charges - different formats possible
    if (
      item.customCharges &&
      Array.isArray(item.customCharges) &&
      item.customCharges.length > 0
    ) {
      // New format: array of objects
      setCustomCharges(
        item.customCharges.map((charge) => ({
          label: charge.label || "",
          value: charge.value ? charge.value.replace(/[₹$€£¥]/g, "") : "",
          currency: getCurrencyFromSymbol(charge.value) || "USD",
          unit: charge.unit || "",
        }))
      );
    } else if (item.customLabel && item.customValue) {
      // Old format: delimited strings
      if (item.customLabel.includes("|||")) {
        // Multiple custom charges
        const labels = item.customLabel.split("|||");
        const values = item.customValue.split("|||");
        const units = item.customUnit ? item.customUnit.split("|||") : [];

        const charges = labels.map((label, i) => ({
          label: label || "",
          value: values[i] ? values[i].replace(/[₹$€£¥]/g, "") : "",
          currency: getCurrencyFromSymbol(values[i]) || "USD",
          unit: units[i] || "",
        }));

        setCustomCharges(charges);
      } else {
        // Single custom charge
        setCustomCharges([
          {
            label: item.customLabel || "",
            value: item.customValue
              ? item.customValue.replace(/[₹$€£¥]/g, "")
              : "",
            currency: getCurrencyFromSymbol(item.customValue) || "USD",
            unit: item.customUnit || "",
          },
        ]);
      }
    } else {
      // No custom charges found, set default
      setCustomCharges([{ label: "", value: "", currency: "USD", unit: "" }]);
    }

    // Handle rail freight rates
    if (item.railFreightRates) {
      let rates;
      if (typeof item.railFreightRates === "string") {
        try {
          rates = JSON.parse(item.railFreightRates);
        } catch (e) {
          rates = {
            "(0-10 ton)": "₹0",
            "(10-20 ton)": "₹0",
            "(20-26 ton)": "₹0",
            "(26+ ton)": "₹0",
          };
        }
      } else if (typeof item.railFreightRates === "object") {
        rates = item.railFreightRates;
      } else {
        rates = {
          "(0-10 ton)": "₹0",
          "(10-20 ton)": "₹0",
          "(20-26 ton)": "₹0",
          "(26+ ton)": "₹0",
        };
      }
      setRailFreightRates(rates);
    } else {
      setRailFreightRates({
        "(0-10 ton)": "₹0",
        "(10-20 ton)": "₹0",
        "(20-26 ton)": "₹0",
        "(26+ ton)": "₹0",
      });
    }

    // Make sure we are NOT in edit mode
    setEditFormId(null);
    // Scroll to the top of the form for better UX
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add this new function to handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Use setTimeout to simulate a small delay for better UX
    setTimeout(() => {
      clearFormFields();
      setIsRefreshing(false);
    }, 500);
  };

  // Add this new function to handle POD input changes
  const handlePodInputChange = (e) => {
    const value = e.target.value;
    setPodInput(value);
    setpod(value);

    if (value) {
      // Filter and ensure unique values
      const filtered = [...new Set(podOptions)].filter((option) =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setPodSuggestions(filtered);
      setShowPodSuggestions(true);
    } else {
      setPodSuggestions([]);
      setShowPodSuggestions(false);
    }
  };

  // Add this new function to handle POD selection
  const handlePodSelect = (selectedPod) => {
    setPodInput(selectedPod);
    setpod(selectedPod);
    setShowPodSuggestions(false);
    // Only add if it doesn't already exist
    if (!podOptions.includes(selectedPod)) {
      addPOD(selectedPod);
      refreshPODOptions();
    }
  };

  // Add this new function to handle POD input blur
  const handlePodInputBlur = async () => {
    setTimeout(() => {
      setShowPodSuggestions(false);
    }, 200);

    if (podInput && !podOptions.includes(podInput)) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authentication required. Please login again.");
          return;
        }

        // Add the new POD to the local state immediately
        addPOD(podInput);
        toast.success("New POD added successfully!");

        // Force refresh the options
        refreshPODOptions();
      } catch (error) {
        console.error("Error handling POD input blur:", error);
        toast.error("Failed to process POD. Please try again.");
      }
    }
  };

  // Add a function to format custom charges for display
  const formatCustomChargesForDisplay = (customCharges) => {
    if (!customCharges) return null;

    try {
      let charges;
      if (typeof customCharges === "string") {
        charges = JSON.parse(customCharges);
      } else {
        charges = customCharges;
      }

      if (!Array.isArray(charges) || charges.length === 0) {
        return null;
      }

      return (
        <div className="mt-2 border-t border-gray-200 pt-2">
          <span className="text-xs font-medium text-gray-500">
            Other Charges:
          </span>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {charges.map((charge, index) => (
              <p key={index} className="text-xs font-medium">
                {charge.label}: {charge.value}
                {charge.unit && (
                  <span className="text-gray-500"> {charge.unit}</span>
                )}
              </p>
            ))}
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error formatting custom charges:", error);
      return null;
    }
  };

  // Add this function to handle POL input changes
  const handlePolInputChange = (e) => {
    const value = e.target.value;
    setpol(value);
    setPolInput(value);

    // Filter suggestions based on input
    if (value.trim()) {
      const filtered = polOptions.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setPolSuggestions(filtered);
      setShowPolSuggestions(true);
    } else {
      setPolSuggestions([]);
      setShowPolSuggestions(false);
    }
  };

  // Add this function to handle POL selection
  const handlePolSelect = (selectedPol) => {
    setpol(selectedPol);
    setPolInput(selectedPol);
    setShowPolSuggestions(false);
  };

  // Add this function to handle POL input blur
  const handlePolInputBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      setShowPolSuggestions(false);
    }, 200);
  };

  // Add useEffect to initialize polInput when pol changes
  useEffect(() => {
    setPolInput(pol);
  }, [pol]);

  // Add this function to handle shipping line input changes
  const handleShippingLineInputChange = (e) => {
    const value = e.target.value;
    setShippingLineInput(value);
    setshipping_lines(value);

    // Filter suggestions based on input
    if (value.trim()) {
      const filtered = shippingLinesOptions.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setShippingLineSuggestions(filtered);
      setShowShippingLineSuggestions(true);
    } else {
      setShippingLineSuggestions([]);
      setShowShippingLineSuggestions(false);
    }
  };

  // Add this function to handle shipping line selection
  const handleShippingLineSelect = (selectedShippingLine) => {
    setshipping_lines(selectedShippingLine);
    setShippingLineInput(selectedShippingLine);
    setShowShippingLineSuggestions(false);
  };

  // Add this function to handle shipping line input blur
  const handleShippingLineInputBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      setShowShippingLineSuggestions(false);
    }, 200);
  };

  // Add useEffect to initialize shippingLineInput when shipping_lines changes
  useEffect(() => {
    setShippingLineInput(shipping_lines);
  }, [shipping_lines]);

  return (
    <>
      <Navbar />
      <div className="max-w-6xl px-5 mx-auto">
        {/* Rate Card Form */}
        <div className="flex flex-col-reverse lg:flex-row justify-between">
          {/* Form Section - Enhanced UI with card-like appearance */}
          <div className="w-full lg:w-3/5 mx-auto sm:mx-3 order-2 lg:order-1 mt-3 ">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-600 ">
              {/* Form Header with gradient */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-2 relative overflow-hidden">
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                  <LuFileSpreadsheet className="mr-1" />
                  Rate Filings
                </h1>
                <p className="text-blue-100 mt-1 text-sm">
                  Complete the form below to submit your shipping rates
                </p>
              </div>

              <div className="sm:px-2 pb-3">
                {/* Error message display with enhanced styling */}
                {submitError && (
                  <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md relative animate-fade-in-down">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 101.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">{submitError}</p>
                      </div>
                      <div className="ml-auto pl-3">
                        <div className="-mx-1.5 -my-1.5">
                          <button
                            onClick={() => setSubmitError(null)}
                            className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 011.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* User Name - Hidden */}
                  <div className="hidden">
                    <input
                      type="text"
                      value={name}
                      readOnly
                      className="hidden"
                    />
                  </div>

                  {/* Form Sections with visual separation */}
                  {/* SECTION: Route Information */}
                  <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 mt-0">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center">
                        <TbRoute className="mr-2" />
                        Route Information
                      </h3>
                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`bg-blue-500 text-white px-2 py-1 rounded-md text-sm flex items-center transition-all duration-200 ${
                          isRefreshing
                            ? "opacity-75 cursor-not-allowed"
                            : "hover:bg-blue-600"
                        }`}
                      >
                        {isRefreshing ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Refreshing...
                          </>
                        ) : (
                          <>
                            <LuRefreshCcw className="mr-2" /> Refresh
                          </>
                        )}
                      </button>
                    </div>

                    {/* POR + POL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* POR */}
                      <div className="mb-1">
                        <label className="block text-sm font-medium text-black mb-1">
                          POR (Place of Receipt){" "}
                          <span className="text-red-500 ">*</span>
                        </label>
                        <div className="relative shadow-sm rounded-md border border-blue-300">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <IoLocationOutline />
                          </div>
                          <select
                            value={por}
                            onChange={(e) => setpor(e.target.value)}
                            className="appearance-none block w-full pl-10 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-700"
                            required
                          >
                            <option value="">Select POR</option>
                            {porOptions.map((option, index) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <IoIosArrowDown />
                          </div>
                        </div>
                        {porError && (
                          <p className="mt-1 text-sm text-red-600">
                            Error loading POR options: {porError}
                          </p>
                        )}
                      </div>
                      {/* Shipping Line */}
                      <div className="mb-1 sm:block hidden">
                        <label className="block text-sm font-medium text-black mb-1">
                          Shipping Line <span className="text-red-500 ">*</span>
                        </label>
                        <div className="relative shadow-sm rounded-md border border-blue-300"> 
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LiaShipSolid />
                          </div>
                          <input
                            type="text"
                            value={shippingLineInput}
                            onChange={handleShippingLineInputChange}
                            onFocus={() => setShowShippingLineSuggestions(true)}
                            onBlur={handleShippingLineInputBlur}
                            className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-700"
                            placeholder="Type or Select Shipping Line"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"></div>
                          {showShippingLineSuggestions &&
                            shippingLineSuggestions.length > 0 && (
                              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                                {shippingLineSuggestions.map(
                                  (suggestion, index) => (
                                    <div
                                      key={index}
                                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                                      onClick={() =>
                                        handleShippingLineSelect(suggestion)
                                      }
                                    >
                                      <span className="block truncate text-gray-700">
                                        {suggestion}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                        {shippingLinesError && (
                          <p className="mt-1 text-sm text-red-600">
                            Error loading Shipping Line options:{" "}
                            {shippingLinesError}
                          </p>
                        )}
                      </div>
                      {/* POL */}
                      <div className="mb-1">
                        <label className="block text-sm font-medium text-black mb-1">
                          POL (Port of Loading){" "}
                          <span className="text-red-500 ">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm border border-blue-300">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LuShip />
                          </div>
                          <input
                            type="text"
                            value={polInput}
                            onChange={handlePolInputChange}
                            onFocus={() => setShowPolSuggestions(true)}
                            onBlur={handlePolInputBlur}
                            className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-700"
                            placeholder="Type or Select POL"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"></div>
                          {showPolSuggestions && polSuggestions.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                              {polSuggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                                  onClick={() => handlePolSelect(suggestion)}
                                >
                                  <span className="block truncate text-gray-700">
                                    {suggestion}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {polError && (
                          <p className="mt-1 text-sm text-red-600">
                            Error loading POL options: {polError}
                          </p>
                        )}
                      </div>

                      {/* Container Type */}
                      <div className="mb-1 sm:block hidden">
                        <label className="block text-sm font-medium text-black mb-1">
                          Container Type{" "}
                          <span className="text-red-500 ">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm  border border-blue-300">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PiShippingContainer />
                          </div>
                          <select
                            value={container_type}
                            onChange={handleContainerTypeChange}
                            className="appearance-none block w-full pl-10 pr-5 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-700"
                            required
                          >
                            <option value="" disabled>
                              Select Container Type
                            </option>
                            {containerSizeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <IoIosArrowDown />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/*  POD */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 order-2">
                      <div className="mb-1 ">
                        <label className="block text-sm font-medium text-black mb-1">
                          POD (Port of Discharge){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm border border-blue-300">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LuShip />
                          </div>
                          <input
                            type="text"
                            value={podInput}
                            onChange={handlePodInputChange}
                            onBlur={handlePodInputBlur}
                            onFocus={() => setShowPodSuggestions(true)}
                            className="appearance-none block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-700"
                            placeholder="Type or Select POD"
                            required
                          />
                          {showPodSuggestions && podSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                              {podSuggestions.map((suggestion) => (
                                <div
                                  key={suggestion}
                                  className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm"
                                  onClick={() => handlePodSelect(suggestion)}
                                >
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Commodity Type */}
                      <div className="mb-1 sm:block hidden">
                        <label className="block text-sm font-medium text-black mb-1">
                          Commodity Type{" "}
                          <span className="text-red-500 ">*</span>
                        </label>
                        {showDescription ? (
                          <div>
                            <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiBox />
                              </div>
                              <input
                                type="text"
                                placeholder="Enter commodity specific description"
                                value={commodity}
                                onChange={(e) => setCommodity(e.target.value)}
                                className=" block w-full pl-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out text-gray-700"
                                required
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowDescription(false)}
                              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                            >
                              <FaArrowLeft />
                              Back to selection
                            </button>
                          </div>
                        ) : (
                          <div className="relative rounded-md shadow-sm border border-blue-300">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiBox />
                            </div>
                            <select
                              value={commodity}
                              onChange={(e) => {
                                if (e.target.value === "Commodity Specific") {
                                  setShowDescription(true);
                                  setCommodity("");
                                } else {
                                  setCommodity(e.target.value);
                                }
                              }}
                              className="appearance-none block w-full pl-10 pr-5 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-700"
                              required
                            >
                              <option value="" disabled>
                                Select Commodity Type
                              </option>
                              <option value="FAK">FAK</option>
                              <option value="Commodity Specific">
                                Commodity Specific
                              </option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <IoIosArrowDown />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Final Destination (Rail Ramp) */}
                    <div className="bg-gray-50 py-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                        {/* Final Destination (Rail Ramp) */}
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-black mb-1">
                            Final Destination (Rail Ramp)
                          </label>
                          <div className="relative rounded-md shadow-sm border border-blue-300">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <HiOutlineBuildingOffice />
                            </div>
                            <input
                              value={fdrr}
                              type="text"
                              placeholder="Type or Select Final Destination (Rail Ramp)"
                              onChange={handleRailRampInputChange}
                              onFocus={handleRailRampFocus}
                              onBlur={() =>
                                setTimeout(
                                  () => setShowRailRampDropdown(false),
                                  200
                                )
                              }
                              className=" appearance-none block w-full pl-10 pr-5 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-700"
                            />
                            {showRailRampDropdown &&
                              filteredRailRamps.length > 0 && (
                                <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                  {filteredRailRamps.map((ramp, index) => (
                                    <div
                                      key={index}
                                      className=" cursor-pointer hover:bg-indigo-50 py-2 px-3 text-gray-900"
                                      onMouseDown={() =>
                                        handleRailRampSelect(ramp)
                                      }
                                    >
                                      {ramp}
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>{" "}
                      {/* Shipping Line for mobile*/}
                      <div className="mb-2 block sm:hidden">
                        <label className="block text-sm font-medium text-black mb-1">
                          Shipping Line <span className="text-red-500 ">*</span>
                        </label>
                        <div className="relative  shadow-sm rounded-md border border-blue-300">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LiaShipSolid />
                          </div>
                          <select
                            value={shipping_lines}
                            onChange={(e) => setshipping_lines(e.target.value)}
                            className="appearance-none block w-full pl-10 pr-5 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-700"
                            required
                          >
                            <option value="" disabled>
                              Select Shipping Line
                            </option>
                            {renderShippingLinesOptions()}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <IoIosArrowDown />
                          </div>
                        </div>
                      </div>
                      {/* Container Type for mobile*/}
                      <div className="mb-2 block sm:hidden">
                        <label className="block text-sm font-medium text-black mb-1">
                          Container Type{" "}
                          <span className="text-red-500 ">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm  border border-blue-300">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PiShippingContainer />
                          </div>
                          <select
                            value={container_type}
                            onChange={handleContainerTypeChange}
                            className="appearance-none block w-full pl-10 pr-5 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-700"
                            required
                          >
                            <option value="" disabled>
                              Select Container Type
                            </option>
                            {containerSizeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <IoIosArrowDown />
                          </div>
                        </div>
                      </div>
                      {/* Commodity Type for mobile*/}
                      <div className="mb-2 block sm:hidden">
                        <label className="block text-sm font-medium text-black mb-1">
                          Commodity Type{" "}
                          <span className="text-red-500 ">*</span>
                        </label>
                        {showDescription ? (
                          <div>
                            <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiBox />
                              </div>
                              <input
                                type="text"
                                placeholder="Enter commodity specific description"
                                value={commodity}
                                onChange={(e) => setCommodity(e.target.value)}
                                className=" block w-full pl-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out text-gray-700"
                                required
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowDescription(false)}
                              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                            >
                              <FaArrowLeft />
                              Back to selection
                            </button>
                          </div>
                        ) : (
                          <div className="relative rounded-md shadow-sm border border-blue-300">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiBox />
                            </div>
                            <select
                              value={commodity}
                              onChange={(e) => {
                                if (e.target.value === "Commodity Specific") {
                                  setShowDescription(true);
                                  setCommodity("");
                                } else {
                                  setCommodity(e.target.value);
                                }
                              }}
                              className="appearance-none block w-full pl-10 pr-5 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-700"
                              required
                            >
                              <option value="" disabled>
                                Select Commodity Type
                              </option>
                              <option value="FAK">FAK</option>
                              <option value="Commodity Specific">
                                Commodity Specific
                              </option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <IoIosArrowDown />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION: Freight & Routing */}
                    <div className="bg-gray-50 sm:py-3 sm:px-2 py-2 px-2 rounded-lg border border-gray-200">
                      <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center">
                        <HiOutlineCurrencyDollar className="mr-2 text-lg" />
                        Freight Details & Routing
                      </h3>
                      {/* First row: Ocean Freight, Transit Time, Routing */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
                        {/* Ocean Freight */}
                        <div className="mb-1">
                          <label className="block text-sm font-medium text-black mb-1">
                            Ocean Freight{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1 flex h-8 rounded-md border border-blue-300">
                            <span className="relative inline-flex items-center px-1 rounded-l-md border-r border bg-gray-50 text-gray-500 sm:text-sm">
                              <select
                                className="appearance-none h-full px-3 border-0 bg-transparent focus:ring-0 focus:outline-none text-gray-700"
                                value={selectedCurrency}
                                onChange={(e) => {
                                  const newCurrency = e.target.value;
                                  setSelectedCurrency(newCurrency);
                                  // Update ocean freight value with new currency
                                  const currentAmount =
                                    ocean_freight
                                      .split(" ")
                                      .slice(1)
                                      .join(" ")
                                      .replace(/[₹$€£¥]/g, "") || "";
                                  const newSymbol =
                                    getCurrencySymbol(newCurrency);
                                  setOcean_freight(
                                    `${newCurrency} ${newSymbol}${currentAmount}`
                                  );
                                }}
                              >
                                <option value="USD">USD $</option>
                                <option value="INR">INR ₹</option>
                                <option value="EUR">EUR €</option>
                                <option value="GBP">GBP £</option>
                                <option value="JPY">JPY ¥</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex pl-3 items-center text-gray-600">
                                <IoIosArrowDown />
                              </div>
                            </span>
                            <input
                              value={(() => {
                                // Extract just the amount part for display
                                const parts = ocean_freight.split(" ");
                                if (parts.length > 1) {
                                  return parts
                                    .slice(1)
                                    .join(" ")
                                    .replace(/[₹$€£¥]/g, "");
                                }
                                return "";
                              })()}
                              onChange={(e) => {
                                const amount = e.target.value;
                                const symbol =
                                  getCurrencySymbol(selectedCurrency);
                                setOcean_freight(
                                  `${selectedCurrency} ${symbol}${amount}`
                                );
                              }}
                              className="flex-1 min-w-0 block w-full rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-1"
                              placeholder="Enter Amount"
                              required
                            />
                          </div>
                        </div>
                        {/* Transit Time */}
                        <div className="mb-1">
                          <label className="block text-sm font-medium text-black mb-1">
                            Transit Time (Days)
                          </label>
                          <div className="relative shadow-sm rounded-md border border-blue-300 ">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <IoMdTimer className="text-gray-400 text-lg" />
                            </div>
                            <select
                              value={transit}
                              onChange={(e) => setTransittime(e.target.value)}
                              className="appearance-none block w-full pl-[36px] pr-5 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-600"
                            >
                              <option value="" disabled>
                                Select Transit Time
                              </option>
                              {[...Array(100)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1} {i + 1 === 1 ? "Day" : "Days"}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <IoIosArrowDown />
                            </div>
                          </div>
                        </div>
                        {/* Routing */}
                        <div className="mb-1">
                          <label className="block text-sm font-medium text-black mb-1">
                            Routing
                          </label>
                          {showRouteDescription ? (
                            <div>
                              <div className="relative shadow-sm rounded-md border border-blue-300">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <MdOutlineEditLocation />
                                </div>
                                <input
                                  type="text"
                                  placeholder="Enter Routing Description"
                                  value={route}
                                  onChange={(e) => setRoute(e.target.value)}
                                  className="block w-full pl-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowRouteDescription(false)}
                                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                              >
                                <FaArrowLeft />
                                Back to Selection
                              </button>
                            </div>
                          ) : (
                            <div className="relative shadow-sm rounded-md border border-blue-300">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdOutlineEditLocation className="text-gray-500 " />
                              </div>
                              <select
                                value={route}
                                onChange={(e) => {
                                  if (e.target.value === "Via") {
                                    setShowRouteDescription(true);
                                    setRoute("");
                                  } else {
                                    setRoute(e.target.value);
                                  }
                                }}
                                className="appearance-none block w-full pl-8 pr-5 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-700"
                                required
                              >
                                <option value="" disabled>
                                  Select Route
                                </option>
                                <option value="Direct">Direct</option>
                                <option value="Via">Via</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <IoIosArrowDown className="text-gray-500 " />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Second row: Select ACD/ENS/AFR Charges, Validity (End Date) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {/* Select ACD/ENS/AFR Charges */}

                        <div className="mb-1">
                          <label className="block text-sm font-medium text-black mb-1">
                            Select ACD/ENS/AFR Charges
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm h-10 border border-blue-300">
                            <span className="relative inline-flex items-center px-2 rounded-l-md border-r border bg-gray-50 text-gray-500 sm:text-sm">
                              <select
                                className="appearance-none px-2 h-full border-0 bg-transparent focus:ring-0 focus:outline-none pr-2"
                                value={acd_ens_afr.split(" ")[0] || "ACD"}
                                onChange={(e) => {
                                  const chargeType = e.target.value;
                                  const chargeAmount =
                                    acd_ens_afr.split(" ")[1] || "";
                                  setacd_ens_afr(
                                    `${chargeType} ${chargeAmount}`
                                  );
                                }}
                              >
                                <option value="ACD">ACD</option>
                                <option value="ENS">ENS</option>
                                <option value="AFR">AFR</option>
                              </select>
                              {/* Custom dropdown arrow */}
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex pl-3 items-center text-gray-600">
                                <IoIosArrowDown className="text-gray-500 " />
                              </div>
                            </span>
                            <span className="relative inline-flex items-center px-2 rounded-l-md border-r border bg-gray-50 text-gray-500 sm:text-sm">
                              <select
                                className="appearance-none px-2 h-full border-0 bg-transparent focus:ring-0 focus:outline-none"
                                value={acdCurrency}
                                onChange={(e) => setAcdCurrency(e.target.value)}
                              >
                                <option value="USD">USD $</option>
                                <option value="INR">INR ₹</option>
                                <option value="EUR">EUR €</option>
                                <option value="GBP">GBP £</option>
                                <option value="JPY">JPY ¥</option>
                              </select>
                              {/* Custom dropdown arrow */}
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex pl-3 items-center text-gray-600">
                                <IoIosArrowDown className="text-gray-500 " />
                              </div>
                            </span>
                            <input
                              value={acd_ens_afr.split(" ")[1] || ""}
                              onChange={(e) => {
                                const chargeType =
                                  acd_ens_afr.split(" ")[0] || "ACD";
                                setacd_ens_afr(
                                  `${chargeType} ${e.target.value}`
                                );
                              }}
                              className="flex-1 w-full rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 border px-2"
                              placeholder="Enter Charges"
                            />
                          </div>
                        </div>
                        {/* Validity (End Date) */}
                        <div className="mb-1">
                          <label className="block text-sm font-medium text-black mb-1">
                            Validity (End Date){" "}
                            <span className="text-red-500 ">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2 ">
                            <div className="relative pl-10 sm:pl-0">
                              <div
                                className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer z-10"
                                onClick={() => datePickerRef.current.setFocus()}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-gray-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <DatePicker
                                selected={validity || ""}
                                onChange={(date) => setValidity(date)}
                                dateFormat="dd-MM-yyyy"
                                placeholderText="Select a date"
                                className=" pl-3 sm:pl-10 pr-5 py-2 border border-gray-300 rounded-md shadow-sm text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 "
                                min={new Date().toISOString().split("T")[0]}
                                required
                              />
                            </div>
                            <div className="relative shadow-sm rounded-md border border-blue-300 ">
                              <div className="absolute inset-y-0 left-0 pl-2 pt-2 flex items-start pointer-events-none">
                                <FaRegBookmark className="text-gray-400" />
                              </div>
                              <select
                                value={validity_for || ""}
                                onChange={(e) =>
                                  setValidity_for(e.target.value)
                                }
                                className="appearance-none block w-full pl-8 pr-2 py-2 sm:text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-600"
                                required
                              >
                                <option value="">Validity Type</option>
                                <option value="Gate-in">For Gate-in</option>
                                <option value="Sailing">For Sailing</option>
                                <option value="Handover">For Handover</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <IoIosArrowDown className="text-gray-500 " />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Line Contact Details Card */}
                    <div className="mt-2 bg-white py-3 px-2 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow duration-150 ease-in-out">
                      <h4 className="text-sm font-medium text-blue-700 mb-3 flex items-center">
                        <LuContact className="mr-2" />
                        Shipping Line Contact Person Details{" "}
                        <span className="text-red-500 ">*</span>
                      </h4>

                      <div className="sm:grid grid-cols-1 sm:grid-cols-3 gap-3  ">
                        {/* Person Name */}
                        <div className="mb-1 sm:mb-0 relative">
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <IoIosContact className="text-gray-500 text-lg" />
                            </div>
                            <input
                              value={shipping_name}
                              placeholder="Enter Name *"
                              onChange={(e) => setshipping_name(e.target.value)}
                              onFocus={handleContactNameFocus}
                              onBlur={() =>
                                setTimeout(
                                  () => setShowContactSuggestions(false),
                                  200
                                )
                              }
                              className="block w-full pl-10 py-2 text-base border-red-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out border"
                              required
                            />
                          </div>

                          {/* Enhanced Contact suggestions dropdown */}
                          {showContactSuggestions && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                              <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 border-b flex justify-between items-center">
                                <span>Contacts for {shipping_lines}</span>
                                {contactSuggestionsLoading && (
                                  <span className="text-blue-500 flex items-center">
                                    <svg
                                      className="animate-spin h-3 w-3 mr-1"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    Loading...
                                  </span>
                                )}
                              </div>

                              {contactSuggestionsLoading ? (
                                <div className="py-2 px-3 text-gray-900 italic text-center">
                                  Loading contact suggestions...
                                </div>
                              ) : contactSuggestions.length > 0 ? (
                                contactSuggestions.map((suggestion, index) => (
                                  <div
                                    key={index}
                                    className="cursor-pointer hover:bg-indigo-50 py-2 px-3 text-gray-900"
                                    onMouseDown={() =>
                                      handleContactSelect(suggestion)
                                    }
                                  >
                                    <div className="font-medium">
                                      {suggestion.name || "N/A"}
                                    </div>
                                    <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:gap-2">
                                      <span>{suggestion.number}</span>
                                      <span>{suggestion.email}</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="py-2 px-3 text-gray-500 italic text-center">
                                  No contact suggestions found for this shipping
                                  line
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Contact Number */}
                        <div className="mb-1 sm:mb-0">
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <IoCallOutline className="text-gray-400 text-lg" />
                            </div>
                            <input
                              value={shipping_number}
                              placeholder="Enter Number *"
                              onChange={(e) =>
                                setshipping_number(e.target.value)
                              }
                              className="block w-full pl-10 py-2 text-base border-red-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out border"
                              required
                            />
                          </div>
                        </div>

                        {/* Person Email */}
                        <div className="mb-1 sm:mb-0">
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <IoMailOutline className="text-gray-400 text-lg" />
                            </div>
                            <input
                              value={shipping_email}
                              placeholder="Enter Email *"
                              onChange={(e) =>
                                setshipping_email(e.target.value)
                              }
                              className="block w-full pl-10 py-2 text-base border-red-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out border"
                              required
                            />
                          </div>
                        </div>

                        {/* Person Address */}
                        <div className="mb-1 sm:mb-0 col-span-3">
                          <div className="relative rounded-md shadow-sm w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiHome className="text-gray-400 text-lg" />
                            </div>
                            <input
                              value={shipping_address}
                              placeholder="Enter Address *"
                              onChange={(e) =>
                                setshipping_address(e.target.value)
                              }
                              className="block w-full pl-10 py-2 text-base border-red-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out border"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Remarks (Optional) - move this just above the submit button */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-black mb-1">
                        Remarks (Optional)
                      </label>
                      <div className="relative rounded-md border border-blue-300 shadow-sm mb-3">
                        <div className="absolute inset-y-0 left-0 pl-2 pt-2 flex items-start pointer-events-none">
                          <LuMessageSquareMore className="text-gray-400" />
                        </div>
                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          className="block w-full pl-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md transition-shadow duration-150 ease-in-out"
                          rows="2"
                          placeholder="Add any special instructions related to this shippment"
                        />
                      </div>
                    </div>
                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white focus:outline-none transition duration-150 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] ${
                        isSubmitting
                          ? "bg-indigo-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>

                          {editFormId
                            ? "Updating Rate..."
                            : "Submitting Rate..."}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          {editFormId ? (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                              Update Rate
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Submit Rate
                            </>
                          )}
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Rate Card Calculator - Now sticky/floating */}
          <div className="w-full lg:w-2/5 order-1 lg:order-2 sm:mx-3 mx-auto">
            <div className="sticky top-6 self-start mt-4">
              <div className="border rounded-xl shadow-md overflow-hidden border-red-500">
                <div className="bg-gradient-to-r from-red-500 to-red-700 p-2 text-white text-center">
                  <h2 className="text-lg sm:text-xl font-bold">
                    Origin Rate Calculator
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-100 mt-1 sm:px-3 px-8">
                    Select POR, POL, Container Size and Shipping Lines to view
                    applicable rates
                  </p>
                </div>

                <div className="p-3 sm:p-5">
                  {/* Display rates in a styled table format */}
                  <div className="mb-4 text-xs sm:text-sm text-gray-500">
                    <span>Selected: </span>
                    <span className="font-semibold text-blue-600">
                      {por || "No POR"}
                    </span>
                    <span> + </span>
                    <span className="font-semibold text-blue-600">
                      {pol || "No POL"}
                    </span>
                    <span> + </span>
                    <span className="font-semibold text-blue-600">
                      {shipping_lines || "No Shipping Lines"}
                    </span>
                    <span> + </span>
                    <span className="font-semibold text-blue-600">
                      {container_type || "No Container Type"}
                    </span>
                  </div>

                  {/* Main charges table */}
                  <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 mb-4">
                    <table className="w-full divide-y divide-gray-200 text-xs sm:text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Charge
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-14 sm:w-20"
                          >
                            Unit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {/* BL Fees - Without currency symbol */}
                        <tr className="bg-blue-50 hover:bg-blue-100 transition-colors">
                          <td className="px-2 py-1.5 whitespace-nowrap">
                            <div className="flex items-center">
                              <PiNewspaper className="text-blue-700 mr-1" />

                              <span className="font-medium text-sm">
                                BL Fees
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap text-right text-blue-700 font-bold">
                            {currentRates.bl_fees}
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap text-right text-gray-500 font-medium text-xs">
                            /BL
                          </td>
                        </tr>

                        {/* THC - Without currency symbol */}
                        <tr className="bg-indigo-50 hover:bg-indigo-100 transition-colors">
                          <td className="px-2 py-1.5 whitespace-nowrap">
                            <div className="flex items-center">
                              <AiOutlineControl className="text-green-600 mr-1" />

                              <span className="font-medium text-sm">THC</span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap text-right text-indigo-700 font-bold">
                            {currentRates.thc}
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap text-right text-gray-500 font-medium text-xs">
                            /Container
                          </td>
                        </tr>

                        {/* MUC - Without currency symbol */}
                        <tr className="bg-purple-50 hover:bg-purple-100 transition-colors">
                          <td className="px-2 py-1.5 whitespace-nowrap">
                            <div className="flex items-center">
                              <TbReceiptTax className="text-purple-600 mr-1" />

                              <span className="font-medium text-sm">MUC</span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap text-right text-purple-700 font-bold">
                            {currentRates.muc}
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap text-right text-gray-500 font-medium text-xs">
                            /BL
                          </td>
                        </tr>

                        {/* TOLL - Without currency symbol */}
                        <tr className="bg-red-50 hover:bg-red-100 transition-colors">
                          <td className="px-2 py-1.5 whitespace-nowrap">
                            <div className="flex items-center">
                              <LuTruck className="text-red-600 mr-1" />

                              <span className="font-medium text-sm">TOLL</span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap text-right text-red-700 font-bold">
                            {currentRates.toll}
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap text-right text-gray-500 font-medium text-xs">
                            /Container
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Rail Freight Charges Table - Always show when all criteria are selected */}
                  {por && pol && shipping_lines && container_type && (
                    <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-2 py-2 border-b border-gray-200">
                        <h3 className="text-xs font-medium text-gray-700">
                          Rail Freight (Based on Cargo Weight + Tare Weight)
                        </h3>
                      </div>

                      <table className="w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Weight Range
                            </th>
                            <th
                              scope="col"
                              className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Amount
                            </th>
                            <th
                              scope="col"
                              className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Unit
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {/* Weight Range Rates */}
                          {container_type && container_type.startsWith("20") ? (
                            <>
                              <tr className="bg-red-50 hover:bg-red-100 transition-colors">
                                <td className="px-2 py-1.5 whitespace-nowrap">
                                  <span className="font-medium text-sm">
                                    20ft: (0-10 Ton)
                                  </span>
                                </td>
                                <td className="text-sm px-2 py-1.5 whitespace-nowrap text-right text-red-700 font-bold">
                                  {/* Ensure currency symbol is displayed */}
                                  {railFreightRates["(0-10 ton)"]}
                                </td>
                                <td className="px-2 py-1.5 whitespace-nowrap text-right text-gray-500 font-medium text-xs">
                                  /Container
                                </td>
                              </tr>
                              <tr className="bg-yellow-50 hover:bg-yellow-100 transition-colors">
                                <td className="px-2 py-1.5 whitespace-nowrap">
                                  <span className="font-medium text-sm">
                                    20ft: (10-20 Ton)
                                  </span>
                                </td>
                                <td className="text-sm px-2 py-1.5 whitespace-nowrap text-right text-yellow-700 font-bold">
                                  {/* Ensure currency symbol is displayed */}
                                  {railFreightRates["(10-20 ton)"]}
                                </td>
                                <td className="px-2 py-1.5 whitespace-nowrap text-right text-gray-500 font-medium text-xs">
                                  /Container
                                </td>
                              </tr>
                              <tr className="bg-yellow-50 hover:bg-yellow-100 transition-colors">
                                <td className="px-2 py-1.5 whitespace-nowrap">
                                  <span className="font-medium text-sm">
                                    20ft: (20-26 Ton)
                                  </span>
                                </td>
                                <td className="text-sm px-2 py-1.5 whitespace-nowrap text-right text-yellow-700 font-bold">
                                  {/* Ensure currency symbol is displayed */}
                                  {railFreightRates["(20-26 ton)"]}
                                </td>
                                <td className="px-2 py-1.5 whitespace-nowrap text-right text-gray-500 font-medium text-xs">
                                  /Container
                                </td>
                              </tr>
                              <tr className="bg-yellow-50 hover:bg-yellow-100 transition-colors">
                                <td className="px-2 py-1.5 whitespace-nowrap">
                                  <span className="font-medium text-sm">
                                    20ft: (26+ Ton)
                                  </span>
                                </td>
                                <td className="text-sm px-2 py-1.5 whitespace-nowrap text-right text-yellow-700 font-bold">
                                  {/* Ensure currency symbol is displayed */}
                                  {railFreightRates["(26+ ton)"]}
                                </td>
                                <td className="px-2 py-1.5 whitespace-nowrap text-right text-gray-500 font-medium text-xs">
                                  /Container
                                </td>
                              </tr>
                            </>
                          ) : container_type &&
                            (container_type.startsWith("40") ||
                              container_type.startsWith("45")) ? (
                            <>
                              <tr className="bg-red-50 hover:bg-red-100 transition-colors">
                                <td className="px-2 py-1.5 whitespace-nowrap">
                                  <span className="font-medium text-sm">
                                    40ft: (10-20 Ton)
                                  </span>
                                </td>
                                <td className="text-sm px-2 py-1.5 whitespace-nowrap text-right text-red-700 font-bold">
                                  {/* Ensure currency symbol is displayed */}
                                  {railFreightRates["(10-20 ton)"]}
                                </td>
                                <td className="px-2 py-1.5 whitespace-nowrap text-right text-gray-500 font-medium text-xs">
                                  /Container
                                </td>
                              </tr>
                              <tr className="bg-yellow-50 hover:bg-yellow-100 transition-colors">
                                <td className="px-2 py-1.5 whitespace-nowrap">
                                  <span className="font-medium text-sm">
                                    40ft: (20+ Ton)
                                  </span>
                                </td>
                                <td className="text-sm px-2 py-1.5 whitespace-nowrap text-right text-yellow-700 font-bold">
                                  {/* Ensure currency symbol is displayed */}
                                  {railFreightRates["(20+ ton)"]}
                                </td>
                                <td className="px-2 py-1.5 whitespace-nowrap text-right text-gray-500 font-medium text-xs">
                                  /Container
                                </td>
                              </tr>
                            </>
                          ) : (
                            <tr>
                              <td
                                colSpan="3"
                                className="px-2 py-4 text-center text-gray-500"
                              >
                                Select a container type to view weight-based
                                rates
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Custom Charges Section - Updated for better mobile experience */}
                  <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-2 py-2 border-b border-gray-200 flex flex-wrap justify-between items-center">
                      {customCharges.length < 5 && (
                        <button
                          type="button"
                          onClick={addCustomCharge}
                          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-2 rounded transition-colors duration-150"
                        >
                          + Add Other Charges
                        </button>
                      )}

                      <div className="flex space-x-4 text-xs text-gray-500 font-medium">
                        <h3 className="uppercase">Amount</h3>
                        <h3>UNIT</h3>
                      </div>
                    </div>

                    <div className="p-3">
                      {customCharges.length > 0 ? (
                        customCharges.map((charge, index) => (
                          <div
                            key={index}
                            className="mb-2 last:mb-0 flex flex-col sm:flex-row items-start sm:items-center gap-2"
                          >
                            <div className="flex-1 w-full">
                              <input
                                type="text"
                                placeholder="Mention Other Charges"
                                value={charge.label}
                                onChange={(e) =>
                                  updateCustomCharge(
                                    index,
                                    "label",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded"
                              />
                            </div>
                            <div className="flex w-full sm:w-auto">
                              <select
                                value={charge.currency}
                                onChange={(e) =>
                                  updateCustomCharge(
                                    index,
                                    "currency",
                                    e.target.value
                                  )
                                }
                                className="appearance-auto px-2 py-1 text-xs border-l border-t border-b border-gray-300 bg-gray-50"
                              >
                                <option value="INR">₹</option>
                                <option value="USD">$</option>
                                <option value="EUR">€</option>
                                <option value="GBP">£</option>
                                <option value="JPY">¥</option>
                              </select>
                              <input
                                type="text"
                                placeholder="Amount"
                                value={charge.value}
                                onChange={(e) =>
                                  updateCustomCharge(
                                    index,
                                    "value",
                                    e.target.value
                                  )
                                }
                                className="w-20 sm:w-[68px] px-2 py-1 text-xs border-[1px] border-gray-300"
                              />
                              <select
                                value={charge.unit}
                                onChange={(e) =>
                                  updateCustomCharge(
                                    index,
                                    "unit",
                                    e.target.value
                                  )
                                }
                                className="appearance-auto px-1 py-1 text-xs border-t border-b border-gray-300 bg-gray-50"
                              >
                                <option value="" disabled>
                                  Unit
                                </option>
                                <option value="/BL">/BL</option>
                                <option value="/Container">/Container</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => removeCustomCharge(index)}
                                className="text-red-500 hover:text-red-700 p-1 border border-gray-200 rounded-r"
                                title="Remove charge"
                              >
                                <MdDeleteForever className="text-red-600 text-lg" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-3">
                          <p className="text-sm text-gray-500">
                            Click "Add Other Charges" to add custom charges
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Rate Cards - Unchanged */}
      <div className="container px-3 sm:px-8 max-w-full mx-auto mt-6 sm:mt-8 ">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 ">
          <h2 className="text-lg sm:text-xl font-bold">
            Your Rate Submissions
          </h2>

          {/* Add count indicator with loading state */}
          <div className="bg-blue-50 text-blue-700 rounded-lg px-4 py-2 font-medium inline-flex items-center">
            <span className="text-xs sm:text-sm">
              {isDataLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading rates...
                </span>
              ) : (
                `Total: ${forms.length} submissions`
              )}
            </span>
          </div>
        </div>

        {/* Loading skeleton and empty states */}
        {isDataLoading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="grid grid-cols-8 gap-2">
                  {[...Array(8)].map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className="h-10 bg-gray-200 rounded"
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : forms.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mt-4">
              No rate submissions yet
            </h3>
            <p className="text-gray-500 mt-2">
              Fill out the form above to submit your first rate
            </p>
          </div>
        ) : forms.filter((item) => !isValidityExpired(item.validity)).length ===
          0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mt-4">
              No active rate submissions found
            </h3>
            <p className="text-gray-500 mt-2">
              All your submitted rates have expired. Create a new rate
              submission.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg border border-gray-400 sm:mx-4 mx-1">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 table-fixed border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-left sm:text-sm text-xs font-bold text-red-500 uppercase tracking-wider border-b border-r border-gray-400"
                    >
                      POR
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-left sm:text-sm text-xs font-bold text-red-500 uppercase tracking-wider border-b border-r border-gray-400"
                    >
                      POL
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-left sm:text-sm text-xs font-bold text-red-500 uppercase tracking-wider border-b border-r border-gray-400"
                    >
                      POD
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-left sm:text-sm text-xs font-bold  text-red-500 tracking-wider border-b border-r border-gray-400"
                    >
                      Shipping Line
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-left sm:text-sm text-xs font-bold text-red-500 tracking-wider border-b border-r border-gray-400"
                    >
                      Container
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-left sm:text-sm text-xs font-bold text-red-500 tracking-wider border-b border-r border-gray-400"
                    >
                      Ocean Freight
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-left sm:text-sm text-xs font-bold text-red-500 tracking-wider border-b border-gray-400"
                    >
                      Validity
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-center sm:text-sm text-xs font-bold text-red-500 tracking-wider border-b border-gray-400"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-300">
                  {forms
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    // Filter out expired rates
                    .filter((item) => !isValidityExpired(item.validity))
                    .map((item) => {
                      const hasRemarks =
                        item.remarks && item.remarks.trim().length > 0;
                      const isEditable = isFormEditable(item.createdAt);
                      const isExpanded = expandedRows[item._id] || false;

                      return (
                        <React.Fragment key={item._id}>
                          <tr
                            className={`${
                              hasRemarks
                                ? "bg-orange-100 hover:bg-orange-200"
                                : "hover:bg-gray-50"
                            } transition-colors duration-150`}
                          >
                            <td className="px-2  py-2 border-r border-gray-300">
                              <div className="flex items-center text-[10px] sm:text-xs">
                                <div className="">
                                  <span className="font-medium text-black">
                                    {item.por}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-2  py-2 border-r border-gray-300">
                              <div className="flex items-center text-[10px] sm:text-xs">
                                <div className="">
                                  <span className="font-medium text-black">
                                    {item.pol}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-2  py-2 border-r border-gray-300">
                              <div className="flex items-center text-[10px] sm:text-xs">
                                <span className="font-medium text-black">
                                  {item.fdrr ? item.fdrr : item.pod}
                                </span>
                              </div>
                            </td>
                            <td className="px-2 sm:px-3 py-2 border-r border-gray-300">
                              <div className="flex items-center justify-center">
                                <span className="text-[10px] sm:text-xs font-medium text-gray-900">
                                  {item.shipping_lines || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className="px-2 py-2 border-r border-gray-300">
                              <span className="text-[10px] sm:text-xs font-medium text-gray-900">
                                {item.container_type || "N/A"}
                              </span>
                            </td>
                            <td className="px-2 py-2 border-r border-gray-300">
                              <div className="text-[10px] sm:text-xs font-medium text-gray-900">
                                {item.ocean_freight || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {!item.acd_ens_afr ||
                                /^(ACD|ENS|AFR)? ?[₹$€£¥]?$/.test(
                                  item.acd_ens_afr
                                )
                                  ? ""
                                  : item.acd_ens_afr}{" "}
                                {hasRemarks && (
                                  <div title="Important Remark">
                                    <span className="text-[10px] text-red-600 animate-pulse">
                                      Please Read Remark
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-2 sm:px-2 py-2 whitespace-nowrap border-r border-gray-200">
                              <div className="flex flex-row items-center">
                                {" "}
                                <div
                                  className={`px-2 py-1  text-[8px] sm:text-xs leading-5 font-semibold rounded-md ${
                                    isValidityExpired(item.validity)
                                      ? "bg-red-100 text-red-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {formatDate(item.validity)}{" "}
                                  {item.validity_for ? (
                                    <div className="text-center">
                                      {" "}
                                      {item.validity_for}
                                    </div>
                                  ) : (
                                    ""
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-2 py-2 text-center">
                              <div className="flex flex-col sm:flex-row justify-center sm:space-x-2 space-y-1 sm:space-y-0">
                                {isEditable ? (
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="inline-flex items-center justify-center px-1.5 sm:px-2 py-1 sm:py-1.5 border border-transparent text-[10px] sm:text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    <GoPencil className="mr-1" />
                                    Edit
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center justify-center px-1.5 sm:px-2 py-1 sm:py-1.5 border border-gray-200 text-[10px] sm:text-xs font-medium rounded text-gray-400 bg-gray-50">
                                    <GoPencil className="mr-1" />

                                    <span className="hidden sm:inline">
                                      Edit
                                    </span>
                                    <span className="sm:hidden">Expired</span>
                                  </span>
                                )}
                                <button
                                  onClick={() => toggleRowExpansion(item._id)}
                                  className={`inline-flex items-center justify-center px-1.5 sm:px-2 py-1 sm:py-1.5 border border-transparent text-[10px] sm:text-xs font-medium rounded ${
                                    isExpanded
                                      ? "text-white bg-blue-600 hover:bg-blue-700"
                                      : "text-blue-700 bg-blue-100 hover:bg-blue-200"
                                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                >
                                  {isExpanded ? (
                                    <>
                                      <IoIosArrowDown className="text-white mr-1" />
                                      Hide
                                    </>
                                  ) : (
                                    <>
                                      <IoIosArrowDown className="text-blue-700 mr-1" />
                                      <span>Details</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleCopy(item)}
                                  className=" text-xs  rounded-md px-2 py-1 font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 "
                                >
                                  Copy
                                </button>
                              </div>
                              {isEditable && (
                                <div className="mt-1 text-[9px] sm:text-xs text-black">
                                  {formatRemainingTime(
                                    remainingTimes[item._id] || 0
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="border-t border-gray-300">
                              <td
                                colSpan="8"
                                className="px-3 sm:px-6 py-4 border-b border-gray-300 bg-slate-100"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {/*  Route & Commodity Details */}
                                  <div className="bg-white p-4 rounded-lg shadow-sm border-[1px] border-gray-400">
                                    <h4 className="font-medium text-sm text-red-500 mb-2">
                                      Route & Commodity Details
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] sm:text-xs">
                                      <div>
                                        <span className="text-gray-500">
                                          POR:
                                        </span>
                                        <p className="font-medium">
                                          {item.por || "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          POL:
                                        </span>
                                        <p className="font-medium">
                                          {item.pol || "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          POD:
                                        </span>
                                        <p className="font-medium">
                                          {item.pod || "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          FDRR:
                                        </span>
                                        <p className="font-medium">
                                          {item.fdrr || "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          Commodity Type:
                                        </span>
                                        <p className="font-medium">
                                          {item.commodity || "N/A"}
                                        </p>
                                      </div>

                                      <div>
                                        <span className="text-gray-500">
                                          Transit Time:
                                        </span>
                                        <p className="font-medium">
                                          {item.transit
                                            ? `${item.transit} ${
                                                parseInt(item.transit) === 1
                                                  ? "Day"
                                                  : "Days"
                                              }`
                                            : "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          Route Type:
                                        </span>
                                        <p className="font-medium">
                                          {item.route || "Direct"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          Validity For:
                                        </span>
                                        <p className="font-medium">
                                          {item.validity_for || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-3 border-t border-gray-200 pt-2">
                                      <div>
                                        <span className="text-red-500 text-xs font-medium">
                                          Shipping Line Contact Person Details
                                        </span>
                                        <p className=" text-xs ">
                                          Name: {item.shipping_name || "N/A"}
                                        </p>

                                        <p className=" text-xs ">
                                          Contact No:{" "}
                                          {item.shipping_number || "N/A"}
                                        </p>
                                        <p className=" text-xs ">
                                          Email: {item.shipping_email || "N/A"}
                                        </p>
                                        <p className=" text-xs ">
                                          Address:{" "}
                                          {item.shipping_address || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-white p-3 rounded-lg shadow-sm border-[1px] border-gray-400">
                                    <h4 className="font-medium text-sm text-red-500 mb-2">
                                      Origin Charges
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-500">
                                          BL Fees:
                                        </span>
                                        <p className="font-medium">
                                          {item.bl_fees || "N/A"} /BL
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          THC:
                                        </span>
                                        <p className="font-medium">
                                          {item.thc || "N/A"} /Container
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          MUC:
                                        </span>
                                        <p className="font-medium">
                                          {item.muc || "N/A"} /BL
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          TOLL:
                                        </span>
                                        <p className="font-medium">
                                          {item.toll || "N/A"} /Container
                                        </p>
                                      </div>
                                    </div>

                                    {/* Custom Charges Section */}
                                    {item.customCharges && (
                                      <div className="mt-2 border-t border-gray-200 pt-2">
                                        <span className="text-xs font-medium text-gray-500">
                                          Other Charges:
                                        </span>
                                        <div className="mt-1 grid grid-cols-2 gap-2">
                                          {(() => {
                                            try {
                                              const charges =
                                                typeof item.customCharges ===
                                                "string"
                                                  ? JSON.parse(
                                                      item.customCharges
                                                    )
                                                  : item.customCharges;

                                              if (
                                                Array.isArray(charges) &&
                                                charges.length > 0
                                              ) {
                                                return charges.map(
                                                  (charge, index) => (
                                                    <p
                                                      key={index}
                                                      className="text-xs font-medium"
                                                    >
                                                      {charge.label}:{" "}
                                                      {charge.value}
                                                      {charge.unit && (
                                                        <span className="text-gray-500">
                                                          {" "}
                                                          {charge.unit}
                                                        </span>
                                                      )}
                                                    </p>
                                                  )
                                                );
                                              }
                                              return null;
                                            } catch (error) {
                                              console.error(
                                                "Error parsing custom charges:",
                                                error
                                              );
                                              return null;
                                            }
                                          })()}
                                        </div>
                                      </div>
                                    )}

                                    {/* For backward compatibility with old format */}
                                    {(!item.customCharges ||
                                      item.customCharges.length === 0) &&
                                      item.customLabel &&
                                      item.customValue && (
                                        <div className="mt-2 border-t border-gray-200 pt-2">
                                          <span className="text-xs font-medium text-gray-500">
                                            Other Charges:
                                          </span>
                                          {/* Parse and display multiple charges if they use the delimiter */}
                                          {item.customLabel.includes("|||") ? (
                                            <div className="mt-1 grid grid-cols-3 gap-2">
                                              {item.customLabel
                                                .split("|||")
                                                .map((label, index) => {
                                                  const values =
                                                    item.customValue.split(
                                                      "|||"
                                                    );
                                                  // Properly split the units string and get the corresponding unit for this charge
                                                  const units = item.customUnit
                                                    ? item.customUnit.split(
                                                        "|||"
                                                      )
                                                    : [];
                                                  const unit =
                                                    units[index] || "";

                                                  return label &&
                                                    values[index] ? (
                                                    <p
                                                      key={index}
                                                      className="text-xs font-medium"
                                                    >
                                                      {label}: {values[index]}{" "}
                                                      <span className="text-gray-500">
                                                        {unit}
                                                      </span>
                                                    </p>
                                                  ) : null;
                                                })}
                                            </div>
                                          ) : (
                                            // Always display single charge (legacy format) in a <p> inside the <div>
                                            <p className="text-xs font-medium">
                                              {item.customLabel}:{" "}
                                              {item.customValue}{" "}
                                              <span className="text-gray-500">
                                                {item.customUnit}
                                              </span>
                                            </p>
                                          )}
                                        </div>
                                      )}
                                  </div>

                                  {/* Additional Information */}
                                  <div className="bg-white p-3 rounded-lg shadow-sm border-[1px] border-gray-400">
                                    <h4 className="font-medium text-sm text-red-500 mb-2">
                                      Additional Information
                                    </h4>
                                    {hasRemarks && (
                                      <div className="mb-2 bg-yellow-100 p-2 rounded text-xs">
                                        <span className="text-yellow-700 font-medium">
                                          Remarks:
                                        </span>
                                        <p className="mt-1 text-gray-800">
                                          {item.remarks}
                                        </p>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="grid grid-cols-1 gap-2">
                                        <span className="text-gray-500">
                                          Created:
                                        </span>
                                        <p className="font-medium">
                                          {new Date(
                                            item.createdAt
                                          ).toLocaleDateString("en-GB")}
                                          ,
                                          {new Date(
                                            item.createdAt
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </p>

                                        <span className="text-gray-500">
                                          Updated:
                                        </span>
                                        <p className="font-medium">
                                          {new Date(
                                            item.updatedAt
                                          ).toLocaleDateString("en-GB")}
                                          ,
                                          {new Date(
                                            item.updatedAt
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </p>
                                      </div>

                                      <div>
                                        <span className="text-gray-500">
                                          Edit Status:
                                        </span>
                                        <p
                                          className={`font-medium ${
                                            isEditable
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          {isEditable ? (
                                            "Editable until " +
                                            new Date(
                                              new Date(
                                                item.createdAt
                                              ).getTime() +
                                                30 * 60 * 1000
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          ) : (
                                            <>
                                              Edit period expired. Contact Admin
                                              for any change 746.
                                            </>
                                          )}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Rail Freight Rates Section */}
                                    <div className="mt-0">
                                      {item.railFreightRates &&
                                        Object.keys(item.railFreightRates)
                                          .length > 0 && (
                                          <div className="mt-2 border-t border-gray-200 pt-2">
                                            <span className="text-gray-600 text-xs font-medium">
                                              Rail Freight (Based on Cargo
                                              Weight + Tare Weight)
                                            </span>
                                            <div className="mt-1">
                                              {formatRailFreightRatesForDisplay(
                                                item.railFreightRates
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Add_rates;
