const API_BASE_URL = 'http://localhost:5001/api';

// Get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Fetch all destinations
export const fetchAllDestinations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/destinations`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch destinations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching destinations:', error);
    throw error;
  }
};

// Fetch active destinations
export const fetchActiveDestinations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/destinations/active`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active destinations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching active destinations:', error);
    throw error;
  }
};

// Get specific destination by ID
export const fetchDestinationById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/destinations/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch destination');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching destination:', error);
    throw error;
  }
};

// Create new destination
export const createDestination = async (destinationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/destinations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(destinationData)
    });

    if (!response.ok) {
      throw new Error('Failed to create destination');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating destination:', error);
    throw error;
  }
};

// Update destination
export const updateDestination = async (id, destinationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/destinations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(destinationData)
    });

    if (!response.ok) {
      throw new Error('Failed to update destination');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating destination:', error);
    throw error;
  }
};

// Delete destination
export const deleteDestination = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/destinations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete destination');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting destination:', error);
    throw error;
  }
};

// Add shipping line to destination
export const addShippingLineToDestination = async (destinationId, shippingLineData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/destinations/${destinationId}/shipping-lines`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(shippingLineData)
    });

    if (!response.ok) {
      throw new Error('Failed to add shipping line');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding shipping line:', error);
    throw error;
  }
};

// Update shipping line
export const updateShippingLine = async (destinationId, lineId, shippingLineData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/destinations/${destinationId}/shipping-lines/${lineId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(shippingLineData)
    });

    if (!response.ok) {
      throw new Error('Failed to update shipping line');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating shipping line:', error);
    throw error;
  }
};

// Remove shipping line from destination
export const removeShippingLineFromDestination = async (destinationId, lineId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/destinations/${destinationId}/shipping-lines/${lineId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to remove shipping line');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing shipping line:', error);
    throw error;
  }
};

// Find destinations by shipping line name
export const findDestinationsByShippingLine = async (shippingLineName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/destinations/shipping-line/${encodeURIComponent(shippingLineName)}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to find destinations by shipping line');
    }

    return await response.json();
  } catch (error) {
    console.error('Error finding destinations by shipping line:', error);
    throw error;
  }
};

// Utility function to merge API data with static data
export const mergeDestinationData = (staticData, apiData) => {
  const merged = { ...staticData };
  
  if (apiData && Array.isArray(apiData)) {
    apiData.forEach(destination => {
      if (destination.destinationName && destination.shippingLines) {
        const lines = destination.shippingLines.map(line => ({
          name: line.lineName,
          id: line._id
        }));
        merged[destination.destinationName] = lines;
      }
    });
  }
  
  return merged;
};

// Error handler utility
export const handleAPIError = (error, fallbackData = null) => {
  console.error('API Error:', error);
  
  if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    console.warn('Network error - using fallback data');
    return fallbackData;
  }
  
  throw error;
};
