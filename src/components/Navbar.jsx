import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // holds { firstname, email } or null
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await axios.get(
        "https://backend-workout-monitoring.onrender.com/check-auth",
        {
          withCredentials: true,
        }
      );
      if (response.data.authenticated) {
        setUser({
          firstname: response.data.user.firstname,
          email: response.data.user.email,
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://backend-workout-monitoring.onrender.com/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-black text-gray-100 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between py-4">
          {/* Logo */}
          <Link
            className="flex items-center space-x-3 text-white"
            to="/"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              className="w-10 h-10 p-2 rounded-lg"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-xl font-bold tracking-wide">Workout Monitoring System</span>
          </Link>

          {/* Mobile menu button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden rounded-lg focus:outline-none focus:shadow-outline p-2 bg-blue-800 hover:bg-blue-700 transition duration-300"
          >
            <svg fill="currentColor" viewBox="0 0 20 20" className="w-6 h-6">
              {mobileMenuOpen ? (
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              ) : (
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z"
                  clipRule="evenodd"
                ></path>
              )}
            </svg>
          </button>

          {/* Desktop Navigation and Auth */}
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} w-full md:flex md:items-center md:w-auto md:justify-between`}>
            <nav className="flex flex-col md:flex-row md:items-center mb-5 md:mb-0 mt-4 md:mt-0">
              <NavLink
                className={({ isActive }) =>
                  isActive 
                    ? "block py-2 px-3 text-blue-300 font-medium border-b-2 border-blue-400 md:border-none md:mx-2"
                    : "block py-2 px-3 text-gray-300 hover:text-white transition duration-300 hover:bg-blue-800 md:hover:bg-transparent md:hover:text-blue-300 md:mx-2"
                }
                to="/"
              >
                Home
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "block py-2 px-3 text-blue-300 font-medium border-b-2 border-blue-400 md:border-none md:mx-2"
                    : "block py-2 px-3 text-gray-300 hover:text-white transition duration-300 hover:bg-blue-800 md:hover:bg-transparent md:hover:text-blue-300 md:mx-2"
                }
                to="/exercise"
              >
                Exercise Overview
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "block py-2 px-3 text-blue-300 font-medium border-b-2 border-blue-400 md:border-none md:mx-2"
                    : "block py-2 px-3 text-gray-300 hover:text-white transition duration-300 hover:bg-blue-800 md:hover:bg-transparent md:hover:text-blue-300 md:mx-2"
                }
                to="/workout"
              >
                Let's Workout
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "block py-2 px-3 text-blue-300 font-medium border-b-2 border-blue-400 md:border-none md:mx-2"
                    : "block py-2 px-3 text-gray-300 hover:text-white transition duration-300 hover:bg-blue-800 md:hover:bg-transparent md:hover:text-blue-300 md:mx-2"
                }
                to="/dashboard"
              >
                Dashboard
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "block py-2 px-3 text-blue-300 font-medium border-b-2 border-blue-400 md:border-none md:mx-2"
                    : "block py-2 px-3 text-gray-300 hover:text-white transition duration-300 hover:bg-blue-800 md:hover:bg-transparent md:hover:text-blue-300 md:mx-2"
                }
                to="/about"
              >
                About Us
              </NavLink>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center mt-4 md:mt-0">
              {!user ? (
                <>
                  <Link
                    className="block text-center py-2 px-6 mb-3 md:mb-0 md:mr-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-300"
                    to="/login"
                  >
                    Login
                  </Link>
                  <Link
                    className="block text-center py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-300"
                    to="/signup"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="py-2 px-4 text-center md:text-left md:mr-4">
                    <p className="text-blue-300">Welcome,</p>
                    <p className="font-semibold text-white">{user.firstname}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <button
                    className="block text-center mt-3 md:mt-0 py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-300"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;