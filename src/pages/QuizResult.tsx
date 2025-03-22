
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/lib/types';
import { Quiz, QuizResult } from '@/lib/quiz-types';
import { getQuizById, getUserQuizResults, claimBlockchainReward, isEligibleForReward } from '@/lib/quiz-service';
import { Award, CheckCircle, XCircle, Clock, BarChart3, AlertCircle, Coins, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface QuizResultPageProps {
  user: UserProfile | null;
}

const QuizResultPage: React.FC<QuizResultPageProps> = ({ user }) => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  
  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to view results');
      navigate('/login');
      return;
    }
    
    if (!quizId) {
      navigate('/quizzes');
      return;
    }
    
    const fetchData = async () => {
      try {
        // Load quiz data
        const quizData = await getQuizById(quizId);
        if (!quizData) {
          toast.error('Quiz not found');
          navigate('/quizzes');
          return;
        }
        setQuiz(quizData);
        
        // Load user's result for this quiz
        if (user.id) {
          const userResults = await getUserQuizResults(user.id);
          const quizResult = userResults.find(r => r.quizId === quizId);
          
          if (quizResult) {
            setResult(quizResult);
          } else {
            toast.error("You haven't completed this quiz yet");
            navigate('/quizzes');
          }
        }
      } catch (error) {
        console.error("Error fetching quiz or results:", error);
        toast.error("Failed to load quiz results");
        navigate('/quizzes');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [quizId, user, navigate]);

  // Format time (seconds) to minutes and seconds
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };

  // Handle claiming blockchain reward
  const handleClaimReward = async () => {
    if (!result) return;
    
    setIsClaimingReward(true);
    
    try {
      const success = await claimBlockchainReward(result.id);
      
      if (success) {
        // Update the local state
        setResult(prev => prev ? { ...prev, rewardClaimed: true } : null);
      }
    } finally {
      setIsClaimingReward(false);
    }
  };

  // Determine performance level based on score
  const getPerformanceLevel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };

  if (isLoading) {
    return (
      <div className="page-container max-w-3xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-pulse text-tutorblue-500">Loading results...</div>
        </div>
      </div>
    );
  }

  if (!quiz || !result) {
    return (
      <div className="page-container max-w-3xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load quiz results. Please try again.
          </AlertDescription>
        </Alert>
        <Button 
          className="mt-4"
          onClick={() => navigate('/quizzes')}
        >
          Back to Quizzes
        </Button>
      </div>
    );
  }

  const isEligible = isEligibleForReward(result.score);

  return (
    <div className="page-container max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
        <p className="text-gray-600 mt-1">{quiz.title}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Score Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Your Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-tutorblue-50 mb-4">
                <span className="text-4xl font-bold text-tutorblue-600">{result.score}%</span>
              </div>
              
              <Badge className={`mb-2 ${
                result.score >= 90 ? 'bg-green-500' : 
                result.score >= 70 ? 'bg-tutorblue-500' : 
                result.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}>
                {getPerformanceLevel(result.score)}
              </Badge>
              
              <p className="text-gray-600 text-center">
                You answered {Math.round((result.score / 100) * result.totalQuestions)} 
                out of {result.totalQuestions} questions correctly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Quiz Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Questions</p>
              <p className="font-medium">{result.totalQuestions}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Time Taken</p>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-1" />
                <p className="font-medium">{formatTime(result.timeTaken)}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Completed On</p>
              <p className="font-medium">
                {new Date(result.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reward Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Award className="mr-2 h-5 w-5 text-amber-500" />
            Blockchain Reward
          </CardTitle>
          <CardDescription>
            Complete quizzes with 70% or higher score to earn blockchain rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEligible ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Congratulations!</AlertTitle>
              <AlertDescription className="text-green-700">
                You've earned a blockchain reward for your excellent performance.
                {!result.rewardClaimed && " Claim your reward now!"}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Not eligible</AlertTitle>
              <AlertDescription className="text-amber-700">
                A score of 70% or higher is required to earn a blockchain reward. Try again!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          {isEligible && !result.rewardClaimed ? (
            <Button 
              onClick={handleClaimReward} 
              className="w-full bg-amber-500 hover:bg-amber-600"
              disabled={isClaimingReward}
            >
              {isClaimingReward ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  Claim Blockchain Reward
                </>
              )}
            </Button>
          ) : isEligible && result.rewardClaimed ? (
            <div className="w-full text-center text-green-600 font-medium py-2 border border-green-200 rounded-md bg-green-50">
              <CheckCircle className="inline-block mr-2 h-4 w-4" />
              Reward Claimed
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate(`/quiz/${quizId}`)}
              className="w-full"
            >
              Retry Quiz
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/quizzes')}
        >
          Back to Quizzes
        </Button>
      </div>
    </div>
  );
};

export default QuizResultPage;
