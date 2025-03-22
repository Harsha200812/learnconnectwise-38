
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/lib/types';
import { Quiz, QuizResult } from '@/lib/quiz-types';
import { getQuizzesForUser, getUserQuizResults } from '@/lib/quiz-service';
import { BookOpen, Award, Clock, Trophy, AlertCircle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface QuizzesProps {
  user: UserProfile | null;
}

const Quizzes: React.FC<QuizzesProps> = ({ user }) => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [userResults, setUserResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to access quizzes');
      navigate('/login');
      return;
    }

    // Load quizzes based on user interests
    const availableQuizzes = getQuizzesForUser(user);
    setQuizzes(availableQuizzes);
    
    // Load user's quiz results
    if (user.id) {
      const results = getUserQuizResults(user.id);
      setUserResults(results);
    }
    
    setLoading(false);
  }, [user, navigate]);

  // Get the user's result for a specific quiz
  const getQuizResult = (quizId: string): QuizResult | undefined => {
    return userResults.find(result => result.quizId === quizId);
  };

  // Start a quiz
  const handleStartQuiz = (quizId: string) => {
    navigate(`/quiz/${quizId}`);
  };

  // Continue to results page for a completed quiz
  const handleViewResults = (quizId: string) => {
    navigate(`/quiz-result/${quizId}`);
  };

  // Check if user has completed a quiz
  const hasCompletedQuiz = (quizId: string): boolean => {
    return userResults.some(result => result.quizId === quizId && result.completed);
  };

  if (loading) {
    return (
      <div className="page-container max-w-5xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-pulse text-tutorblue-500">Loading quizzes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Quizzes</h1>
          <p className="text-gray-600 mt-2">Challenge yourself and earn rewards</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Badge variant="outline" className="bg-tutorblue-50 text-tutorblue-600 border-tutorblue-200 px-3 py-1">
            <Trophy className="w-4 h-4 mr-1" />
            {userResults.filter(r => r.completed).length} Completed
          </Badge>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <Alert className="bg-amber-50 border-amber-200 mb-6">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">No quizzes available</AlertTitle>
          <AlertDescription className="text-amber-700">
            We couldn't find any quizzes matching your interests. Please update your profile with subjects you're interested in.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const result = getQuizResult(quiz.id);
            const completed = !!result?.completed;
            
            return (
              <Card key={quiz.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="mb-2 bg-tutorblue-50 text-tutorblue-600 border-tutorblue-200">
                      {quiz.subject}
                    </Badge>
                    <Badge variant={quiz.difficulty === 'easy' ? 'outline' : quiz.difficulty === 'medium' ? 'secondary' : 'default'}>
                      {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{quiz.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    {quiz.questions.length} questions
                    <span className="mx-1">•</span>
                    <Clock className="h-4 w-4 text-gray-500" />
                    {quiz.timeLimit} min
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-6">
                  {completed && result ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-600">Your score</span>
                        <span className="font-medium">{result.score}%</span>
                      </div>
                      <Progress value={result.score} className="h-2" />
                      
                      {result.score >= 70 && (
                        <div className="flex items-center mt-3 text-green-600 text-sm">
                          <Award className="h-4 w-4 mr-1" />
                          {result.rewardClaimed ? 'Reward claimed' : 'Eligible for reward!'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">
                      Complete this quiz to test your knowledge and potentially earn blockchain rewards.
                    </p>
                  )}
                </CardContent>
                
                <CardFooter className="pt-0">
                  {completed ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => handleViewResults(quiz.id)}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Results
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-tutorblue-500 hover:bg-tutorblue-600" 
                      onClick={() => handleStartQuiz(quiz.id)}
                    >
                      Start Quiz
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Quizzes;
