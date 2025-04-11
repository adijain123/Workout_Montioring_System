import React from 'react';
import adi from "../assets/adi.jpg";
import aks from "../assets/aks.jpg";
import avi from "../assets/avi.jpg";
import amit from "../assets/amit.jpg";
import ast from "../assets/ast.jpg";

const About = () => {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-blue-900 min-h-screen">
      <section className="container px-5 py-16 mx-auto">
        <div className="flex flex-col text-center w-full mb-12">
          <h1 className="text-4xl font-bold mb-6 text-white tracking-wide">
            OUR <span className="text-blue-400">TEAM</span>
          </h1>
          <div className="h-1 w-20 bg-blue-500 rounded mx-auto mb-8"></div>
        </div>
        
        <div className="flex flex-wrap justify-center -m-4">
          {/* Team Member - Astitva */}
          <div className="p-4 lg:w-1/5 md:w-1/2">
            <div className="bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg hover:shadow-blue-500/20 hover:transform hover:scale-105 transition duration-300">
              <div className="h-full flex flex-col items-center text-center">
                <div className="w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-blue-400">
                  <img
                    alt="Astitva Jain"
                    className="w-full h-full object-cover object-center"
                    src={ast}
                  />
                </div>
                <div className="w-full">
                  <h2 className="title-font font-medium text-xl text-white mb-2">
                    Astitva Jain
                  </h2>
                  <div className="h-1 w-10 bg-blue-500 rounded mx-auto mb-3"></div>
                  <h3 className="text-blue-300 mb-1 font-semibold">Team Leader</h3>
                  <p className="text-gray-400">Machine Learning</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Team Member - Adi */}
          <div className="p-4 lg:w-1/5 md:w-1/2">
            <div className="bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg hover:shadow-blue-500/20 hover:transform hover:scale-105 transition duration-300">
              <div className="h-full flex flex-col items-center text-center">
                <div className="w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-blue-400">
                  <img
                    alt="Adi Jain"
                    className="w-full h-full object-cover object-center"
                    src={adi}
                  />
                </div>
                <div className="w-full">
                  <h2 className="title-font font-medium text-xl text-white mb-2">
                    Adi Jain
                  </h2>
                  <div className="h-1 w-10 bg-blue-500 rounded mx-auto mb-3"></div>
                  <h3 className="text-blue-300 mb-1 font-semibold">Full-Stack</h3>
                  <p className="text-gray-400">Developer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Member - Akshat */}
          <div className="p-4 lg:w-1/5 md:w-1/2">
            <div className="bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg hover:shadow-blue-500/20 hover:transform hover:scale-105 transition duration-300">
              <div className="h-full flex flex-col items-center text-center">
                <div className="w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-blue-400">
                  <img
                    alt="Akshat Sharma"
                    className="w-full h-full object-cover object-center"
                    src={aks}
                  />
                </div>
                <div className="w-full">
                  <h2 className="title-font font-medium text-xl text-white mb-2">
                    Akshat Sharma
                  </h2>
                  <div className="h-1 w-10 bg-blue-500 rounded mx-auto mb-3"></div>
                  <h3 className="text-blue-300 mb-1 font-semibold">Frontend</h3>
                  <p className="text-gray-400">Developer</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Team Member - Amit */}
          <div className="p-4 lg:w-1/5 md:w-1/2">
            <div className="bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg hover:shadow-blue-500/20 hover:transform hover:scale-105 transition duration-300">
              <div className="h-full flex flex-col items-center text-center">
                <div className="w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-blue-400">
                  <img
                    alt="Amit Tiwari"
                    className="w-full h-full object-cover object-center"
                    src={amit}
                  />
                </div>
                <div className="w-full">
                  <h2 className="title-font font-medium text-xl text-white mb-2">
                    Amit Tiwari
                  </h2>
                  <div className="h-1 w-10 bg-blue-500 rounded mx-auto mb-3"></div>
                  <h3 className="text-blue-300 mb-1 font-semibold">Content</h3>
                  <p className="text-gray-400">Specialist</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Team Member - Aviral */}
          <div className="p-4 lg:w-1/5 md:w-1/2">
            <div className="bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg hover:shadow-blue-500/20 hover:transform hover:scale-105 transition duration-300">
              <div className="h-full flex flex-col items-center text-center">
                <div className="w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-blue-400">
                  <img
                    alt="Aviral Sharma"
                    className="w-full h-full object-cover object-center"
                    src={avi}
                  />
                </div>
                <div className="w-full">
                  <h2 className="title-font font-medium text-xl text-white mb-2">
                    Aviral Sharma
                  </h2>
                  <div className="h-1 w-10 bg-blue-500 rounded mx-auto mb-3"></div>
                  <h3 className="text-blue-300 mb-1 font-semibold">Research</h3>
                  <p className="text-gray-400">& Support</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
};

export default About;