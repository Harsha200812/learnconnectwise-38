
import { Link } from 'react-router-dom';
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Clock, Users, Search, CheckCircle, ArrowRight } from 'lucide-react';

interface IndexProps {
  user: UserProfile | null;
}

const Index: React.FC<IndexProps> = ({ user }) => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tutorblue-50 to-white -z-10" />
        <div className="container-padding mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-tutorblue-100 text-tutorblue-700 text-sm font-medium">
                <Sparkles size={16} className="mr-2" />
                <span>Redefining Online Education</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Learn From Expert Tutors <br className="hidden md:block" />
                <span className="text-tutorblue-500">Anytime, Anywhere</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                TutorConnect uses AI matching to connect learners with the perfect tutors, while blockchain ensures secure, transparent payments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to={user ? "/book-session" : "/register"}>
                  <Button className="btn-primary text-lg px-8 py-6 h-auto bg-tutorblue-500 hover:bg-tutorblue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    {user ? "Find Tutors" : "Get Started"}
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <Link to={user ? "/profile" : "/login"}>
                  <Button variant="outline" className="btn-secondary text-lg px-8 py-6 h-auto">
                    {user ? "View Profile" : "Sign In"}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative glass rounded-2xl overflow-hidden shadow-xl animate-pulse-slow h-[360px] md:h-[460px] w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-tutorblue-400/40 to-tutorblue-100/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-8 text-center">
                    <BookOpen size={64} className="text-white mx-auto mb-6" />
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      Connect & Learn
                    </h3>
                    <p className="text-white/90 text-lg max-w-md">
                      Join thousands of students and tutors already using our platform
                    </p>
                  </div>
                </div>
                {/* Animated circles in background */}
                <div className="absolute top-12 left-12 w-16 h-16 rounded-full bg-white/20" />
                <div className="absolute bottom-24 right-16 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white/15" />
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 flex items-center animate-slide-in">
                <div className="bg-tutorblue-100 text-tutorblue-700 p-2 rounded-full mr-3">
                  <Users size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">500+ Expert Tutors</p>
                  <p className="text-xs text-gray-500">Ready to help</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 flex items-center animate-slide-in" style={{ animationDelay: '0.2s' }}>
                <div className="bg-green-100 text-green-700 p-2 rounded-full mr-3">
                  <CheckCircle size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Verified Experts</p>
                  <p className="text-xs text-gray-500">Quality learning</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-padding mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How TutorConnect Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to connect with tutors and start learning right away
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-tutorblue-100 flex items-center justify-center mb-6">
                <Search className="h-7 w-7 text-tutorblue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Find the Perfect Match</h3>
              <p className="text-gray-600">
                Our AI matching system connects you with tutors who specialize in your subject and are available when you are.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-tutorblue-100 flex items-center justify-center mb-6">
                <Clock className="h-7 w-7 text-tutorblue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Book Sessions Easily</h3>
              <p className="text-gray-600">
                Browse tutor profiles, check availability, and book sessions that fit your schedule with just a few clicks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-tutorblue-100 flex items-center justify-center mb-6">
                <Sparkles className="h-7 w-7 text-tutorblue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Secure Blockchain Payments</h3>
              <p className="text-gray-600">
                Our blockchain payment system ensures transparent, secure transactions between learners and tutors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-tutorblue-500 to-tutorblue-600 text-white">
        <div className="container-padding mx-auto max-w-7xl">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join TutorConnect today and connect with expert tutors who can help you achieve your learning goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={user ? "/book-session" : "/register"}>
                <Button size="lg" className="bg-white text-tutorblue-600 hover:bg-white/90 text-lg px-8">
                  {user ? "Find Tutors" : "Sign Up Now"}
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section (simplified for initial version) */}
      <section className="py-20 bg-gray-50">
        <div className="container-padding mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from students and tutors who have transformed their learning experience with TutorConnect
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-700 mb-4">
                "I found an amazing math tutor who helped me prepare for my calculus exam. The AI matching was spot-on!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-tutorblue-100 flex items-center justify-center mr-3">
                  <span className="font-medium text-tutorblue-600">S</span>
                </div>
                <div>
                  <h4 className="font-medium">Sarah L.</h4>
                  <p className="text-sm text-gray-500">Student</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-700 mb-4">
                "As a tutor, I love the flexibility of choosing my own hours and the secure payment system gives me peace of mind."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-tutorblue-100 flex items-center justify-center mr-3">
                  <span className="font-medium text-tutorblue-600">M</span>
                </div>
                <div>
                  <h4 className="font-medium">Michael T.</h4>
                  <p className="text-sm text-gray-500">Physics Tutor</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-700 mb-4">
                "The platform is so intuitive and finding the right chemistry tutor for my daughter was incredibly easy."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-tutorblue-100 flex items-center justify-center mr-3">
                  <span className="font-medium text-tutorblue-600">J</span>
                </div>
                <div>
                  <h4 className="font-medium">Jennifer K.</h4>
                  <p className="text-sm text-gray-500">Parent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
