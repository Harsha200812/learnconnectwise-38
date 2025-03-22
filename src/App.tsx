
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import BookSession from "./pages/BookSession";
import Quizzes from "./pages/Quizzes";
import QuizPage from "./pages/QuizPage";
import QuizResult from "./pages/QuizResult";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { UserProfile } from "./lib/types";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Check for user in localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('tutorapp_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner 
          position="bottom-right" 
          toastOptions={{ 
            duration: 3000,
            className: "z-50"
          }} 
        />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar user={user} setUser={setUser} />
            <main className="flex-grow pt-16">
              <Routes>
                <Route path="/" element={<Index user={user} />} />
                <Route path="/register" element={<Register setUser={setUser} />} />
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
                <Route path="/book-session" element={<BookSession user={user} />} />
                <Route path="/quizzes" element={<Quizzes user={user} />} />
                <Route path="/quiz/:quizId" element={<QuizPage user={user} />} />
                <Route path="/quiz-result/:quizId" element={<QuizResult user={user} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
