import { Link } from "react-router";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center select-none text-center px-4 py-10 min-h-full bg-black">
      <h1 className="select-none text-shine mb-6 sm:mb-8 text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl">
        To better me...
      </h1>

      <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-xl mb-6 sm:mb-8">
        Track your sleep, document what you learned each day, and reflect on your progress. Built for personal growth and self-awareness.
      </p>

      <Link to="/sign_in">
        <button className="px-8 py-3 bg-gradient-to-r from-blue-700 to-emerald-600 text-white rounded-xl text-base sm:text-lg font-semibold shadow-lg hover:scale-105 transition duration-300">
          Get Started
        </button>
      </Link>

    </div>
  );
};


export default HomePage;
