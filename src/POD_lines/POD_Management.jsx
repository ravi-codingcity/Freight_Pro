import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuPlus, LuSave, LuArrowLeft, LuTrash2, LuGlobe, LuShip, LuUser, LuShield, LuMapPin, LuEye } from 'react-icons/lu';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { MdDirectionsBoat } from 'react-icons/md';
import { FiSearch, FiRefreshCw, FiCheck } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import { getShippingLinesForPOD, isValidShippingLine } from './ShippingLines_for_POD.js';


/**
 * POD Management Component
 * 
 * API Endpoints Available:
 * 
 * POD Destinations (7 endpoints):
 * - GET /api/destinations - Get all destinations (implemented)
 * - GET /api/destinations/:id - Get single destination (implemented)
 * - POST /api/destinations - Create destination (implemented)
 * - PUT /api/destinations/:id - Update destination (implemented)
 * - DELETE /api/destinations/:id - Delete destination (implemented)
 * 
 * Shipping Lines (4 endpoints):
 * - POST /api/destinations/:id/shipping-lines - Add single shipping line (implemented)
 * - POST /api/destinations/:id/shipping-lines/bulk - Add multiple shipping lines (implemented)
 * - PUT /api/destinations/:id/shipping-lines/:shippingLineId - Update shipping line (implemented)
 * - DELETE /api/destinations/:id/shipping-lines/:shippingLineId - Delete shipping line (implemented)
 */

// API utility functions
const API_BASE_URL = 'https://freightpro-4kjlzqm0.b4a.run/api';

// Fallback functions for static data (in case imported files don't exist or are empty)
const getPODOptions = () => {
  // Basic fallback POD list - this will be merged with API data
  return [
    'ALEXANDRIA', 'ALGECIRAS', 'AMSTERDAM', 'ANTWERP', 'BARCELONA', 
    'BREMEN', 'CASABLANCA', 'CONSTANTA', 'FELIXSTOWE', 'GENOA',
    'GIBRALTAR', 'HAMBURG', 'HAVRE', 'LISBON', 'MALTA', 
    'MARSEILLE', 'NAPLES', 'PIRAEUS', 'ROTTERDAM', 'VALENCIA'
  ];
};

const getShippingLinesData = () => {
  // Return empty object as fallback - real data will come from API
  return {};
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// API functions

// GET /api/destinations - Get all destinations
const fetchDestinations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/destinations`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch destinations: ${response.status} - ${errorText}`);
    }
    const result = await response.json();
    console.log('Fetch destinations result:', result);
    
    // Handle different response structures
    let data;
    if (result.data) {
      // API returns {success: true, data: [destinations]}
      data = result.data;
    } else if (Array.isArray(result)) {
      // API returns destinations array directly
      data = result;
    } else {
      // Fallback
      data = result;
    }
    
    // Ensure we always return an array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching destinations:', error);
    throw error;
  }
};

// GET /api/destinations/:id - Get single destination
const fetchDestinationById = async (destinationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/destinations/${destinationId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch destination: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching destination:', error);
    throw error;
  }
};

