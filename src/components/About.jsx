import React from 'react'
import adi from "../assets/adi.jpg";
import aks from "../assets/aks.jpg";
import avi from "../assets/avi.jpg";
import amit from "../assets/amit.jpg";
import ast from "../assets/ast.jpg";

const About = () => {
  return (
    <div className="">
      <section className="text-gray-400 pb-10 bg-gray-900 body-font">
  <div className=" container px-5 py-24 mx-auto">
    <div className="flex flex-col text-center w-full mb-20">
      <h1 className="text-2xl font-medium title-font mb-4 text-white">
        OUR TEAM
      </h1>
    </div>
    <div className="flex flex-wrap -m-4">
      <div className="p-4 lg:w-1/5 md:w-1/2">
        <div className="h-full flex flex-col items-center text-center">
          <img
            alt="team"
            className="flex-shrink-0 rounded-lg w-full h-56 object-cover object-center mb-4"
            src={ast}
          />
          <div className="w-full">
            <h2 className="title-font font-medium text-lg text-white">
              Astitva Jain 
            </h2>
            
            <h3 className="text-gray-500 mb-3">Team Leader <br/>Machine Learning</h3>
          </div>
        </div>
      </div>
      <div className="p-4 lg:w-1/5 md:w-1/2">
        <div className="h-full flex flex-col items-center text-center">
          <img
            alt="team"
            className="flex-shrink-0 rounded-lg w-full h-56 object-cover object-center mb-4"
            src={aks}
          />
          <div className="w-full">
            <h2 className="title-font font-medium text-lg text-white">
              Akshat Sharma
            </h2>
            
            <h3 className="text-gray-500 mb-3">Frontend</h3>
          </div>
        </div>
      </div>
      <div className="p-4 lg:w-1/5 md:w-1/2">
        <div className="h-full flex flex-col items-center text-center">
          <img
            alt="team"
            className="flex-shrink-0 rounded-lg w-full h-56 object-cover object-center mb-4"
            src={amit}
          />
          <div className="w-full">
            <h2 className="title-font font-medium text-lg text-white">
              Amit Tiwari
            </h2>
            
            <h3 className="text-gray-500 mb-3">Content</h3>
          </div>
        </div>
      </div>
      <div className="p-4 lg:w-1/5 md:w-1/2">
        <div className="h-full flex flex-col items-center text-center">
          <img
            alt="team"
            className="flex-shrink-0 rounded-lg w-full h-56 object-cover object-center mb-4"
            src={avi}
          />
          <div className="w-full ">
            <h2 className="title-font font-medium text-lg text-white">
              Aviral Sharma
            </h2>
            <h3 className="text-gray-500 mb-3">Overall Support and Research</h3>
            
          </div>
        </div>
      </div>
      <div className="p-4 lg:w-1/5 md:w-1/2">
        <div className="h-full flex flex-col items-center text-center">
          <img
            alt="team"
            className="flex-shrink-0 rounded-lg w-full h-56 object-cover object-center mb-4"
            src={adi}
          />
          <div className="w-full">
            <h2 className="title-font font-medium text-lg text-white">
              Adi Jain
            </h2>
            
            <h3 className="text-gray-500 mb-3">Frontend and Backend</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

    </div>
  )
}

export default About
