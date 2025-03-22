
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, User, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserProfile } from '@/lib/types';

interface NavbarProps {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, setUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('tutorapp_user');
    // Update app state
    setUser(null);
    // Show toast
    toast.success("Logged out successfully");
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container-padding mx-auto">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-tutorblue-500 font-bold text-2xl transition-transform hover:scale-105"
          >
            <BookOpen size={28} />
            <span className="hidden sm:block">TutorConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`hover:text-tutorblue-500 transition-colors ${location.pathname === '/' ? 'text-tutorblue-500 font-medium' : 'text-gray-700'}`}
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/book-session" 
                  className={`hover:text-tutorblue-500 transition-colors ${location.pathname === '/book-session' ? 'text-tutorblue-500 font-medium' : 'text-gray-700'}`}
                >
                  Find Tutors
                </Link>
                <Link 
                  to="/profile" 
                  className={`hover:text-tutorblue-500 transition-colors ${location.pathname === '/profile' ? 'text-tutorblue-500 font-medium' : 'text-gray-700'}`}
                >
                  Profile
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-700 hover:text-tutorblue-500 flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`hover:text-tutorblue-500 transition-colors ${location.pathname === '/login' ? 'text-tutorblue-500 font-medium' : 'text-gray-700'}`}
                >
                  Login
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm" className="bg-tutorblue-500 hover:bg-tutorblue-600">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <button 
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-white animate-slide-in">
          <div className="container-padding mx-auto py-4 space-y-3">
            <Link 
              to="/" 
              className={`block py-2 px-4 rounded-md hover:bg-tutorblue-50 ${location.pathname === '/' ? 'text-tutorblue-500 font-medium' : 'text-gray-700'}`}
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/book-session" 
                  className={`block py-2 px-4 rounded-md hover:bg-tutorblue-50 ${location.pathname === '/book-session' ? 'text-tutorblue-500 font-medium' : 'text-gray-700'}`}
                >
                  Find Tutors
                </Link>
                <Link 
                  to="/profile" 
                  className={`block py-2 px-4 rounded-md hover:bg-tutorblue-50 ${location.pathname === '/profile' ? 'text-tutorblue-500 font-medium' : 'text-gray-700'}`}
                >
                  Profile
                </Link>
                <button 
                  className="w-full text-left py-2 px-4 rounded-md hover:bg-tutorblue-50 text-gray-700 flex items-center space-x-2"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`block py-2 px-4 rounded-md hover:bg-tutorblue-50 ${location.pathname === '/login' ? 'text-tutorblue-500 font-medium' : 'text-gray-700'}`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block"
                >
                  <Button variant="default" size="sm" className="w-full bg-tutorblue-500 hover:bg-tutorblue-600">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
