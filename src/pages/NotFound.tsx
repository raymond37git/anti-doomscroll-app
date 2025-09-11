import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-thin tracking-wider text-black">404</h1>
        <p className="text-xl text-gray-600 font-light">Page not found</p>
        <a href="/" className="text-black hover:text-gray-600 underline font-thin tracking-wider uppercase">
          Return to App
        </a>
      </div>
    </div>
  );
};

export default NotFound;
