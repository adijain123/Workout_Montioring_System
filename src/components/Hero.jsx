import React from "react";
import double from "../assets/double.jpg";
import lift from "../assets/lift.jpg";
import thigh from "../assets/thigh.jpg";
import third from "../assets/third.jpg";
import "animate.css";
import { Button } from "@nextui-org/react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link } from "react-router-dom";

export default function Hero() {
  AOS.init();
  const exercises = [
    {
      name: "Lifting",
      image: 'https://images.theconversation.com/files/460514/original/file-20220429-20-h0umhf.jpg?ixlib=rb-4.1.0&rect=0%2C10%2C3500%2C2226&q=45&auto=format&w=926&fit=clip',
      info: "Lifting is a great way to build muscle and strength.Weightlifting or weight lifting generally refers to physical exercises and sports in which people lift weights, often in the form of dumbbells or barbells. People engage in weightlifting for a variety of different reasons. These can include: developing physical strength; promoting health and fitness; competing in weightlifting sports; and developing a muscular and aesthetic physique.",
    },
    {
      name: "Lunges",
      image: thigh,
      info: "Lunges work your legs and glutes, improving balance and coordination.A lunge can refer to any position of the human body where one leg is positioned forward with knee bent and foot flat on the ground while the other leg is positioned behind.[1][2][3] It is used by athletes in cross-training for sports, by weight-trainers as a fitness exercise, and by practitioners of yoga as part of an asana regimen",
    },
    {
      name: "Jumping Jacks",
      image: double,
      info: "A jumping jack, also known as a star jump and called a side-straddle hop in the US military, is a physical jumping exercise performed by jumping to a position with the legs spread wide and the hands going overhead, sometimes in a clap, and then returning to a position with the feet together and the arms at the sides.",
    },
    {
      name: "Double Leg Lift",
      image: 'https://www.shutterstock.com/shutterstock/photos/1338723998/display_1500/stock-vector-woman-doing-double-leg-raise-exercise-in-step-illustration-about-introduction-workout-1338723998.jpg',
      info: "The lying leg raise is done by lying on the floor on the back. It is done without apparatus except possibly cushions, or weights for added resistance.Practitioners generally caution to keep the lower back in contact with the floor and place hands to sides or under lower back for support.Due to leverage, the hardest portion of a supine (lying) leg raise is generally the first part when the legs are on the floor, as this is when the femur is parallel with the earth and perpendicular to the pull of gravity.",
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-6">
        {exercises.map((exercise, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row ${
              index % 2 === 0 ? "md:flex-row-reverse" : ""
            } ${
              index % 2 === 0
                ? "bg-gradient-to-r from-[#1dff2560] via-[#00ffee42] to-transparent"
                : "bg-gradient-to-l from-[#fd3ef749] via-[#6600ff47] to-transparent"
            } justify-between items-center p-4 text-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300`}
          >
            <div
              data-aos="fade-right"
              data-aos-offset="100"
              data-aos-duration="300"
              data-aos-easing="ease-in-out"
              data-aos-mirror="true"
              data-aos-once="true"
              className="flex items-center justify-center w-full md:w-1/3 p-2"
            >
              <img
                src={exercise.image}
                alt={exercise.name}
                className="w-full rounded-md transform hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div
              data-aos="fade-left"
              data-aos-offset="100"
              data-aos-duration="300"
              data-aos-easing="ease-in-out"
              data-aos-mirror="true"
              data-aos-once="true"
              className="flex flex-col justify-center w-full md:w-2/3 p-6 bg-black bg-opacity-40 shadow-black border-2 border-[#ffffff52] shadow-sm rounded-xl m-2"
            >
              <h2 className="text-2xl font-bold pb-4 underline underline-offset-8 decoration-yellow-500">
                {exercise.name}
              </h2>
              <p className="text-lg md:text-xl">{exercise.info}</p>
              <Link to="/workout">
                <button className="bg-white mt-6 outline-none border-none rounded-lg py-2 px-4 hover:scale-105 hover:text-xl font-semibold text-yellow-600 hover:text-yellow-700 cursor-pointer transition-all">
                  See More{" "}
                  <span className="hidden group-hover:inline-block font-extrabold text-red-700 transition-all">
                    &nbsp;&gt;
                  </span>
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
