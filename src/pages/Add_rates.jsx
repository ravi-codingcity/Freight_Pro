import React, { useState, useEffect, useRef } from "react";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "../components/Navbar";
import { getPOROptions } from "../components/POR";
import { getPOLOptions } from "../components/POL";
import { getPODOptions } from "../components/POD";
import { getShippingLinesOptions } from "../components/Shipping_lines";
import { getRatesByPortAndLine } from "../components/Origin_rates";
import { getRailFreightRates } from "../components/Rail_freightrates";
import {
  getContainerSizeOptions,
  getContainerSizeCategory,
} from "../components/Container_size"; // Import the container size functions
import DatePicker from "react-datepicker";

const Add_rates = () => {
  // Basic form state variables
  const [showDescription, setShowDescription] = useState(false);
  const [showRouteDescription, setShowRouteDescription] = useState(false);
  const [name, setName] = useState("");
  const [por, setpor] = useState("");
  const [pol, setpol] = useState("");
  const [pod, setpod] = useState("");
  const [shipping_lines, setshipping_lines] = useState("");
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

  // OPTIONS STATE - DEFINE THESE ONLY ONCE!
  const [porOptions, setPorOptions] = useState([]);
  const [polOptions, setPolOptions] = useState([]);
  const [podOptions, setPodOptions] = useState([]);
  const [shippingLinesOptions, setShippingLinesOptions] = useState([]);
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

  // Define toggle row expansion function
  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Currency symbol helper function
  const getCurrencySymbol = (currencyCode) => {
    switch (currencyCode) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "JPY":
        return "¥";
      case "INR":
        return "₹";
      default:
        return "$";
    }
  };

  // Define the missing handleEdit function to populate the form with existing data
  const handleEdit = (item) => {
    console.log("Editing item:", item);

    // Set the editFormId first so we know we're in edit mode
    setEditFormId(item._id);

    // Populate basic fields
    setpor(item.por || "");
    setpol(item.pol || "");
    setpod(item.pod || "");
    setshipping_lines(item.shipping_lines || "");
    setshipping_name(item.shipping_name || "");
    setshipping_number(item.shipping_number || "");
    setshipping_address(item.shipping_address || "");
    setshipping_email(item.shipping_email || "");
    setContainer_type(item.container_type || "");
    setCommodity(item.commodity || "");
    setRoute(item.route || "");
    setOcean_freight(item.ocean_freight || "");
    setacd_ens_afr(item.acd_ens_afr || "");
    setValidity(item.validity || "");
    setValidity_for(item.validity_for || "");
    setRemarks(item.remarks || "");
    setTransittime(item.transit || "");

    // Set container size based on the container type
    const sizeCategory = getContainerSizeCategory(item.container_type || "");
    setSelectedContainerSize(sizeCategory);

    // Handle ACD currency separately
    // Extract currency from acd_ens_afr if possible
    if (item.acd_ens_afr) {
      const match = item.acd_ens_afr.match(/[₹$€£¥]/);
      if (match) {
        // Set currency based on symbol
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

    try {
      // Load options
      const porData = getPOROptions();
      const polData = getPOLOptions();
      const podData = getPODOptions();
      const shippingLines = getShippingLinesOptions();

      console.log("Raw POR data:", porData);

      // Set state with proper handling - PROPERLY HANDLE ARRAYS!
      if (Array.isArray(porData)) {
        setPorOptions(porData);
        console.log("POR options set:", porData.length, "items");
      } else {
        console.error("POR data is not an array:", porData);
        setPorOptions([]);
      }

      setPodOptions(Array.isArray(podData) ? podData : []);
      setPolOptions(Array.isArray(polData) ? polData : []);
      setShippingLinesOptions(
        Array.isArray(shippingLines) ? shippingLines : []
      );

      setOptionsLoaded(true);
    } catch (error) {
      console.error("Error loading dropdown options:", error);
      // Set empty arrays as fallback
      setPorOptions([]);
      setPolOptions([]);
      setPodOptions([]);
      setShippingLinesOptions([]);
    }
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
    // Keep the user's name but clear everything else
    const currentName = name;

    // Reset all form fields
    setpor("");
    setpol("");
    setpod("");
    setshipping_lines("");
    setshipping_name("");
    setshipping_number("");
    setshipping_address("");
    setshipping_email("");
    setContainer_type("");
    setCommodity("");
    setOcean_freight("");
    setacd_ens_afr("");
    setAcdCurrency("USD"); // Also reset ACD currency
    setValidity("");
    setValidity_for("");
    setRemarks("");
    setRoute("");
    setTransittime("");
    setbl_fees("");
    setthc("");
    setmuc("");
    settoll("");

    setSelectedContainerSize(null);

    // Reset UI state
    setShowDescription(false);
    setShowRouteDescription(false);
    setShowCustomCharges(true);
    setCustomCharges([{ label: "", value: "", currency: "USD", unit: "" }]);

    // Reset weight rates (optional, as it's static now, but good practice)
    setRailFreightRates({
      "(0-10 ton)": "₹0",
      "(10-20 ton)": "₹0",
      "(20-26 ton)": "₹0",
      "(26+ ton)": "₹0",
    });

    // Reset edit mode
    setEditFormId(null);

    // Restore the user's name
    setName(currentName);

    // Clear any error messages
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
        throw new Error("Authentication token not found");
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
        customCharges: customCharges || [], // Save the array of custom charges
        customLabel: customLabel || "", // Add old format
        customValue: customValue || "", // Add old format
        customUnit: customUnit || "", // Add unit for custom charges
        railFreightRates: safeRailFreightRates, // Ensure this is included in the payload
      };

      console.log("Full payload being submitted:", JSON.stringify(payload));
      console.log(
        "railFreightRates in payload:",
        JSON.stringify(safeRailFreightRates)
      );

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
      console.error("Error details:", error.message);
      setSubmitError(
        error.message || "Failed to submit form. Please try again."
      );
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
        throw new Error("Authentication token not found");
      }

      // Use railFreightRates as-is, with currency symbols included
      const safeRailFreightRates = railFreightRates || {
        "(0-10 ton)": "₹0",
        "(10-20 ton)": "₹0",
        "(20-26 ton)": "₹0",
        "(26+ ton)": "₹0",
      };

      // Convert customCharges array to string as expected by the backend
      const stringifiedCustomCharges = JSON.stringify(customCharges);

      console.log(
        "Edit payload with railFreightRates:",
        JSON.stringify({
          name,
          bl_fees,
          thc,
          muc,
          toll,
          por,
          pol,
          pod,
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
          customCharges: stringifiedCustomCharges, // Send as string instead of array
          customLabel, // For backward compatibility
          customValue, // For backward compatibility
          customUnit, // For backward compatibility
          railFreightRates: safeRailFreightRates, // Include rail freight rates with currency
        })
      );

      const response = await fetch(
        `https://freightpro-4kjlzqm0.b4a.run/api/forms/${formId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
          body: JSON.stringify({
            name,
            bl_fees,
            thc,
            muc,
            toll,
            por,
            pol,
            pod,
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
            customCharges: stringifiedCustomCharges, // Send as string instead of array
            customLabel, // For backward compatibility
            customValue, // For backward compatibility
            customUnit, // For backward compatibility
            railFreightRates: safeRailFreightRates, // Include rail freight rates with currency
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update form");
      }

      const data = await response.json();
      console.log("Form updated successfully:", data);

      // Clear form fields immediately after successful update
      clearFormFields();

      // Reset edit mode immediately after successful update
      setEditFormId(null);

      // Delay fetching the updated forms list to ensure the server has processed the change
      setTimeout(() => {
        getUserForms();
        setIsSubmitting(false);
      }, 800); // Increase delay to 800ms to give server more time

      return true;
    } catch (error) {
      console.error("Error updating form:", error);
      setSubmitError(
        error.message || "Failed to update form. Please try again."
      );
      setIsSubmitting(false);
      return false;
    }
  }

  // Update the handleSubmit function to combine multiple custom charges
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    // Basic form validation
    if (
      !por ||
      !pol ||
      !pod ||
      !shipping_lines ||
      !shipping_name ||
      !shipping_number ||
      !shipping_address ||
      !shipping_email ||
      !container_type ||
      !ocean_freight ||
      !acd_ens_afr ||
      !validity ||
      !validity_for ||
      !transit
    ) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    // Get BL fees from the currentRates (Origin Rate Calculator)
    const bl_fees_value = currentRates.bl_fees;
    const thc_value = currentRates.thc;
    const muc_value = currentRates.muc;
    const toll_value = currentRates.toll;

    // Format the ocean freight and acd_ens_afr with currency symbols
    const oceanCurrency = ocean_freight.split(" ")[0] || "USD";
    const oceanCurrencySymbol = getCurrencySymbol(oceanCurrency);
    const acdCurrencySymbol = getCurrencySymbol(acdCurrency);

    let ocean_freight_with_symbol = ocean_freight;
    if (
      ocean_freight.indexOf(oceanCurrencySymbol) === -1 &&
      ocean_freight.split(" ").length > 1
    ) {
      ocean_freight_with_symbol = `${oceanCurrency} ${oceanCurrencySymbol}${
        ocean_freight.split(" ")[1]
      }`;
    }
    let acd_ens_afr_with_symbol = "";
    const chargeType = acd_ens_afr.split(" ")[0] || "ACD";
    const chargeAmount = acd_ens_afr.split(" ")[1] || "";
    acd_ens_afr_with_symbol = `${chargeType} ${acdCurrencySymbol}${chargeAmount}`;

    // Format custom charges with currency symbols and combine for backend
    const formattedCustomCharges = customCharges.map((charge) => ({
      ...charge,
      value: `${getCurrencySymbol(charge.currency)}${charge.value}`,
      // unit is already present and will be sent to backend
    }));

    // We need to stringify customCharges for both create and edit operations
    const stringifiedCustomCharges = JSON.stringify(formattedCustomCharges);

    // For backend compatibility, combine all custom charges into single strings
    // Use a special delimiter "|||" to separate multiple charges
    let customLabel = "";
    let customValue = "";
    let customUnit = "";

    if (
      customCharges.length > 0 &&
      (customCharges[0].label || customCharges[0].value)
    ) {
      customLabel = formattedCustomCharges.map((c) => c.label).join("|||");
      customValue = formattedCustomCharges.map((c) => c.value).join("|||");
      customUnit = formattedCustomCharges.map((c) => c.unit || "").join("|||");
    }

    // Instead of removing currency symbols from rail freight rates,
    // let's preserve them by just making a copy without modifications
    const formattedRailFreightRates = { ...railFreightRates };

    console.log("Original Rail Freight Rates:", railFreightRates);
    console.log(
      "Formatted Rail Freight Rates for submission:",
      formattedRailFreightRates
    );

    // Create a unique submission ID to prevent duplicate submissions
    const submissionId = Date.now().toString();
    const lastSubmission = localStorage.getItem("lastFormSubmission");

    // Check if this is a duplicate submission within 2 seconds
    if (lastSubmission && Date.now() - parseInt(lastSubmission) < 2000) {
      console.log("Preventing duplicate submission");
      setSubmitError("Please wait a moment before submitting again");
      return;
    }

    // Record this submission timestamp
    localStorage.setItem("lastFormSubmission", Date.now().toString());

    let success;
    try {
      if (editFormId) {
        success = await editForm(
          editFormId,
          name,
          bl_fees_value,
          thc_value,
          muc_value,
          toll_value,
          por,
          pol,
          pod,
          shipping_lines,
          shipping_name,
          shipping_number,
          shipping_address,
          shipping_email,
          container_type,
          commodity,
          route,
          ocean_freight_with_symbol,
          acd_ens_afr_with_symbol,
          validity,
          validity_for,
          remarks,
          transit,
          stringifiedCustomCharges, // Pass the stringified version
          customLabel,
          customValue,
          customUnit,
          formattedRailFreightRates // Pass the rail freight rates with currency
        );
      } else {
        success = await createForm(
          name,
          bl_fees_value,
          thc_value,
          muc_value,
          toll_value,
          por,
          pol,
          pod,
          shipping_lines,
          shipping_name,
          shipping_number,
          shipping_address,
          shipping_email,
          container_type,
          commodity,
          route,
          ocean_freight_with_symbol,
          acd_ens_afr_with_symbol,
          validity,
          validity_for,
          remarks,
          transit,
          formattedCustomCharges, // Send formatted array
          customLabel, // Send combined string
          customValue, // Send combined string
          customUnit, // Send unit for custom charges
          formattedRailFreightRates // Pass the rail freight rates with currency
        );
      }

      // If the submission was successful but for some reason the fields weren't cleared
      // (belt and suspenders approach), clear them again here
      if (success) {
        clearFormFields();
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    }
  };

  // Improve getUserForms with better error handling and loading states
  async function getUserForms() {
    setIsDataLoading(true); // Set loading state to true before fetching
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authentication token not found");
        setIsDataLoading(false); // End loading if no token
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
      // Don't clear existing forms on error
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

  // Improve the rail freight rates display formatting function to handle different data formats
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

      console.log("Formatting rail freight rates:", ratesObj);

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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
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
                    <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5-5m0 0l5-5m-5 5h12"
                        />
                      </svg>
                      Route Information
                    </h3>

                    {/* POR + POL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* POR */}
                      <div className="mb-1">
                        <label className="block text-sm font-medium text-black mb-1">
                          POR (Place of Receipt)
                          {!optionsLoaded && (
                            <span className="text-xs text-gray-500 ml-2 animate-pulse">
                              (Loading...)
                            </span>
                          )}
                        </label>
                        <div className="relative rounded-md shadow-sm  border border-blue-300">
                          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <select
                            value={por}
                            onChange={(e) => setpor(e.target.value)}
                            className="appearance-none block w-full pl-8 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-700"
                            required
                          >
                            <option value="" disabled>
                              Select Place of Receipt
                            </option>
                            {renderPOROptions()}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              {" "}
                              <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* POL */}
                      <div className="mb-1">
                        <label className="block text-sm font-medium text-black mb-1">
                          POL (Port of Loading)
                        </label>
                        <div className="relative rounded-md shadow-sm  border border-blue-300">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2H5z"
                              />
                            </svg>
                          </div>
                          <select
                            value={pol}
                            onChange={(e) => setpol(e.target.value)}
                            className="appearance-none block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-700"
                            required
                          >
                            <option value="" disabled>
                              Select Port of Loading
                            </option>
                            {polOptions && polOptions.length > 0
                              ? polOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))
                              : null}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              {" "}
                              <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Container Type & POD */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {/* Container Type */}
                      <div className="mb-1">
                        <label className="block text-sm font-medium text-black mb-1">
                          Container Type
                        </label>
                        <div className="relative rounded-md shadow-sm  border border-blue-300">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
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
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              {" "}
                              <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* POD */}
                      <div className="mb-1">
                        <label className="block text-sm font-medium text-black mb-1">
                          POD (Port of Discharge)
                        </label>
                        <div className="relative rounded-md shadow-sm border border-blue-300">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <select
                            value={pod}
                            onChange={(e) => setpod(e.target.value)}
                            className="appearance-none block w-full pl-10 pr-5 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-700"
                            required
                          >
                            <option value="" disabled>
                              Select Port of Discharge
                            </option>
                            {podOptions && podOptions.length > 0
                              ? podOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))
                              : null}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              {" "}
                              <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION: Shipping Line & Commodity */}
                    <div className="bg-gray-50 py-3">
                      <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 11H5m14 0a2 2 0 002 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m14 0h-2.5M6.5 7H4"
                          />
                        </svg>
                        Shipping Line & Commodity Details
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                        {/* Shipping Lines */}
                        <div className="mb-1">
                          <label className="block text-sm font-medium text-black mb-1">
                            Shipping Line
                          </label>
                          <div className="relative  shadow-sm rounded-md border border-blue-300">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                            </div>
                            <select
                              value={shipping_lines}
                              onChange={(e) =>
                                setshipping_lines(e.target.value)
                              }
                              className="appearance-none block w-full pl-10 pr-5 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-700"
                              required
                            >
                              <option value="" disabled>
                                Select Shipping Line
                              </option>
                              {renderShippingLinesOptions()}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                {" "}
                                <path
                                  fillRule="evenodd"
                                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Commodity Type */}
                        <div className="mb-1">
                          <label className="block text-sm font-medium text-black mb-1">
                            Commodity Type
                          </label>
                          {showDescription ? (
                            <div>
                              <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 01-.707.293h-3.172a1 1 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                    />
                                  </svg>
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
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 17l-5-5m0 0l5-5m-5 5h12"
                                  />
                                </svg>
                                Back to selection
                              </button>
                            </div>
                          ) : (
                            <div className="relative rounded-md shadow-sm border border-blue-300">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 01-.707.293h-3.172a1 1 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                  />
                                </svg>
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
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-gray-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  {" "}
                                  <path
                                    fillRule="evenodd"
                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Shipping Line Contact Details Card */}
                    <div className="mt-2 bg-white py-3 px-2 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow duration-150 ease-in-out">
                      <h4 className="text-sm font-medium text-blue-700 mb-3 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Shipping Line Contact Person Details
                      </h4>

                      <div className="sm:grid grid-cols-1 sm:grid-cols-3 gap-3  ">
                        {/* Person Name */}
                        <div className="mb-1 sm:mb-0">
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                            <input
                              value={shipping_name}
                              placeholder="Enter Name"
                              onChange={(e) => setshipping_name(e.target.value)}
                              className="block w-full pl-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out border "
                              required
                            />
                          </div>
                        </div>

                        {/* Contact Number */}
                        <div className="mb-1 sm:mb-0">
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                            </div>
                            <input
                              value={shipping_number}
                              placeholder="Enter Number"
                              onChange={(e) =>
                                setshipping_number(e.target.value)
                              }
                              className="block w-full pl-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out border"
                              required
                            />
                          </div>
                        </div>

                        {/* Person Email */}
                        <div className="mb-1 sm:mb-0">
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            <input
                              value={shipping_email}
                              placeholder="Enter Email"
                              onChange={(e) =>
                                setshipping_email(e.target.value)
                              }
                              className="block w-full pl-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out border"
                              required
                            />
                          </div>
                        </div>

                        {/* Person Address */}
                        <div className="mb-1 sm:mb-0 col-span-3">
                          <div className="relative rounded-md shadow-sm w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 12l2-2m0 0l7-7 7 7m-9 8v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                            </div>
                            <input
                              value={shipping_address}
                              placeholder="Enter Address"
                              onChange={(e) =>
                                setshipping_address(e.target.value)
                              }
                              className="block w-full pl-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out border"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION: Freight & Routing */}
                  <div className="bg-gray-50 sm:py-3 sm:px-3 py-2 px-2 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Freight Details & Routing
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Ocean Freight */}
                      <div className="mb-1">
                        <label className="block text-sm font-medium text-black mb-1">
                          Ocean Freight
                        </label>
                        <div className="mt-1 flex  h-8 rounded-md border border-blue-300">
                          <span className="relative inline-flex items-center px-1 rounded-l-md border-r border bg-gray-50 text-gray-500 sm:text-sm">
                            <select
                              className="appearance-none h-full px-3 border-0 bg-transparent focus:ring-0 focus:outline-none text-gray-700"
                              value={ocean_freight.split(" ")[0] || "USD"}
                              onChange={(e) => {
                                const currency = e.target.value;
                                const amount =
                                  ocean_freight.split(" ")[1] || "";
                                setOcean_freight(`${currency} ${amount}`);
                              }}
                            >
                              <option value="USD">USD $</option>
                              <option value="INR">INR ₹</option>
                              <option value="EUR">EUR €</option>
                              <option value="GBP">GBP £</option>
                              <option value="JPY">JPY ¥</option>
                            </select>
                            {/* Custom dropdown arrow */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex pl-3 items-center text-gray-600">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </span>
                          <input
                            value={ocean_freight.split(" ")[1] || ""}
                            onChange={(e) => {
                              const currency =
                                ocean_freight.split(" ")[0] || "USD";
                              setOcean_freight(`${currency} ${e.target.value}`);
                            }}
                            className="flex-1 min-w-0 block w-full rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm  px-1"
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
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <select
                            value={transit}
                            onChange={(e) => setTransittime(e.target.value)}
                            className="appearance-none block w-full pl-[36px] pr-5 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-600"
                            required
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
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                clipRule="evenodd"
                              />
                            </svg>
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
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 20l-5-5m0 0l5-5m-5 5h12"
                                  />
                                </svg>
                              </div>
                              <input
                                type="text"
                                placeholder="Enter Routing Description"
                                value={route}
                                onChange={(e) => setRoute(e.target.value)}
                                className="block w-full pl-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-150 ease-in-out text-gray-800"
                                required
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowRouteDescription(false)}
                              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                                />
                              </svg>
                              Back to Selection
                            </button>
                          </div>
                        ) : (
                          <div className="relative shadow-sm rounded-md border border-blue-300">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 20l-5-5m0 0l5-5m-5 5h12"
                                />
                              </svg>
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
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-600"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACD/ENS/AFR + Validity Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {/* ACD/ENS/AFR */}
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
                                setacd_ens_afr(`${chargeType} ${chargeAmount}`);
                              }}
                            >
                              <option value="ACD">ACD</option>
                              <option value="ENS">ENS</option>
                              <option value="AFR">AFR</option>
                            </select>
                            {/* Custom dropdown arrow */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex pl-3 items-center text-gray-600">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                  clipRule="evenodd"
                                />
                              </svg>
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
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </span>
                          <input
                            value={acd_ens_afr.split(" ")[1] || ""}
                            onChange={(e) => {
                              const chargeType =
                                acd_ens_afr.split(" ")[0] || "ACD";
                              setacd_ens_afr(`${chargeType} ${e.target.value}`);
                            }}
                            className="flex-1 w-full rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 border px-2"
                            placeholder="Enter Charges"
                            required
                          />
                        </div>
                      </div>

                      {/* Validity */}
                      <div className="mb-1">
                        <label className="block text-sm font-medium text-black mb-1">
                          Validity (End Date)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            {/* Calendar Icon */}
                            <div
                              className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer z-10"
                              onClick={() => datePickerRef.current.setFocus()} // Focus input when clicking the icon
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

                            {/* Native Date Picker Input */}
                            <DatePicker
                              selected={validity || ""}
                              onChange={(date) => setValidity(date)}
                              dateFormat="dd-MM-yyyy"
                              placeholderText="Select a date"
                              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              min={new Date().toISOString().split("T")[0]}
                              required
                            />
                          </div>

                          {/* Validity Type Dropdowns */}
                          <div className="relative shadow-sm rounded-md border border-blue-300">
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                              </svg>
                            </div>
                            <select
                              value={validity_for || ""}
                              onChange={(e) => setValidity_for(e.target.value)}
                              className="appearance-none block w-full pl-8 pr-2 py-2 sm:text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs rounded-md transition-shadow duration-150 ease-in-out hover:border-indigo-300 text-gray-600"
                              required
                            >
                              <option value="">Validity Type</option>
                              <option value="Gate-in">For Gate-in</option>
                              <option value="Sailing">For Sailing</option>
                              <option value="Handover">For Handover</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Remarks */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-black mb-1">
                        Remarks (Optional)
                      </label>
                      <div className="relative rounded-md border border-blue-300 shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 pt-2 flex items-start pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                            />
                          </svg>
                        </div>
                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          className="block w-full pl-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md transition-shadow duration-150 ease-in-out"
                          rows="2"
                          placeholder="Add any special instructions related to this shippment"
                        />
                      </div>
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

                        {editFormId ? "Updating Rate..." : "Submitting Rate..."}
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
                    Select POR, POL, Container Size and Shipping Lines to view applicable rates
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
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-blue-500 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 002-2h8a2 2 0 002 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5z"
                                  clipRule="evenodd"
                                />
                              </svg>
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
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-indigo-500 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0h1.05a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                              </svg>
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
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-purple-500 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9h6v2H7V9z"
                                  clipRule="evenodd"
                                />
                              </svg>
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
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-red-500 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z"
                                  clipRule="evenodd"
                                />
                              </svg>
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
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 00-1 1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs sm:text-sm">
              {isDataLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700"
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
          <div className="overflow-x-auto shadow-md rounded-lg border border-gray-300 sm:mx-4 mx-1">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 table-fixed border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-left text-sm font-bold text-red-500 uppercase tracking-wider border-b border-r border-gray-300"
                    >
                      POR
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-left text-sm font-bold text-red-500 uppercase tracking-wider border-b border-r border-gray-300"
                    >
                      POL
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-left text-sm font-bold text-red-500 uppercase tracking-wider border-b border-r border-gray-300"
                    >
                      POD
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-left text-sm font-bold text-red-500 tracking-wider border-b border-r border-gray-300 hidden md:table-cell"
                    >
                      Shipping Line
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-left text-sm font-bold text-red-500 tracking-wider border-b border-r border-gray-300 hidden sm:table-cell"
                    >
                      Container
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-left text-sm font-bold text-red-500 tracking-wider border-b border-r border-gray-300"
                    >
                      Freight
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-left text-sm font-bold text-red-500 tracking-wider border-b border-r border-gray-300 hidden sm:table-cell"
                    >
                      Validity
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-2 py-2 sm:py-3 text-center text-sm font-bold text-red-500 tracking-wider border-b border-gray-300"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
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
                                ? "bg-yellow-50 hover:bg-yellow-100"
                                : "hover:bg-gray-50"
                            } transition-colors duration-150`}
                          >
                            <td className="px-2 sm:px-3 py-2 border-r border-gray-200">
                              <div className="flex items-center text-[10px] sm:text-xs">
                                <div className="bg-blue-50 px-1.5 sm:px-2 py-1 rounded-l border border-blue-200 flex items-center">
                                  <span className="font-medium text-black">
                                    {item.por}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 sm:px-3 py-2 border-r border-gray-200">
                              <div className="flex items-center text-[10px] sm:text-xs">
                                <div className="bg-blue-50 px-1.5 sm:px-2 py-1 rounded-l border border-blue-200 flex items-center">
                                  <span className="font-medium text-black">
                                    {item.pol}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 sm:px-3 py-2 border-r border-gray-200">
                              <div className="flex items-center text-[10px] sm:text-xs">
                                <div>
                                  <div className="bg-blue-50 px-1.5 sm:px-2 py-1 rounded-l border border-blue-200 flex items-center">
                                    <span className="font-medium text-black">
                                      {item.pod}
                                    </span>
                                  </div>
                                  {hasRemarks && (
                                    <div className="sm:flex hidden items-center mt-2">
                                      <span
                                        className="inline-flex items-center mt-1 sm:mt-0 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse"
                                        title="Contains important remarks"
                                      >
                                        <svg
                                          className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 012 0zm-1 9a1 1 100-2 1 1 000 2z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        <span className="sm:inline hidden">
                                          Remarks
                                        </span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-2  py-2 border-r border-gray-300 hidden md:table-cell">
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {item.shipping_lines || "N/A"}
                              </span>
                            </td>
                            <td className="px-2  py-2 border-r border-gray-300 hidden sm:table-cell">
                              <span className="text-xs sm:text-sm text-gray-900">
                                {item.container_type || "N/A"}
                              </span>
                            </td>
                            <td className="px-2  py-2 border-r border-gray-300">
                              <div className="text-xs sm:text-sm font-medium text-gray-900">
                                {item.ocean_freight || "N/A"}
                              </div>
                              <div className="text-[10px] sm:text-xs text-gray-500">
                                {item.acd_ens_afr || "N/A"}
                              </div>
                            </td>
                            <td className="px-2  py-2 border-r border-gray-300 hidden sm:table-cell">
                              <span
                                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-[10px] sm:text-xs leading-5 font-semibold rounded-full ${"bg-green-100 text-green-800"}`}
                              >
                                {formatDate(item.validity)}{" "}
                                {item.validity_for
                                  ? `(${item.validity_for})`
                                  : ""}
                              </span>
                            </td>
                            <td className="px-2  py-2 text-center">
                              <div className="flex flex-col sm:flex-row justify-center sm:space-x-2 space-y-1 sm:space-y-0">
                                {isEditable ? (
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="inline-flex items-center justify-center px-1.5 sm:px-2.5 py-1 sm:py-1.5 border border-transparent text-[10px] sm:text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    Edit
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center justify-center px-1.5 sm:px-2.5 py-1 sm:py-1.5 border border-gray-200 text-[10px] sm:text-xs font-medium rounded text-gray-400 bg-gray-50">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                    >
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    <span className="hidden sm:inline">
                                      Edit
                                    </span>
                                    <span className="sm:hidden">Expired</span>
                                  </span>
                                )}
                                <button
                                  onClick={() => toggleRowExpansion(item._id)}
                                  className={`inline-flex items-center justify-center px-1.5 sm:px-2.5 py-1 sm:py-1.5 border border-transparent text-[10px] sm:text-xs font-medium rounded ${
                                    isExpanded
                                      ? "text-white bg-blue-600 hover:bg-blue-700"
                                      : "text-blue-700 bg-blue-100 hover:bg-blue-200"
                                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                >
                                  {isExpanded ? (
                                    <>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 01-1.414-1.414l4-4a1 1 01-1.414 0l-4-4a1 1 010-1.414z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      Hide
                                    </>
                                  ) : (
                                    <>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <span>Details</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              {isEditable && (
                                <div className="mt-1 text-[9px] sm:text-xs text-yellow-600">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div className="bg-white p-4 rounded-lg shadow-sm border-[1px] border-gray-400">
                                    <h4 className="font-medium text-sm text-red-500 mb-2">
                                      Route & Commodity Details
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
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
                                    {item.customCharges &&
                                      Array.isArray(item.customCharges) &&
                                      item.customCharges.length > 0 && (
                                        <div className="mt-2 border-t border-gray-200 pt-2">
                                          <span className="text-xs font-medium text-gray-500">
                                            Other Charges:
                                          </span>
                                          <div className="mt-1 grid grid-cols-2 gap-2">
                                            {item.customCharges.map(
                                              (charge, index) => (
                                                <p
                                                  key={index}
                                                  className="text-xs font-medium"
                                                >
                                                  {charge.label}: {charge.value}{" "}
                                                  <span className="text-gray-500">
                                                    {charge.unit || ""}
                                                  </span>
                                                </p>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* For backward compatibility with old format */}
                                    {!item.customCharges &&
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
                                                    units[index] || ""; // Default to /BL if no unit is found

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
                                            // Display single charge (legacy format)
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
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                      <div>
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
                                      </div>
                                      <div>
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
                                              Edit period expired. Contact Admin for any change 746.
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
