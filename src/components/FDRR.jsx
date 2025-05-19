import { useState, useEffect } from 'react';

/**
 * Fetches data from the API and extracts unique "Final Destination (Rail Ramps)" values
 * @returns {Promise<string[]>} A promise that resolves to an array of unique rail ramp destinations
 */
export const fetchUniqueRailRamps = async () => {
  try {
    // Use cache control to ensure we get fresh data
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
    
    // Extract all "Final Destination (Rail Ramps)" values
    const allRailRamps = data.map(item => item["fdrr"]).filter(Boolean);
    
    // Filter to get only unique values using Set
    const uniqueRailRamps = [...new Set(allRailRamps)]
      .filter(ramp => ramp && ramp.trim() !== '') // Remove empty values
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())); // Sort alphabetically
    
    return uniqueRailRamps;
  } catch (err) {
    console.error('Error fetching rail ramps:', err);
    return [];
  }
};

const FDRR = () => {
  const [railRamps, setRailRamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRailRamps = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const uniqueRailRamps = await fetchUniqueRailRamps();
        setRailRamps(uniqueRailRamps);
      } catch (err) {
        setError(err.message);
        console.error('Error loading rail ramps:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadRailRamps();
  }, []);

  return (
    <div>
      <h2>Final Destination Rail Ramps</h2>
      {loading && <p>Loading rail ramps...</p>}
      {error && <p className="error">Error: {error}</p>}
      
      {!loading && !error && (
        <div>
          <p>Found {railRamps.length} unique rail ramps:</p>
          <ul>
            {railRamps.map((ramp, index) => (
              <li key={index}>{ramp}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FDRR;
