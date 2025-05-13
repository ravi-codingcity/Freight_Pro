import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/omtrans_logo.png";
import {
  FaLock,
  FaEnvelope,
  FaShip,
  FaTruck,
  FaPlane,
  FaGlobeAmericas,
  FaBoxOpen,
  FaShippingFast,
} from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function loginUser(email, password) {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("https://freightpro-4kjlzqm0.b4a.run/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", email);
        console.log("Login successful!");
        navigate("/import_export");
      } else {
        setError(
          data.message || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      setError("Connection error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced decorative background elements */}
      <div className="absolute bottom-0 right-0 opacity-5 hidden lg:block">
        <FaShip className="text-9xl text-red-700" />
      </div>
      <div className="absolute top-10 left-10 opacity-5 hidden lg:block">
        <FaTruck className="text-8xl text-red-700" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-5 hidden lg:block">
        <FaPlane className="text-7xl text-red-700 transform rotate-45" />
      </div>
      <div className="absolute top-40 right-40 opacity-5 hidden lg:block">
        <FaGlobeAmericas className="text-8xl text-red-700" />
      </div>
      <div className="absolute top-1/4 left-1/4 opacity-5 hidden xl:block">
        <FaBoxOpen className="text-6xl text-red-700" />
      </div>
      <div className="absolute bottom-1/3 right-1/4 opacity-5 hidden xl:block">
        <FaShippingFast className="text-7xl text-red-700" />
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-xl border-2 border-red-200">
        <div className="text-center">
          <img src={logo} alt="OmTrans Logo" className="h-20 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Freight Pro
          </h2>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg transition-all duration-150 disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500 mt-3">
          Need support? Contact IT Department at{" "}
          <a className="text-red-600 font-medium" href="mailto:it@omtrans.com">
            it@omtrans.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
