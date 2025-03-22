
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/lib/types';
import {
  GraduationCap,
  BookOpen,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  Calendar,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface NavbarProps {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, setUser }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('tutorapp_user');
    setUser(null);
    toast.success('You have been logged out');
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-tutorblue-600" />
            <span className="font-bold text-xl text-tutorblue-600 hidden sm:inline">
              TutorConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`text-sm font-medium hover:text-tutorblue-600 transition-colors ${
                isActive('/') ? 'text-tutorblue-600' : 'text-gray-600'
              }`}
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  to="/book-session"
                  className={`text-sm font-medium hover:text-tutorblue-600 transition-colors ${
                    isActive('/book-session') ? 'text-tutorblue-600' : 'text-gray-600'
                  }`}
                >
                  Book a Session
                </Link>
                <Link
                  to="/quizzes"
                  className={`text-sm font-medium hover:text-tutorblue-600 transition-colors ${
                    isActive('/quizzes') ? 'text-tutorblue-600' : 'text-gray-600'
                  }`}
                >
                  Quizzes
                </Link>
              </>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="hidden md:flex items-center text-sm font-medium text-gray-600 hover:text-tutorblue-600 transition-colors"
                >
                  <User className="h-4 w-4 mr-1" />
                  {user.email.split('@')[0]}
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden md:flex"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    <LogIn className="h-4 w-4 mr-1" />
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="hidden md:flex bg-tutorblue-500 hover:bg-tutorblue-600">
                    Register
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-gray-600 hover:text-tutorblue-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link
              to="/"
              className={`block py-2 text-base ${
                isActive('/') ? 'text-tutorblue-600' : 'text-gray-600'
              }`}
              onClick={closeMobileMenu}
            >
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Home
              </div>
            </Link>

            {user && (
              <>
                <Link
                  to="/book-session"
                  className={`block py-2 text-base ${
                    isActive('/book-session') ? 'text-tutorblue-600' : 'text-gray-600'
                  }`}
                  onClick={closeMobileMenu}
                >
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Book a Session
                  </div>
                </Link>
                
                <Link
                  to="/quizzes"
                  className={`block py-2 text-base ${
                    isActive('/quizzes') ? 'text-tutorblue-600' : 'text-gray-600'
                  }`}
                  onClick={closeMobileMenu}
                >
                  <div className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Quizzes
                  </div>
                </Link>

                <Link
                  to="/profile"
                  className={`block py-2 text-base ${
                    isActive('/profile') ? 'text-tutorblue-600' : 'text-gray-600'
                  }`}
                  onClick={closeMobileMenu}
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Profile
                  </div>
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="w-full text-left block py-2 text-base text-gray-600"
                >
                  <div className="flex items-center">
                    <LogOut className="h-5 w-5 mr-2" />
                    Log out
                  </div>
                </button>
              </>
            )}

            {!user && (
              <>
                <Link
                  to="/login"
                  className={`block py-2 text-base ${
                    isActive('/login') ? 'text-tutorblue-600' : 'text-gray-600'
                  }`}
                  onClick={closeMobileMenu}
                >
                  <div className="flex items-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Log in
                  </div>
                </Link>

                <Link
                  to="/register"
                  className={`block py-2 text-base ${
                    isActive('/register') ? 'text-tutorblue-600' : 'text-gray-600'
                  }`}
                  onClick={closeMobileMenu}
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Register
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
