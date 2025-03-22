
import { BookOpen, Mail, GitHub } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
      <div className="container-padding mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 text-tutorblue-500 font-bold text-xl mb-4">
              <BookOpen size={24} />
              <span>TutorConnect</span>
            </Link>
            <p className="text-gray-600 mb-4 max-w-md">
              Connecting learners with expert tutors through AI matching and secure blockchain payments. Learn from the best, anytime, anywhere.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-tutorblue-500 transition-colors">
                <Mail size={20} aria-label="Email" />
              </a>
              <a href="#" className="text-gray-500 hover:text-tutorblue-500 transition-colors">
                <GitHub size={20} aria-label="GitHub" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-600 hover:text-tutorblue-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/book-session" className="text-gray-600 hover:text-tutorblue-500 transition-colors">
                  Find Tutors
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-tutorblue-500 transition-colors">
                  Become a Tutor
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-tutorblue-500 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-tutorblue-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-tutorblue-500 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} TutorConnect. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-tutorblue-500 transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-tutorblue-500 transition-colors text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-tutorblue-500 transition-colors text-sm">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
