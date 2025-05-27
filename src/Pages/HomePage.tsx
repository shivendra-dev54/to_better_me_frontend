import { Link } from "react-router";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center select-none text-center px-4 py-10 min-h-full bg-black">
      <h1 className="text-9xl select-none text-shine mb-10">
        To better me...
      </h1>

      <p className="text-xl text-gray-300 max-w-xl mb-8">
        Track your sleep, document what you learned each day, and reflect on your progress. Built for personal growth and self-awareness.
      </p>

      <Link to="/sign_in">
        <button className="px-8 py-3 bg-gradient-to-r from-blue-700 to-emerald-600 text-white rounded-xl text-lg font-semibold shadow-lg hover:scale-105 transition duration-300">
          Get Started
        </button>
      </Link>
    </div>
  );
};


export default HomePage;
