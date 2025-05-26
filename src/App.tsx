import { Route, Routes } from "react-router";
import { useState } from "react";

import Navbar from "./Components/Navbar";
import HomePage from "./Pages/HomePage";
import MainPage from "./Pages/MainPage";
import Profile from "./Pages/Profile";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/SignIn";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  return (
    <div className="h-screen w-screen text-blue-100 bg-black flex flex-col overflow-x-hidden select-none">
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/main_page" element={<MainPage isLoggedIn={isLoggedIn} />} />
          <Route path="/sign_in" element={<SignIn setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/sign_up" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
