import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/omtrans_logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");
  const userRole = localStorage.getItem("username");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Function to check if link is active
  const isActive = (path) => location.pathname === path;

  async function logoutUser() {
    setIsLoggingOut(true);
    try {
      const response = await fetch("https://freightpro-4kjlzqm0.b4a.run/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      console.log(data);
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <nav className="bg-gradient-to-r from-gray-50 to-red-50 shadow-lg border-b-2 border-red-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-10 sm:h-12 mr-3" />
          </div>

          {/* Mobile menu button - Larger and more touch-friendly */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 focus:outline-none hover:bg-red-50 p-2 rounded-full transition-colors duration-300"
              aria-label="Toggle menu"
            >
              <svg
                className="h-7 w-7" // Increased size for better touch target
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center space-x-4 lg:space-x-8">
            <Link
              to="/export/view_rates"
              className={`transition-colors duration-300 font-medium text-base lg:text-lg px-2 py-1 rounded-md ${
                isActive("/export/view_rates")
                  ? "text-red-600 font-bold bg-red-50"
                  : "text-gray-700 hover:text-red-600 hover:bg-gray-100"
              }`}
            >
              View Rates
            </Link>
            <Link
              to="/export/add_rates"
              className={`transition-colors duration-300 font-medium text-base lg:text-lg px-2 py-1 rounded-md ${
                isActive("/export/add_rates")
                  ? "text-red-600 font-bold bg-red-50"
                  : "text-gray-700 hover:text-red-600 hover:bg-gray-100"
              }`}
            >
              Add Rates
            </Link>
            <Link
              to="/export/expired_rates"
              className={`transition-colors duration-300 font-medium text-base lg:text-lg px-2 py-1 rounded-md ${
                isActive("/export/expired_rates")
                  ? "text-red-600 font-bold bg-red-50"
                  : "text-gray-700 hover:text-red-600 hover:bg-gray-100"
              }`}
            >
              Expired Rates
            </Link>
                <Link
              to="/pod_lines"
              className={`transition-colors duration-300 font-medium text-base lg:text-lg px-2 py-1 rounded-md ${
                isActive("/pod_lines")
                  ? "text-red-600 font-bold bg-red-50"
                  : "text-gray-700 hover:text-red-600 hover:bg-gray-100"
              }`}
            >
              Destinations
            </Link>
            
             

            {isLoggedIn ? (
              <div className="flex items-center space-x-2 md:space-x-4">
                <button
                  onClick={logoutUser}
                  disabled={isLoggingOut}
                  className="bg-red-600 text-white px-3 py-2 md:px-5 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300 shadow-md text-sm md:text-base disabled:bg-red-400"
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging out...
                    </>
                  ) : (
                    "Logout"
                  )}
                </button>
                <span className="text-gray-800 font-bold bg-gray-200 px-3 py-1 rounded-md text-sm md:text-base whitespace-nowrap">
                  Hi {userRole}
                </span>
              </div>
            ) : (
              <Link
                to="/"
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300 shadow-md text-sm md:text-base"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation - With smooth transitions */}
        <div
          className={`md:hidden mt-3 overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col space-y-3 py-2 bg-white rounded-lg shadow-md">
            <Link
              to="/export/view_rates"
              className={`p-3 mx-2 rounded-md transition-colors duration-300 ${
                isActive("/export/view_rates")
                  ? "text-red-600 font-bold bg-red-50"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setIsOpen(false)}
            >
              View Rates
            </Link>
            <Link
              to="/export/add_rates"
              className={`p-3 mx-2 rounded-md transition-colors duration-300 ${
                isActive("/export/add_rates")
                  ? "text-red-600 font-bold bg-red-50"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Add Rates
            </Link>
            <Link
              to="/export/expired_rates"
              className={`p-3 mx-2 rounded-md transition-colors duration-300 ${
                isActive("/export/expired_rates")
                  ? "text-red-600 font-bold bg-red-50"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Expired Rates
            </Link>

            {isLoggedIn ? (
              <div className="flex flex-col space-y-3 pt-3 mx-2 border-t border-gray-300">
                <span className="text-gray-800 font-bold">Hi {userRole}</span>
                <button
                  onClick={() => {
                    logoutUser();
                    setIsOpen(false);
                  }}
                  disabled={isLoggingOut}
                  className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors duration-300 disabled:bg-red-400"
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging out...
                    </>
                  ) : (
                    "Logout"
                  )}
                </button>
              </div>
            ) : (
              <Link
                to="/"
                className="bg-red-600 text-white mx-2 px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors duration-300 mt-2"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
