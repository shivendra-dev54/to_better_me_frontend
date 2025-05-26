import { Link, useNavigate } from "react-router";

interface NavbarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

const Navbar = ({ isLoggedIn, setIsLoggedIn }: NavbarProps) => {

  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="h-16 bg-black  text-white flex items-center justify-center px-4 shadow-md">
      <div className="flex w-screen">
        <Link to="/" className="p-2 text-2xl text-center flex items-center">
          Heart
        </Link>
        <div className="ml-auto flex">
          {isLoggedIn ? (
            <>
              <Link to="/main_page" className="p-6">
                Home
              </Link>
              <Link to="/profile" className="p-6">
                Profile
              </Link>
              <button onClick={handleLogout} className="p-6">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/sign_in" className="p-6">
                Sign In
              </Link>
              <Link to="/sign_up" className="p-6">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;