import React, { useState } from "react";

function text() {
  const [validity_for, setValidity_for] = React.useState("");
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="relative w-full sm:w-1/2">
        <select
          value={validity_for || ""}
          onChange={(e) => setValidity_for(e.target.value)}
          className="appearance-none mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 pr-10 bg-white"
          required
        >
          <option value="">Select Validity Type</option>
          <option value="Gate-in">For Gate-in</option>
          <option value="Sailing">For Sailing</option>
          <option value="Handover">For Handover</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default text;
