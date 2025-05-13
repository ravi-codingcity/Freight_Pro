import React from "react";
import { Link } from "react-router-dom";
import { FaTools, FaHardHat, FaCog, FaExclamationTriangle, FaHome, FaArrowLeft } from "react-icons/fa";

const Under_production = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 opacity-5 animate-pulse">
          <FaTools className="text-7xl text-gray-700" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-5 animate-pulse" style={{ animationDelay: "1s" }}>
          <FaHardHat className="text-8xl text-yellow-500" />
        </div>
        <div className="absolute top-1/3 right-1/4 opacity-5 animate-pulse" style={{ animationDelay: "0.5s" }}>
          <FaCog className="text-9xl text-gray-600 animate-spin" style={{ animationDuration: "15s" }} />
        </div>
        <div className="absolute bottom-1/3 left-1/4 opacity-5 animate-pulse" style={{ animationDelay: "1.5s" }}>
          <FaCog className="text-6xl text-gray-600 animate-spin" style={{ animationDuration: "10s", animationDirection: "reverse" }} />
        </div>
      </div>

      <div className="max-w-3xl w-full bg-white rounded-xl shadow-2xl overflow-hidden relative z-10 border-t-4 border-red-500">
        <div className="p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <div className="bg-yellow-100 p-5 rounded-full">
              <FaExclamationTriangle className="text-5xl text-yellow-500" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
            Under Production
          </h1>
          
          <div className="flex justify-center mb-6">
            <div className="h-2 w-20 bg-red-500 rounded-full"></div>
          </div>
          
          <p className="text-center text-gray-600 mb-8 text-lg">
            We're working hard to bring you an amazing experience. <br />
            This section of our software is currently under development.
          </p>
          
          <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:justify-center md:space-x-4">
            <Link
              to="/"
              className="flex items-center justify-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300"
            >
              <FaHome className="mr-2" />
              Return to Homepage
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300"
            >
              <FaArrowLeft className="mr-2" />
              Go Back
            </button>
          </div>
        </div>
        
        <div className="bg-gray-100 p-6 text-center">
          <p className="text-gray-600">
            Expected completion: <span className="font-semibold">Coming Soon</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            We appreciate your patience while we improve our services.
          </p>
        </div>
        
        {/* Progress bar animation */}
        <div className="h-1.5 w-full bg-gray-200 relative overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-400 to-red-600 absolute animate-progress"></div>
        </div>
      </div>
      
      {/* Custom animation keyframes */}
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; left: 0; }
          50% { width: 40%; left: 30%; }
          75% { width: 20%; left: 70%; }
          100% { width: 0%; left: 100%; }
        }
        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Under_production;
