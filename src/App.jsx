import Navbar from './components/Navbar'
import Home from './components/Home';
import Workout from './components/Workout';
import About from './components/About';
import ProfileDashboard from './components/progressProfile'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SignupFormDemo } from '../UI/SignupFormDemo';
import { Loginpage } from '../UI/Loginpage';
import './App.css'

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <><Navbar/><Home /></>,
    },

    {
      path: "/workout", 
      element: <><Navbar/>< Workout/></>,
     },
     {
      path: "/progressprofile", 
      element: <> <Navbar /><ProfileDashboard/> </>,
     },


    {
     path: "/about", 
     element: <><Navbar/><About /></>,
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
