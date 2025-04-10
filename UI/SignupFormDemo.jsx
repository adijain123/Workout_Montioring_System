"use client";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { cn } from "./utils/cn";

export function SignupFormDemo() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const registerUser = () => {
    if (!firstname) return alert("First name is blank!");
    if (!lastname) return alert("Last name is blank!");
    if (!email) return alert("Email is blank!");
    if (!password) return alert("Password is blank!");

    axios.post(
      'https://backend-workout-monitoring.onrender.com/signup',
      {
        firstname,
        lastname,
        email,
        password,
      },
      { withCredentials: true } // <-- crucial for setting the session cookie
    )
      .then((response) => {
        console.log("Signup success:", response.data);
        navigate("/");
      })
      .catch((error) => {
        console.error("Signup error:", error);
        if (error.response?.status === 409) {
          alert("User already exists. Try logging in.");
        } else {
          alert("Signup failed. Try again.");
        }
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerUser();
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-black dark:bg-black">
      <h2 className="font-bold text-xl text-sky-200 dark:text-neutral-200">
        <h1 className="text-2xl text-white">Sign Up</h1>
        Welcome to Workout-Monitoring System
      </h2>
      <p className="text-rose-100 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Left Right doesn't matter when you are with us...
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="firstname">First Name</Label>
            <Input id="firstname" value={firstname} onChange={(e) => setFirstname(e.target.value)} placeholder="Chandler" type="text" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">Last Name</Label>
            <Input id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="Bing" type="text" />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="bing@fc.com" type="email" />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" />
        </LabelInputContainer>

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          Sign up &rarr;
          <BottomGradient />
        </button>
        <br />
        <Link
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] text-center pt-2"
          to="/login"
        >
          Already a User? Login Here &rarr;
          <BottomGradient />
        </Link>
      </form>
    </div>
  );
}

const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
  </>
);

const LabelInputContainer = ({ children, className }) => (
  <div className={cn("flex flex-col space-y-2 w-full", className)}>
    {children}
  </div>
);
