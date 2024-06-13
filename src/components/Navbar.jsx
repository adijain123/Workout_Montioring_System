import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate()
  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("name")
    localStorage.removeItem("email")
    navigate("/")
  }

  return (
    <div>
      <header className="text-gray-400 bg-black body-font">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <Link className="flex title-font font-medium items-center text-white mb-4 md:mb-0" to="/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              className="w-10 h-10 text-white p-2 rounded-full"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="ml-3 text-xl">Workout-Monitoring-System</span>
          </Link>
          <nav className="md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-700 flex flex-wrap items-center text-base justify-center">
            <NavLink className={(e) => (e.isActive ? "mr-5 text-blue-500" : "mr-5 hover:text-white")} to="/">Home</NavLink>
            <NavLink className={(e) => (e.isActive ? "mr-5 text-blue-500" : "mr-5 hover:text-white")} to="/workout">Lets Workout</NavLink>
            <NavLink className={(e) => (e.isActive ? "mr-5 text-blue-500" : "mr-5 hover:text-white")} to="/about">About Us</NavLink>
          </nav>
          {(!localStorage.getItem("authToken")) ?
          <>
          <Link className="inline-flex mx-2 items-center font-bold bg-pink-800 border-0 py-1 px-3 focus:outline-none hover:bg-gray-700 rounded text-base mt-4 md:mt-0" to="/login">
            Login
          </Link>
          <Link className="inline-flex items-center font-bold bg-pink-800 border-0 py-1 px-3 focus:outline-none hover:bg-gray-700 rounded text-base mt-4 md:mt-0" to="/signup">
            SignUp
          </Link>
          </>
          :
          <>
          <Link className="inline-flex m-2 items-center bg-pink-800 border-0 py-1 px-3 focus:outline-none hover:bg-gray-700 rounded font-bold text-base mt-4 md:mt-0" onClick={handleLogout}>
            Logout
          </Link>
          <div className='inline-flex p-2 font-bold text-xl text-lime-200'>
            Hey, {localStorage.getItem("name")}
            <br />
            {localStorage.getItem("email")}
          </div>
          </>

          }
        </div>
      </header>
    </div>
  );
}

export default Navbar;
