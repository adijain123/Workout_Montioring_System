import Navbar from './components/Navbar'
import Home from './components/Home';
import Workout from './components/Workout';
import About from './components/About';
import Footer from './components/Footer'
import ProfileDashboard from './components/progressProfile'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SignupFormDemo } from '../UI/SignupFormDemo';
import { Loginpage } from '../UI/Loginpage';
import './App.css'

import Hero from './components/Hero';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <><Navbar/><Home /><Footer/></>,
    },

    {
      path: "/workout", 
      element: <><Navbar/>< Workout/><Footer/></>,
     },

     {
      path: "/exercise", 
      element: <><Navbar/>< Hero/><Footer/></>,
     },
    
     {
      path: "/dashboard", 
      element: <><Navbar/>< ProfileDashboard/><Footer/></>,
     },

    {
     path: "/about", 
     element: <><Navbar/><About /><Footer/></>,
    },
    
    {
      path: "/signup", 
      element: <> <SignupFormDemo /></>,
     },
     {
      path: "/login", 
      element: <> <Loginpage /></>,
     },
     
  ]);
  return (
    <>
    <RouterProvider router={router} />
   </>
  )
}

export default App
