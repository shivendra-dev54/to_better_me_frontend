import React from "react";
import { useNavigate } from "react-router";
const baseUrl = import.meta.env.VITE_BASE_URL;

interface SignInProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const SignIn: React.FC<SignInProps> = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const formSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    fetch(`${baseUrl}/api/auth/sign_in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to sign in");
        }
        return response.json();
      })
      .then((data) => {
        // console.log("Sign in successful");
        setIsLoggedIn(true);
        localStorage.setItem("authToken", data["token"]);
        navigate("/main_page");
      })
      .catch((error) => {
        console.error("Error signing in:", error);
        setIsLoggedIn(false);
      });
  };

  return (
    <div className="gradient-animate min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-black text-white">
      <div className="w-full max-w-md space-y-8 p-6 rounded-xl bg-gradient-to-br from-slate-800 via-gray-950 to-slate-800 border border-slate-700 shadow-xl">
        <h1 className="text-center text-4xl sm:text-5xl font-bold">Sign In</h1>
        <form className="mt-6 space-y-6" onSubmit={formSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-black text-white rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-black text-white rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-700 to-emerald-600 text-white rounded-lg text-base font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
