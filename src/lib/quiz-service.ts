
import { SAMPLE_QUIZZES, Quiz, QuizResult, QuizQuestion } from "./quiz-types";
import { SUBJECTS, UserProfile } from "./types";
import { toast } from "sonner";

// Get quizzes based on user interests (subjects)
export const getQuizzesForUser = (user: UserProfile | null): Quiz[] => {
  if (!user || !user.subjects || user.subjects.length === 0) return SAMPLE_QUIZZES;
  
  // Filter quizzes that match user's subjects of interest
  const userSubjects = user.subjects || [];
  const filteredQuizzes = SAMPLE_QUIZZES.filter(quiz => 
    userSubjects.includes(quiz.subject)
  );
  
  // If no matches found, return a subset of all quizzes
  return filteredQuizzes.length > 0 ? filteredQuizzes : SAMPLE_QUIZZES.slice(0, 3);
};

// Generate AI questions for a subject
export const generateAIQuestions = async (subject: string, count: number = 5): Promise<QuizQuestion[]> => {
  try {
    console.log(`Generating ${count} AI questions for ${subject}...`);
    
    // In a real implementation, this would call an AI API
    // For now, we'll simulate with a delay and return template-based questions
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const questions: QuizQuestion[] = [];
    const templates = [
      { q: `What is the main principle of ${subject}?`, 
        a: [`The scientific method`, `Empirical observation`, `Theoretical modeling`, `Historical analysis`] },
      { q: `Who is considered the founder of modern ${subject}?`, 
        a: [`Albert Einstein`, `Isaac Newton`, `Marie Curie`, `Charles Darwin`] },
      { q: `Which of these is NOT related to ${subject}?`, 
        a: [`Quantum theory`, `Cellular division`, `Polynomial equations`, `Renaissance art`] },
      { q: `In ${subject}, what does the term "paradigm shift" refer to?`, 
        a: [`A fundamental change in approach`, `A mathematical formula`, `A laboratory technique`, `A historical period`] },
      { q: `Which field is most closely related to ${subject}?`, 
        a: [`Statistics`, `Philosophy`, `Engineering`, `Literature`] },
      { q: `What recent breakthrough has revolutionized ${subject}?`, 
        a: [`AI integration`, `Quantum computing`, `Nanotechnology`, `Genome sequencing`] },
      { q: `Which tool is essential for research in ${subject}?`, 
        a: [`Data analysis software`, `Laboratory equipment`, `Historical records`, `Field observations`] }
    ];
    
    // Use different templates to generate questions
    for (let i = 0; i < Math.min(count, templates.length); i++) {
      const template = templates[i];
      const correctIndex = Math.floor(Math.random() * template.a.length);
      
      questions.push({
        id: `ai-${subject}-${i}`,
        question: template.q,
        options: template.a,
        correctAnswer: template.a[correctIndex],
        explanation: `This is an AI-generated explanation for the ${subject} question.`
      });
    }
    
    console.log(`Generated ${questions.length} AI questions for ${subject}`);
    return questions;
  } catch (error) {
    console.error("Error generating AI questions:", error);
    toast.error("Failed to generate AI questions");
    return [];
  }
};

// Create a new quiz with AI-generated questions
export const createAIQuiz = async (subject: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<Quiz> => {
  // Generate questions using AI
  const questions = await generateAIQuestions(subject, 5);
  
  // Create a new quiz
  const newQuiz: Quiz = {
    id: `ai-${subject}-${Date.now()}`,
    title: `AI-Generated ${subject} Quiz`,
    subject: subject,
    questions: questions,
    difficulty: difficulty,
    timeLimit: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20
  };
  
  return newQuiz;
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
