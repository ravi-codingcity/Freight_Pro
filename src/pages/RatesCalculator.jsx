import React, { useState } from 'react';
import POR from './POR';

const RatesCalculator = () => {
  const [por, setPOR] = useState('');
  const [containerType, setContainerType] = useState('');
  // Update the state to track whether the selected POR is an ICD
  const [isPORanICD, setIsPORanICD] = useState(false);

  // Update the POR selection handler
  const handlePORChange = (location, isICD) => {
    setPOR(location);
    setIsPORanICD(isICD);
    // ...existing code...
  };

  return (
    <div>
      {/* ...existing code... */}
      <POR
        // ...existing props...
        onChange={handlePORChange}
      />
      {/* Update the condition for displaying the weight rates section */}
      {por && containerType && isPORanICD && (
        <div className="rail-freight-weight-section">
          <h3>Rail Freight Based on Cargo Weight</h3>
          {/* Weight rates content */}
          {/* ...existing code... */}
        </div>
      )}
      {/* ...existing code... */}
    </div>
  );
};

export default RatesCalculator;