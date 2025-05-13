import React from "react";
import { Link } from "react-router-dom";
import {
  FaShip,
  FaPlane,
  FaTruckMoving,
  FaArrowRight,
  FaGlobeAmericas,
  FaBoxOpen,
  FaWarehouse,
  FaShippingFast,
  FaAnchor,
} from "react-icons/fa";
import { RiShip2Fill } from "react-icons/ri";
import logo from "../assets/omtrans_logo.png";

const Import_Export = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background icons */}
      <div className="absolute top-20 right-10 opacity-5 hidden lg:block">
        <FaShip className="text-8xl text-blue-700" />
      </div>
      <div className="absolute bottom-20 left-10 opacity-5 hidden lg:block">
        <FaPlane className="text-7xl text-red-700 transform rotate-45" />
      </div>
      <div className="absolute top-1/3 left-20 opacity-5 hidden xl:block">
        <FaGlobeAmericas className="text-9xl text-gray-700" />
      </div>
      <div className="absolute bottom-1/3 right-20 opacity-5 hidden xl:block">
        <FaBoxOpen className="text-6xl text-red-600" />
      </div>
      <div className="absolute top-2/3 left-1/3 opacity-5 hidden xl:block">
        <FaWarehouse className="text-8xl text-blue-600" />
      </div>
      <div className="absolute top-40 left-1/4 opacity-5 hidden lg:block">
        <FaTruckMoving className="text-6xl text-gray-700" />
      </div>
      <div className="absolute bottom-40 right-1/4 opacity-5 hidden lg:block">
        <FaShippingFast className="text-7xl text-gray-700" />
      </div>
      <div className="absolute bottom-10 right-1/3 opacity-5 hidden xl:block">
        <FaAnchor className="text-5xl text-blue-600" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Add logo at the top */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="OmTrans Logo" className="h-20" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
          Freight Pro
        </h1>
        <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto">
          Start by Choosing Import or Export to Manage Rates Easily.
        </p>

        <div className="grid md:grid-cols-2 gap-5 mt-5 items-center justify-items-center">
          {/* Export Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 duration-300 flex flex-col h-full border-t-4 border-red-500 w-2/3">
            <div className="p-6 flex-1">
              <div className="flex justify-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <RiShip2Fill className="text-4xl text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mt-4 text-center">
                Export Rates
              </h2>

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-center text-gray-600">
                  <FaPlane className="mr-2 text-red-500" />
                  <span>Domestic to International</span>
                </div>
                <div className="flex items-center justify-center text-gray-600">
                  <FaTruckMoving className="mr-2 text-red-500" />
                  <span>First-Mile Solutions</span>
                </div>
              </div>
            </div>
            <Link
              to="/export/add_rates"
              className="block w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-center font-medium hover:from-red-600 hover:to-red-700 transition-colors"
            >
              <div className="flex items-center justify-center  text-lg">
                <span>Access Export Rates</span>
                <FaArrowRight className="ml-2" />
              </div>
            </Link>
          </div>
          {/* Import Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 duration-300 flex flex-col h-full border-t-4 border-blue-500 w-2/3">
            <div className="p-6 flex-1">
              <div className="flex justify-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaShip className="text-4xl text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mt-4 text-center">
                Import Rates
              </h2>

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-center text-gray-600">
                  <FaShip className="mr-2 text-blue-500" />
                  <span>International to Domestic</span>
                </div>
                <div className="flex items-center justify-center text-gray-600">
                  <FaTruckMoving className="mr-2 text-blue-500" />
                  <span>Complete Last-Mile Solutions</span>
                </div>
              </div>
            </div>
            <Link
              to="/import/under_production"
              className="block w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center font-medium hover:from-blue-600 hover:to-blue-700 transition-colors"
            >
              <div className="flex items-center justify-center text-lg">
                <span>Access Import Rates</span>
                <FaArrowRight className="ml-2" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Import_Export;
