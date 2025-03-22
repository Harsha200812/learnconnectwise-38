import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/lib/types';
import { Quiz, QuizQuestion } from '@/lib/quiz-types';
import { getQuizById, calculateQuizScore, saveQuizResult } from '@/lib/quiz-service';
import { Clock, AlertCircle, ChevronLeft, ChevronRight, Check, HelpCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface QuizPageProps {
  user: UserProfile | null;
}

const QuizPage: React.FC<QuizPageProps> = ({ user }) => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure user is logged in and load quiz
  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to take quizzes');
      navigate('/login');
      return;
    }
    
    // Load quiz data
    if (quizId) {
      // Check if this is an AI-generated quiz (stored in session storage)
      if (quizId.startsWith('ai-')) {
        try {
          const aiQuizJson = sessionStorage.getItem(`quiz_${quizId}`);
          if (aiQuizJson) {
            const aiQuiz = JSON.parse(aiQuizJson);
            setQuiz(aiQuiz);
            setTimeLeft(aiQuiz.timeLimit * 60); // Convert minutes to seconds
            setQuizStartTime(Date.now());
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error loading AI quiz from session storage:", error);
        }
      }
      
      // Otherwise load from sample quizzes
      const fetchQuiz = async () => {
        try {
          const quizData = await getQuizById(quizId);
          if (quizData) {
            setQuiz(quizData);
            setTimeLeft(quizData.timeLimit * 60); // Convert minutes to seconds
            setQuizStartTime(Date.now());
          } else {
            toast.error('Quiz not found');
            navigate('/quizzes');
          }
        } catch (error) {
          console.error("Error fetching quiz:", error);
          toast.error('Failed to load quiz');
          navigate('/quizzes');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchQuiz();
    }
    
    return () => {
      // Clean up timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizId, user, navigate]);

  // Start the timer
  useEffect(() => {
    if (quiz && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up
            if (timerRef.current) clearInterval(timerRef.current);
            toast.warning("Time's up! Submitting your answers...");
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quiz, timeLeft]);

  // Handle selecting an answer
  const handleSelectAnswer = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Submit the quiz
  const handleSubmitQuiz = async () => {
    if (!quiz || !user || !user.id) return;
    
    setIsSubmitting(true);
    
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Calculate time taken
    const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);
    
    // Calculate score
    const score = calculateQuizScore(quiz, userAnswers);
    
    // Save result
    saveQuizResult(
      user.id,
      quiz.id,
      score,
      quiz.questions.length,
      timeTaken
    );
    
    toast.success('Quiz submitted successfully!');
    
    // If this is an AI-generated quiz, save it to session storage
    if (quiz.id.startsWith('ai-')) {
      try {
        sessionStorage.setItem(`quiz_${quiz.id}`, JSON.stringify(quiz));
      } catch (error) {
        console.error("Error saving AI quiz to session storage:", error);
      }
    }
    
    // Navigate to result page
    navigate(`/quiz-result/${quiz.id}`);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const calculateProgress = (): number => {
    if (!quiz) return 0;
    return Math.round(
      (Object.keys(userAnswers).length / quiz.questions.length) * 100
    );
  };

  // Check if current question is answered
  const isCurrentQuestionAnswered = (): boolean => {
    if (!quiz) return false;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    return !!userAnswers[currentQuestion.id];
  };

  // Check if quiz is AI-generated
  const isAIGenerated = (): boolean => {
    return quiz?.id.startsWith('ai-') || false;
  };

  if (!quiz) {
    return (
      <div className="page-container max-w-3xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-pulse text-tutorblue-500">Loading quiz...</div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="page-container max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          {isAIGenerated() && (
            <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Generated
            </Badge>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-2">
          <p className="text-gray-600">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </p>
          <div className="flex items-center text-amber-600 font-medium">
            <Clock className="mr-1 h-4 w-4" />
            Time remaining: {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{calculateProgress()}%</span>
        </div>
        <Progress value={calculateProgress()} className="h-2" />
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-medium text-gray-800">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={userAnswers[currentQuestion.id] || ''}
            onValueChange={(value) => handleSelectAnswer(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                <RadioGroupItem 
                  value={option} 
                  id={`option-${index}`} 
                  className="text-tutorblue-500"
                />
                <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button
              className="bg-tutorblue-500 hover:bg-tutorblue-600"
              onClick={handleNextQuestion}
              disabled={!isCurrentQuestionAnswered()}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSubmitQuiz}
              disabled={isSubmitting || Object.keys(userAnswers).length !== quiz.questions.length}
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  Submit Quiz
                  <Check className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Hint for incomplete questions */}
      {currentQuestionIndex === quiz.questions.length - 1 && 
       Object.keys(userAnswers).length !== quiz.questions.length && (
        <Alert className="mt-6 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            You still have {quiz.questions.length - Object.keys(userAnswers).length} unanswered question(s). 
            Use the Previous button to go back and complete all questions before submitting.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default QuizPage;
