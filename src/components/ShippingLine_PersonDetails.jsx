import { useState, useEffect } from 'react';

// Store cached data to avoid repeated API calls
let cachedShippingLineDetails = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache duration

// Track if we're currently fetching to avoid duplicate requests
let isFetchingData = false;
// Add a promise to track ongoing fetch operations
let currentFetchPromise = null;

/**
 * Prefetch shipping line contact details in the background immediately
 * This can be called when the app initializes to have data ready before user interaction
 */
export const prefetchShippingLineContactDetails = async () => {
  console.log('Prefetching shipping line contact details...');
  try {
    // Use existing promise if there's already a fetch in progress
    if (currentFetchPromise) {
      console.log('Using existing fetch promise for prefetch');
      return await currentFetchPromise;
    }
    
    // Start new fetch operation
    const result = await fetchShippingLineContactDetails();
    console.log(`Prefetch complete, cached ${Object.keys(result).length} shipping lines`);
    return result;
  } catch (err) {
    console.error('Background prefetch error:', err);
    throw err;
  }
};

/**
 * Fetches all shipping line contact details from the API
 * @returns {Promise<Object>} Object containing shipping lines mapped to their contact details
 */
export const fetchShippingLineContactDetails = async () => {
  // Check if we have valid cached data
  const now = Date.now();
  if (cachedShippingLineDetails && (now - lastFetchTime < CACHE_DURATION)) {
    console.log('Using cached shipping line details');
    return cachedShippingLineDetails;
  }
  
  // Return existing promise if we're already fetching
  if (currentFetchPromise) {
    console.log('Reusing in-progress fetch operation');
    return currentFetchPromise;
  }
  
  // Set flag to indicate we're fetching
  isFetchingData = true;
  
  // Create a new promise for this fetch operation
  currentFetchPromise = (async () => {
    try {
      console.log('Fetching shipping line details from API');
      const response = await fetch('https://freightpro-4kjlzqm0.b4a.run/api/forms/all', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the data to create a mapping of shipping lines to contact details
      const shippingLineMap = {};
      
      data.forEach(item => {
        if (!item.shipping_lines) return;
        
        if (!shippingLineMap[item.shipping_lines]) {
          shippingLineMap[item.shipping_lines] = [];
        }
        
        // Only add contact details if they exist
        if (item.shipping_name || item.shipping_number || item.shipping_email || item.shipping_address) {
          // Create a contact details object
          const contactDetails = {
            name: item.shipping_name || '',
            number: item.shipping_number || '',
            email: item.shipping_email || '',
            address: item.shipping_address || ''
          };
          
          // Check if this exact combination already exists to avoid duplicates
          const exists = shippingLineMap[item.shipping_lines].some(contact => 
            contact.name === contactDetails.name && 
            contact.number === contactDetails.number &&
            contact.email === contactDetails.email &&
            contact.address === contactDetails.address
          );
          
          if (!exists) {
            shippingLineMap[item.shipping_lines].push(contactDetails);
          }
        }
      });
      
      // Update cache
      cachedShippingLineDetails = shippingLineMap;
      lastFetchTime = now;
      console.log('Shipping line details fetched and cached successfully');
      
      return shippingLineMap;
    } catch (err) {
      console.error('Error fetching shipping line details:', err);
      // Return existing cache even if expired in case of error
      if (cachedShippingLineDetails) {
        return cachedShippingLineDetails;
      }
      return {};
    } finally {
      // Reset fetching flag and promise
      isFetchingData = false;
      currentFetchPromise = null;
    }
  })();
  
  // Return the promise
  return currentFetchPromise;
};

/**
 * Gets contact suggestions for a specific shipping line
 * @param {string} shippingLine - The selected shipping line
 * @returns {Promise<Array>} Array of contact detail objects
 */
export const getContactSuggestions = async (shippingLine) => {
  if (!shippingLine) return [];
  
  try {
    console.log(`Getting contact suggestions for: ${shippingLine}`);
    
    // Try to get from cache first (this will be very fast)
    if (cachedShippingLineDetails && Date.now() - lastFetchTime < CACHE_DURATION) {
      console.log('Returning contact suggestions from cache');
      return cachedShippingLineDetails[shippingLine] || [];
    }
    
    // If not in cache or cache expired, fetch from API
    console.log('Cache miss or expired, fetching fresh data');
    const shippingLineMap = await fetchShippingLineContactDetails();
    return shippingLineMap[shippingLine] || [];
  } catch (err) {
    console.error('Error getting contact suggestions:', err);
    return [];
  }
};

/**
 * Gets unique values for a specific contact field across all shipping lines
 * @param {string} field - The contact field (name, number, email, address)
 * @returns {Promise<Array>} Array of unique values for the specified field
 */
export const getUniqueContactValues = async (field) => {
  try {
    const shippingLineMap = await fetchShippingLineContactDetails();
    const allValues = new Set();
    
    Object.values(shippingLineMap).forEach(contacts => {
      contacts.forEach(contact => {
        if (contact[field] && contact[field].trim() !== '') {
          allValues.add(contact[field]);
        }
      });
    });
    
    return [...allValues].sort();
  } catch (err) {
    console.error(`Error getting unique ${field} values:`, err);
    return [];
  }
};

// Add a function to clear the cache (for use after form submission)
export const clearShippingLineContactCache = () => {
  cachedShippingLineDetails = null;
  lastFetchTime = 0;
  currentFetchPromise = null;
};

// Component for debugging - can be used to display shipping line details
const ShippingLinePersonDetails = () => {
  const [shippingLines, setShippingLines] = useState([]);
  const [selectedLine, setSelectedLine] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadShippingLines = async () => {
      setLoading(true);
      try {
        const data = await fetchShippingLineContactDetails();
        setShippingLines(Object.keys(data).sort());
      } catch (error) {
        console.error('Error loading shipping lines:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadShippingLines();
  }, []);
  
  useEffect(() => {
    const loadContacts = async () => {
      if (!selectedLine) {
        setContacts([]);
        return;
      }
      
      try {
        const contactData = await getContactSuggestions(selectedLine);
        setContacts(contactData);
      } catch (error) {
        console.error('Error loading contacts:', error);
        setContacts([]);
      }
    };
    
    loadContacts();
  }, [selectedLine]);
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Shipping Line Contact Details</h2>
      
      {loading ? (
        <p>Loading shipping lines...</p>
      ) : (
        <>
          <div className="mb-4">
            <label className="block mb-1">Select Shipping Line:</label>
            <select 
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a shipping line</option>
              {shippingLines.map(line => (
                <option key={line} value={line}>{line}</option>
              ))}
            </select>
          </div>
          
          {selectedLine && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact Details</h3>
              {contacts.length === 0 ? (
                <p>No contact details found for {selectedLine}</p>
              ) : (
                <ul className="space-y-4">
                  {contacts.map((contact, index) => (
                    <li key={index} className="p-3 border rounded bg-gray-50">
                      <p><strong>Name:</strong> {contact.name || 'N/A'}</p>
                      <p><strong>Number:</strong> {contact.number || 'N/A'}</p>
                      <p><strong>Email:</strong> {contact.email || 'N/A'}</p>
                      <p><strong>Address:</strong> {contact.address || 'N/A'}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShippingLinePersonDetails;
