
import { SAMPLE_QUIZZES, Quiz, QuizResult } from "./quiz-types";
import { SUBJECTS, UserProfile } from "./types";
import { toast } from "sonner";

// Get quizzes based on user interests (subjects)
export const getQuizzesForUser = (user: UserProfile | null): Quiz[] => {
  if (!user) return [];
  
  // Filter quizzes that match user's subjects of interest
  const userSubjects = user.subjects || [];
  return SAMPLE_QUIZZES.filter(quiz => 
    userSubjects.includes(quiz.subject)
  );
};

// Get a specific quiz by ID
export const getQuizById = (quizId: string): Quiz | undefined => {
  return SAMPLE_QUIZZES.find(quiz => quiz.id === quizId);
};

// Calculate score for a quiz
export const calculateQuizScore = (
  quiz: Quiz, 
  userAnswers: Record<string, string>
): number => {
  let correctAnswers = 0;
  
  quiz.questions.forEach(question => {
    if (userAnswers[question.id] === question.correctAnswer) {
      correctAnswers++;
    }
  });
  
  return Math.round((correctAnswers / quiz.questions.length) * 100);
};

// Save quiz result to localStorage
export const saveQuizResult = (
  userId: string,
  quizId: string,
  score: number,
  totalQuestions: number,
  timeTaken: number
): QuizResult => {
  const result: QuizResult = {
    id: Date.now().toString(),
    userId,
    quizId,
    score,
    totalQuestions,
    timeTaken,
    completed: true,
    rewardClaimed: false,
    createdAt: new Date().toISOString()
  };
  
  // Get existing results
  const existingResultsJson = localStorage.getItem('quiz_results');
  const existingResults: QuizResult[] = existingResultsJson 
    ? JSON.parse(existingResultsJson) 
    : [];
  
  // Add new result
  const updatedResults = [...existingResults, result];
  localStorage.setItem('quiz_results', JSON.stringify(updatedResults));
  
  return result;
};

// Get all quiz results for a user
export const getUserQuizResults = (userId: string): QuizResult[] => {
  const resultsJson = localStorage.getItem('quiz_results');
  if (!resultsJson) return [];
  
  const allResults: QuizResult[] = JSON.parse(resultsJson);
  return allResults.filter(result => result.userId === userId);
};

// Claim blockchain reward
export const claimBlockchainReward = async (resultId: string): Promise<boolean> => {
  try {
    // In a real implementation, this would interact with a blockchain
    // For now, we'll simulate success and update the local storage
    
    const resultsJson = localStorage.getItem('quiz_results');
    if (!resultsJson) return false;
    
    const allResults: QuizResult[] = JSON.parse(resultsJson);
    const updatedResults = allResults.map(result => 
      result.id === resultId 
        ? { ...result, rewardClaimed: true } 
        : result
    );
    
    localStorage.setItem('quiz_results', JSON.stringify(updatedResults));
    
    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Blockchain reward claimed successfully!");
    return true;
  } catch (error) {
    console.error("Error claiming reward:", error);
    toast.error("Failed to claim reward. Please try again.");
    return false;
  }
};

// Check if user is eligible for reward (score >= 70%)
export const isEligibleForReward = (score: number): boolean => {
  return score >= 70;
};