// POST /api/destinations - Create destination
const createDestination = async (destinationName, shippingLines = []) => {
  try {
    console.log('Creating destination with name:', destinationName);
    const response = await fetch(`${API_BASE_URL}/destinations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        destinationName,
        shippingLines
      })
    });
    
    console.log('Create destination response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create destination failed:', errorText);
      throw new Error(`Failed to create destination: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Create destination result:', result);
    
    // Log the structure to help with debugging
    if (result.data) {
      console.log('Destination data object:', result.data);
      console.log('Available ID fields in data:', {
        _id: result.data._id,
        id: result.data.id,
        destinationId: result.data.destinationId
      });
    } else {
      console.log('Available ID fields in result:', {
        _id: result._id,
        id: result.id,
        destinationId: result.destinationId
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error creating destination:', error);
    throw error;
  }
};

// PUT /api/destinations/:id - Update destination
const updateDestination = async (destinationId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/destinations/${destinationId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update destination: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating destination:', error);
    throw error;
  }
};

// DELETE /api/destinations/:id - Delete destination
const deleteDestination = async (destinationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/destinations/${destinationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete destination: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting destination:', error);
    throw error;
  }
};

// POST /api/destinations/:id/shipping-lines - Add single shipping line
const addShippingLineToDestination = async (destinationId, lineName) => {
  try {
    console.log('Adding shipping line:', lineName, 'to destination:', destinationId);
    
    if (!destinationId) {
      throw new Error('Destination ID is required but is undefined/null');
    }
    
    const response = await fetch(`${API_BASE_URL}/destinations/${destinationId}/shipping-lines`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lineName })
    });
    
    console.log('Add shipping line response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Add shipping line failed:', errorText);
      throw new Error(`Failed to add shipping line: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Add shipping line result:', result);
    
    // Handle response structure - return the actual data if wrapped
    return result.data || result;
  } catch (error) {
    console.error('Error adding shipping line:', error);
    throw error;
  }
};

// POST /api/destinations/:id/shipping-lines/bulk - Add multiple shipping lines
const addBulkShippingLinesToDestination = async (destinationId, lineNames) => {
  try {
    console.log('Adding bulk shipping lines:', lineNames, 'to destination:', destinationId);
    
    if (!destinationId) {
      throw new Error('Destination ID is required but is undefined/null');
    }
    
    if (!Array.isArray(lineNames) || lineNames.length === 0) {
      throw new Error('Line names must be a non-empty array');
    }
    
    const response = await fetch(`${API_BASE_URL}/destinations/${destinationId}/shipping-lines/bulk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lineNames })
    });
    
    console.log('Add bulk shipping lines response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Add bulk shipping lines failed:', errorText);
      throw new Error(`Failed to add bulk shipping lines: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Add bulk shipping lines result:', result);
    return result;
  } catch (error) {
    console.error('Error adding bulk shipping lines:', error);
    throw error;
  }
};

// PUT /api/destinations/:id/shipping-lines/:shippingLineId - Update shipping line
const updateShippingLine = async (destinationId, shippingLineId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/destinations/${destinationId}/shipping-lines/${shippingLineId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update shipping line: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating shipping line:', error);
    throw error;
  }
};

// DELETE /api/destinations/:id/shipping-lines/:shippingLineId - Delete shipping line
const removeShippingLineFromDestination = async (destinationId, shippingLineId) => {
  try {
    console.log('Removing shipping line:', shippingLineId, 'from destination:', destinationId);
    
    if (!destinationId) {
      throw new Error('Destination ID is required but is undefined/null');
    }
    
    if (!shippingLineId) {
      throw new Error('Shipping line ID is required but is undefined/null');
    }
    
    const response = await fetch(`${API_BASE_URL}/destinations/${destinationId}/shipping-lines/${shippingLineId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    console.log('Remove shipping line response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Remove shipping line failed:', errorText);
      throw new Error(`Failed to remove shipping line: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Remove shipping line result:', result);
    
    // Handle response structure - return the actual data if wrapped
    return result.data || result;
  } catch (error) {
    console.error('Error removing shipping line:', error);
    throw error;
  }
};

function POD_Management() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Combined Form State
  const [podInput, setPodInput] = useState('');
  const [selectedShippingLine, setSelectedShippingLine] = useState('');
  const [shippingLineInput, setShippingLineInput] = useState('');
  const [showPodSuggestions, setShowPodSuggestions] = useState(false);
  const [showShippingLineSuggestions, setShowShippingLineSuggestions] = useState(false);
  const [filteredPodSuggestions, setFilteredPodSuggestions] = useState([]);
  const [filteredShippingLineSuggestions, setFilteredShippingLineSuggestions] = useState([]);

  // Shipping lines for the currently typed POD
  const [currentPODShippingLines, setCurrentPODShippingLines] = useState([]);
  const [currentDestinationId, setCurrentDestinationId] = useState(null);

  // Data State
  const [existingPODs, setExistingPODs] = useState([]);
  const [allShippingLines, setAllShippingLines] = useState([]);
  const [shippingLinesData, setShippingLinesData] = useState({});
  const [destinationsData, setDestinationsData] = useState([]);

  // User info
  const [userName, setUserName] = useState('');

  // Utility function to refresh destinations data and update local state
  const refreshDestinationsData = async () => {
    try {
      const updatedDestinations = await fetchDestinations();
      const safeDestinations = Array.isArray(updatedDestinations) ? updatedDestinations : [];
      setDestinationsData(safeDestinations);
      
      // Update shipping lines data
      const updatedShippingData = { ...shippingLinesData };
      safeDestinations.forEach(dest => {
        const lines = dest.shippingLines?.map(line => ({ 
          name: line.lineName, 
          id: line._id 
        })) || [];
        updatedShippingData[dest.destinationName] = lines;
      });
      setShippingLinesData(updatedShippingData);
      
      // Update PODs list
      const staticPods = getPODOptions();
      const apiPods = safeDestinations.map(dest => dest.destinationName);
      const allPods = [...new Set([...staticPods, ...apiPods])].sort();
      setExistingPODs(allPods);
      
      // Update shipping lines from master list
      const masterShippingLines = getShippingLinesForPOD();
      setAllShippingLines(masterShippingLines);
      
      return safeDestinations;
    } catch (error) {
      console.error('Error refreshing destinations data:', error);
      throw error;
    }
  };

  // Authentication and authorization check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('username') || localStorage.getItem('userEmail') || '';
    const adminNames = ['Ravi', 'Harmeet', 'Vikram'];
    
    setUserName(name);
    
    const hasAccess = token && adminNames.some(adminName => 
      name.toLowerCase().includes(adminName.toLowerCase())
    );
    
    if (!hasAccess) {
      showNotification('Access denied. You are not authorized to view this page.', 'error');
      setTimeout(() => {
        navigate('/pod_lines');
      }, 2000);
      return;
    }
    
    // Load existing data
    loadData();
  }, [navigate]);

  // Load data from both static files and API
  const loadData = async () => {
    try {
      // Load static data as fallback
      const staticPods = getPODOptions();
      const staticShippingData = getShippingLinesData();
      
      setExistingPODs(staticPods);
      setShippingLinesData(staticShippingData);
      
      // Load shipping lines from master file
      const masterShippingLines = getShippingLinesForPOD();
      setAllShippingLines(masterShippingLines);

      // Try to load from API
      try {
        const apiDestinations = await fetchDestinations();
        // Ensure we have an array before setting state
        const safeDestinations = Array.isArray(apiDestinations) ? apiDestinations : [];
        setDestinationsData(safeDestinations);
        
        // Merge API data with static data
        const apiPods = safeDestinations.map(dest => dest.destinationName);
        const allPods = [...new Set([...staticPods, ...apiPods])].sort();
        setExistingPODs(allPods);

        // Merge shipping lines data
        const mergedShippingData = { ...staticShippingData };
        safeDestinations.forEach(dest => {
          const lines = dest.shippingLines?.map(line => ({ 
            name: line.lineName, 
            id: line._id 
          })) || [];
          mergedShippingData[dest.destinationName] = lines;
        });
        setShippingLinesData(mergedShippingData);

        // Keep using master shipping lines list
        setAllShippingLines(masterShippingLines);

      } catch (apiError) {
        console.warn('API not available, using static data:', apiError);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Error loading data', 'error');
    }
  };

  // Handle POD input changes and show suggestions
  useEffect(() => {
    if (podInput.length > 0) {
      const filtered = existingPODs.filter(pod =>
        pod.toLowerCase().includes(podInput.toLowerCase())
      );
      setFilteredPodSuggestions(filtered);
      setShowPodSuggestions(filtered.length > 0);
      
      // Update shipping lines display for the current POD input
      const lines = shippingLinesData[podInput.trim()] || [];
      setCurrentPODShippingLines(lines);
      
      // Find destination ID for API operations
      const destination = Array.isArray(destinationsData) 
        ? destinationsData.find(dest => dest.destinationName === podInput.trim())
        : null;
      setCurrentDestinationId(destination?._id || null);
    } else {
      setShowPodSuggestions(false);
      setFilteredPodSuggestions([]);
      setCurrentPODShippingLines([]);
      setCurrentDestinationId(null);
    }
  }, [podInput, existingPODs, shippingLinesData, destinationsData]);

  // Handle shipping line input changes and show suggestions
  useEffect(() => {
    if (shippingLineInput.length > 0) {
      const filtered = allShippingLines.filter(line =>
        line.toLowerCase().includes(shippingLineInput.toLowerCase()) &&
        line.toLowerCase() !== shippingLineInput.toLowerCase() // Don't show exact matches
      );
      setFilteredShippingLineSuggestions(filtered);
      setShowShippingLineSuggestions(filtered.length > 0);
    } else {
      setShowShippingLineSuggestions(false);
      setFilteredShippingLineSuggestions([]);
    }
  }, [shippingLineInput, allShippingLines]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.pod-search-container')) {
        setShowPodSuggestions(false);
      }
      if (!event.target.closest('.shipping-line-search-container')) {
        setShowShippingLineSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  // Handle POD suggestion selection
  const handlePodSuggestionSelect = (selectedPod) => {
    setPodInput(selectedPod);
    setShowPodSuggestions(false);
    
    // Update shipping lines display for the selected POD
    const lines = shippingLinesData[selectedPod] || [];
    setCurrentPODShippingLines(lines);
    
    // Find destination ID
    const destination = Array.isArray(destinationsData) 
      ? destinationsData.find(dest => dest.destinationName === selectedPod)
      : null;
    setCurrentDestinationId(destination?._id || null);
  };

  // Handle shipping line suggestion selection
  const handleShippingLineSuggestionSelect = (selectedLine) => {
    setShippingLineInput(selectedLine);
    setSelectedShippingLine(selectedLine);
    setShowShippingLineSuggestions(false);
  };

  // Handle shipping line input changes
  const handleShippingLineInputChange = (value) => {
    setShippingLineInput(value);
    setSelectedShippingLine(value);
    
    // If input is cleared, reset selection
    if (value === '') {
      setSelectedShippingLine('');
      setShowShippingLineSuggestions(false);
    }
  };

  // Handle refresh/reset functionality
  const handleRefresh = () => {
    // Start refresh animation
    setIsRefreshing(true);
    
    // Add a slight delay to show the animation
    setTimeout(() => {
      // Clear all form inputs
      setPodInput('');
      setSelectedShippingLine('');
      setShippingLineInput('');
      
      // Hide all suggestions
      setShowPodSuggestions(false);
      setShowShippingLineSuggestions(false);
      setFilteredPodSuggestions([]);
      setFilteredShippingLineSuggestions([]);
      
      // Clear current POD data
      setCurrentPODShippingLines([]);
      setCurrentDestinationId(null);
      
      // End refresh animation
      setIsRefreshing(false);
      
      // Show success notification
      showNotification('Form refreshed successfully!', 'success');
    }, 600); // 600ms animation duration
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!podInput.trim()) {
      showNotification('Please enter a POD destination', 'error');
      return;
    }
    
    if (!selectedShippingLine) {
      showNotification('Please select a shipping line', 'error');
      return;
    }

    // Validate shipping line using the master list
    if (!isValidShippingLine(selectedShippingLine)) {
      showNotification('Please select a valid shipping line from the list', 'error');
      return;
    }

    // Check if this shipping line already exists for this POD
    const currentLines = shippingLinesData[podInput.trim()] || [];
    const alreadyExists = currentLines.some(line => line.name === selectedShippingLine);
    
    if (alreadyExists) {
      showNotification('This shipping line already exists for this POD', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      let destinationId = currentDestinationId;
      
      console.log('Current destination ID:', destinationId);
      console.log('POD Input:', podInput.trim());
      console.log('Destinations data:', destinationsData);
      
      // If destination doesn't exist in API, create it
      if (!destinationId) {
        console.log('Creating new destination...');
        const newDestination = await createDestination(podInput.trim());
        console.log('New destination created:', newDestination);
        
        // Handle different response structures
        let destinationObject;
        if (newDestination.data) {
          // API returns {success: true, message: '...', data: {actual_destination}}
          destinationObject = newDestination.data;
        } else {
          // API returns destination object directly
          destinationObject = newDestination;
        }
        
        // Check multiple possible ID fields that the API might return
        destinationId = destinationObject._id || destinationObject.id || destinationObject.destinationId;
        
        if (!destinationId) {
          console.error('No valid ID found in response:', newDestination);
          console.error('Destination object:', destinationObject);
          throw new Error('Failed to create destination - no valid ID found in response');
        }
        
        console.log('New destination ID:', destinationId);
        
        // Update local state with the actual destination object
        setDestinationsData(prev => {
          const updated = [...prev, destinationObject];
          console.log('Updated destinations data:', updated);
          return updated;
        });
        setCurrentDestinationId(destinationId);
        
        // Add POD to existing list if it's new
        if (!existingPODs.includes(podInput.trim())) {
          const updatedPODs = [...existingPODs, podInput.trim()].sort();
          setExistingPODs(updatedPODs);
        }
      }

      // Final validation of destinationId before proceeding
      if (!destinationId) {
        console.error('Destination ID is still undefined after creation attempt');
        throw new Error('Destination ID is still undefined after creation attempt');
      }

      console.log('Adding shipping line to destination:', destinationId);
      // Add shipping line to destination
      await addShippingLineToDestination(destinationId, selectedShippingLine);
      
      // Refresh data from API using utility function
      const updatedDestinations = await refreshDestinationsData();
      
      // Update current POD shipping lines display
      const currentDestination = updatedDestinations.find(dest => dest._id === destinationId);
      if (currentDestination) {
        const lines = currentDestination.shippingLines?.map(line => ({ 
          name: line.lineName, 
          id: line._id 
        })) || [];
        setCurrentPODShippingLines(lines);
      }
      
      // Reset only the shipping line selection
      setSelectedShippingLine('');
      setShippingLineInput('');
      setShowShippingLineSuggestions(false);
      
      showNotification(`Successfully added "${selectedShippingLine}" to "${podInput.trim()}"!`);
      
    } catch (error) {
      console.error('Error adding POD and shipping line:', error);
      showNotification('Failed to add data. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove shipping line from POD
  const handleRemoveShippingLine = async (shippingLineName) => {
    if (!window.confirm(`Are you sure you want to remove "${shippingLineName}" from "${podInput.trim()}"?`)) return;

    if (!currentDestinationId) {
      showNotification('Cannot remove shipping line - destination not found', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      // Find the shipping line ID
      const shippingLine = currentPODShippingLines.find(line => line.name === shippingLineName);
      if (!shippingLine || !shippingLine.id) {
        showNotification('Shipping line ID not found', 'error');
        return;
      }

      // Remove shipping line via API
      await removeShippingLineFromDestination(currentDestinationId, shippingLine.id);
      
      // Refresh data from API using utility function
      const updatedDestinations = await refreshDestinationsData();
      
      // Update current POD shipping lines display
      const currentDestination = updatedDestinations.find(dest => dest._id === currentDestinationId);
      if (currentDestination) {
        const lines = currentDestination.shippingLines?.map(line => ({ 
          name: line.lineName, 
          id: line._id 
        })) || [];
        setCurrentPODShippingLines(lines);
      }
      
      showNotification(`Successfully removed "${shippingLineName}" from "${podInput.trim()}"!`);
      
    } catch (error) {
      console.error('Error removing shipping line:', error);
      showNotification('Failed to remove shipping line. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Navbar />
      
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <FiCheck className="mr-2" />
            ) : (
              <LuTrash2 className="mr-2" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/pod_lines')}
              className="mr-4 p-3 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50"
            >
              <LuArrowLeft className="text-gray-600 text-lg" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">POD Data Management</h1>
              <p className="text-gray-600 mt-1">Manage POD destinations and shipping lines</p>
            </div>
          </div>
          
          {/* User Info */}
          <div className="bg-white rounded-lg shadow-md px-4 py-2 border border-gray-200">
            <div className="flex items-center">
              <LuUser className="text-purple-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-900">Welcome, {userName}</p>
                <p className="text-xs text-gray-500">Authorized Administrator</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Form Section */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-3 mr-4">
                    <div className="flex items-center">
                      <LuMapPin className="text-purple-600 text-lg mr-1" />
                      <MdDirectionsBoat className="text-indigo-600 text-lg" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Add POD & Shipping Line</h2>
                    <p className="text-sm text-gray-600">Enter destination and select shipping line</p>
                  </div>
                </div>
                
                {/* Refresh Button */}
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isLoading || isRefreshing}
                  className={`flex items-center px-3 py-2 border border-gray-300 text-gray-600 rounded-md hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm ${
                    isRefreshing ? 'scale-95 bg-gray-50 border-gray-400' : 'hover:scale-105'
                  }`}
                  title="Clear form and refresh"
                >
                  <FiRefreshCw className={`mr-1 text-sm transition-transform duration-300 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`} />
                  <span className="text-xs font-medium">
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </span>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* POD Input with Autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiOutlineLocationMarker className="inline mr-1 text-purple-600" />
                    POD Destination
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative pod-search-container">
                    <input
                      type="text"
                      value={podInput}
                      onChange={(e) => setPodInput(e.target.value)}
                      placeholder="Type POD destination name..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      required
                    />
                    
                    {/* Suggestions Dropdown */}
                    {showPodSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredPodSuggestions.map((pod, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handlePodSuggestionSelect(pod)}
                            className="w-full text-left px-4 py-2 hover:bg-purple-50 focus:bg-purple-50 focus:outline-none transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center">
                              <HiOutlineLocationMarker className="text-purple-600 mr-2 flex-shrink-0" />
                              <span className="text-sm text-gray-900">{pod}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {existingPODs.includes(podInput.trim()) ? 
                      "✓ Existing destination" : 
                      podInput.trim() ? "⚡ New destination will be added" : 
                      "Start typing to see suggestions"
                    }
                  </p>
                </div>

                {/* Shipping Line Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MdDirectionsBoat className="inline mr-1 text-indigo-600" />
                    Shipping Line
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  
                  <div className="relative shipping-line-search-container">
                    <input
                      type="text"
                      value={shippingLineInput}
                      onChange={(e) => handleShippingLineInputChange(e.target.value)}
                      onFocus={() => setShowShippingLineSuggestions(shippingLineInput.length > 0 && filteredShippingLineSuggestions.length > 0)}
                      placeholder="Type shipping line name..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      required
                    />
                    
                    {/* Shipping Line Suggestions Dropdown */}
                    {showShippingLineSuggestions && filteredShippingLineSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredShippingLineSuggestions.slice(0, 10).map((line, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleShippingLineSuggestionSelect(line)}
                            className="w-full text-left px-4 py-3 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none transition-colors duration-200 border-b border-gray-100 last:border-b-0 group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <MdDirectionsBoat className="text-indigo-600 mr-3 flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                                  {line}
                                </span>
                              </div>
                              <LuShip className="text-gray-400 group-hover:text-indigo-600 text-sm" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {shippingLineInput ? 
                      filteredShippingLineSuggestions.length > 0 ? 
                        `${filteredShippingLineSuggestions.length} suggestions found` :
                        isValidShippingLine(shippingLineInput) ? 
                          "✓ Valid shipping line" : 
                          "⚠️ Please select from suggestions" :
                      `${allShippingLines.length} shipping lines available - start typing to search`
                    }
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || !podInput.trim() || !selectedShippingLine}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {isLoading ? (
                      <FiRefreshCw className="animate-spin mr-2" />
                    ) : (
                      <LuSave className="mr-2" />
                    )}
                    {isLoading ? 'Saving...' : 'Save Data'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Auto-Update Shipping Lines Display */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-3 mr-4">
                  <LuEye className="text-blue-600 text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">View Shipping Lines</h2>
                  <p className="text-sm text-gray-600">Auto-updates as you type</p>
                </div>
              </div>

              {/* Display Shipping Lines for Current POD */}
              {podInput.trim() ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium text-gray-900">
                      Lines for {podInput.trim()}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {currentPODShippingLines.length}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {currentPODShippingLines.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <MdDirectionsBoat className="mx-auto text-4xl text-gray-300 mb-3" />
                        <h4 className="text-sm font-medium text-gray-700 mb-1">No Lines Found</h4>
                        <p className="text-xs text-gray-500">
                          No shipping lines for this POD yet
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Add one using the form
                        </p>
                      </div>
                    ) : (
                      currentPODShippingLines.map((line, index) => (
                        <div key={index} className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100 hover:shadow-sm transition-all duration-200">
                          <div className="flex items-center flex-1 min-w-0">
                            <div className="bg-blue-100 rounded-full p-1.5 mr-3 flex-shrink-0">
                              <MdDirectionsBoat className="text-blue-600 text-sm" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-medium text-gray-900 block truncate">
                                {line.name}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveShippingLine(line.name)}
                            disabled={isLoading}
                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 flex-shrink-0 ml-2"
                            title="Remove"
                          >
                            <LuTrash2 className="text-sm" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <HiOutlineLocationMarker className="mx-auto text-4xl text-gray-300 mb-3" />
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Start Typing POD</h4>
                  <p className="text-xs text-gray-500">
                    Enter a POD destination to view its shipping lines
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default POD_Management;


