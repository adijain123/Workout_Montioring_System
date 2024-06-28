"use client"
import React,{useState} from "react"
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import { Link } from "react-router-dom"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { cn } from "./utils/cn"
import {
  IconBrandGithub,
  IconBrandGoogle,
} from "@tabler/icons-react"

export function SignupFormDemo() {
  const handleSubmit = e => {
    e.preventDefault()
    console.log("Form submitted")
  }

    const [firstname,setFirstname] = useState('');
    const [lastname,setLastname] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
   
    const navigate = useNavigate();
     
    const registerUser = () => {
      if(firstname.length === 0){
        alert("firstname has left Blank!");
      }
      else if(lastname.length === 0){
        alert("lastname has left Blank!");
      }
      else if(email.length === 0){
        alert("Email has left Blank!");
      }
      else if(password.length === 0){
        alert("Password has left Blank!");
      }

      else{
        axios.post('http://127.0.0.1:5000/signup', {
            firstname:firstname,
            lastname:lastname,
            email: email,
            password: password
        })
        .then(function (response) {
            // console.log(response);
            localStorage.setItem("authToken",response.data.authtoken)
            localStorage.setItem('name',response.data.firstname)
            localStorage.setItem('email',response.data.email)
            // console.log(localStorage)
            navigate("/");
        })
        .catch(function (error) {
            console.log(error, 'error');
            if (error.response.status === 409) {
                alert("Already a User");
            }
        });
      }
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
            <Input id="firstname" value ={firstname} onChange={(e)=>setFirstname(e.target.value)} placeholder="Chandler" type="text" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">Last name</Label>
            <Input id="lastname" value ={lastname} onChange={(e)=>setLastname(e.target.value)} placeholder="Bing" type="text" />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" value ={email} onChange={(e)=>setEmail(e.target.value)} placeholder="bing@fc.com" type="email" />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input id="password" value ={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" type="password" />
        </LabelInputContainer>

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit" onClick={() => registerUser()}
        >
          Sign up &rarr;
          <BottomGradient />
        </button>
        <br />
        <Link
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] text-center pt-2"
          type="submit" to = '/login'
        >
          Already a User, Login Here &rarr;
          <BottomGradient />
        </Link>
        {/* <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-6 h-[1px] w-full" /> */}
        {/* <Label>Sign Up With</Label>
        <div className="flex flex-col space-y-4">
          <button
            className=" mt-2 relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-sky-200 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
            type="submit"
          >
            <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
              GitHub
            </span>
            <BottomGradient />
          </button>
          <button
            className=" relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-sky-200 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
            type="submit"
          >
            <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
              Google
            </span>
            <BottomGradient />
          </button>
        </div> */}
      </form>
    </div>
  )
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  )
}

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  )
}
