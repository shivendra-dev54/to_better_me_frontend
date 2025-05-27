import React from "react";
import { useNavigate } from "react-router";
const baseUrl = import.meta.env.VITE_BASE_URL;

const SignUp = () => {
  const navigate = useNavigate();

  const formSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    
    fetch(`${baseUrl}/api/auth/sign_up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to sign in");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Sign up successful:", data);
        // Handle successful sign-in (e.g., redirect, save token)
        alert("created account successfully");
        navigate("/sign_in");

      })
      .catch((error) => {
        console.error("Error SignUp:", error);
        alert("Unable to log in");
      });
  }



  return (
    <div className="min-h-full flex items-center justify-center text-white text-4xl select-none gradient-animate">
      <div className="w-full max-w-sm space-y-8 rounded-xl p-6 bg-gradient-to-br from-slate-800 via-gray-950 to-slate-800 border border-slate-600 shadow-xl">
        <h1 className="text-center text-5xl font-bold">Sign Up</h1>
        <form
          className="mt-8 space-y-6"
          onSubmit={formSubmit}
        >
          <div className="rounded-md shadow-sm -space-y-px">

            {/* Email address */}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Username
              </label>
              <p className="text-xl mt-10 text-slate-300">
                Username:
              </p>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete=""
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="username"
              />
            </div>



            {/* Email address */}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <p className="text-xl mt-10 text-slate-300">
                Email:
              </p>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            {/* password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <p className="text-xl mt-10 text-slate-300">
                Password:
              </p>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-700 to-emerald-600 text-white rounded-xl text-lg font-semibold shadow-lg hover:scale-91 scale-90 transition duration-300 w-full"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
