
import { SAMPLE_QUIZZES, Quiz, QuizResult, QuizQuestion } from "./quiz-types";
import { SUBJECTS, UserProfile } from "./types";
import { supabase } from "./supabase";
import { toast } from "sonner";

// Get quizzes based on user interests (subjects)
export const getQuizzesForUser = async (user: UserProfile | null): Promise<Quiz[]> => {
  if (!user || !user.subjects || user.subjects.length === 0) return SAMPLE_QUIZZES;
  
  try {
    // First, check if we have quizzes in Supabase
    const { data: supabaseQuizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .in('subject', user.subjects);
    
    if (error) throw error;
    
    // If we have quizzes in Supabase that match user interests, return those
    if (supabaseQuizzes && supabaseQuizzes.length > 0) {
      // Parse the questions JSON field
      return supabaseQuizzes.map(quiz => ({
        ...quiz,
        questions: typeof quiz.questions === 'string' 
          ? JSON.parse(quiz.questions) 
          : quiz.questions
      }));
    }
    
    // If no quizzes found in Supabase, fall back to sample quizzes
    const userSubjects = user.subjects || [];
    const filteredQuizzes = SAMPLE_QUIZZES.filter(quiz => 
      userSubjects.includes(quiz.subject)
    );
    
    // If no matches found in sample quizzes, return a subset of all sample quizzes
    return filteredQuizzes.length > 0 ? filteredQuizzes : SAMPLE_QUIZZES.slice(0, 3);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    // Fall back to sample quizzes in case of error
    return SAMPLE_QUIZZES;
  }
};

// Generate AI questions for a subject using Supabase Edge Functions
export const generateAIQuestions = async (subject: string, count: number = 5): Promise<QuizQuestion[]> => {
  try {
    console.log(`Generating ${count} AI questions for ${subject}...`);
    
    // Call the Supabase Edge Function to generate questions
    const { data, error } = await supabase.functions.invoke('generate-quiz-questions', {
      body: { subject, count }
    });
    
    if (error) throw error;
    
    console.log(`Generated ${data.questions.length} AI questions for ${subject}`);
    return data.questions;
  } catch (error) {
    console.error("Error generating AI questions:", error);
    toast.error("Failed to generate AI questions");
    
    // Fall back to the template-based questions
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
        explanation: `This is a fallback explanation for the ${subject} question.`
      });
    }
    
    return questions;
  }
};

// Create a new quiz with AI-generated questions and save it to Supabase
export const createAIQuiz = async (subject: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<Quiz> => {
  try {
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
    
    // Save the quiz to Supabase
    const { error } = await supabase
      .from('quizzes')
      .insert({
        id: newQuiz.id,
        title: newQuiz.title,
        subject: newQuiz.subject,
        questions: JSON.stringify(newQuiz.questions),
        difficulty: newQuiz.difficulty,
        timeLimit: newQuiz.timeLimit,
        created_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    return newQuiz;
  } catch (error) {
    console.error("Error creating AI quiz:", error);
    toast.error("Failed to create AI quiz");
    throw error;
  }
};

// Get a specific quiz by ID from Supabase or fallback to sample quizzes
export const getQuizById = async (quizId: string): Promise<Quiz | undefined> => {
  try {
    // Try to get the quiz from Supabase first
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();
    
    if (error) {
      // If not found in Supabase, check sample quizzes
      const sampleQuiz = SAMPLE_QUIZZES.find(quiz => quiz.id === quizId);
      if (sampleQuiz) return sampleQuiz;
      throw error;
    }
    
    // Parse the questions JSON
    return {
      ...data,
      questions: typeof data.questions === 'string' 
        ? JSON.parse(data.questions) 
        : data.questions
    };
  } catch (error) {
    console.error("Error fetching quiz:", error);
    // Fallback to sample quizzes
    return SAMPLE_QUIZZES.find(quiz => quiz.id === quizId);
  }
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

// Save quiz result to Supabase
export const saveQuizResult = async (
  userId: string,
  quizId: string,
  score: number,
  totalQuestions: number,
  timeTaken: number
): Promise<QuizResult> => {
  try {
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
    
    // Save to Supabase
    const { error } = await supabase
      .from('quiz_results')
      .insert({
        id: result.id,
        user_id: result.userId,
        quiz_id: result.quizId,
        score: result.score,
        total_questions: result.totalQuestions,
        time_taken: result.timeTaken,
        completed: result.completed,
        reward_claimed: result.rewardClaimed,
        created_at: result.createdAt
      });
    
    if (error) throw error;
    
    return result;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    toast.error("Failed to save quiz result");
    
    // Fallback to localStorage if Supabase fails
    const existingResultsJson = localStorage.getItem('quiz_results');
    const existingResults: QuizResult[] = existingResultsJson 
      ? JSON.parse(existingResultsJson) 
      : [];
    
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
    
    // Add new result to localStorage
    const updatedResults = [...existingResults, result];
    localStorage.setItem('quiz_results', JSON.stringify(updatedResults));
    
    return result;
  }
};

// Get all quiz results for a user from Supabase
export const getUserQuizResults = async (userId: string): Promise<QuizResult[]> => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Map to our QuizResult type
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      quizId: item.quiz_id,
      score: item.score,
      totalQuestions: item.total_questions,
      timeTaken: item.time_taken,
      completed: item.completed,
      rewardClaimed: item.reward_claimed,
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    
    // Fallback to localStorage
    const resultsJson = localStorage.getItem('quiz_results');
    if (!resultsJson) return [];
    
    const allResults: QuizResult[] = JSON.parse(resultsJson);
    return allResults.filter(result => result.userId === userId);
  }
};

// Claim blockchain reward using Supabase Edge Function
export const claimBlockchainReward = async (resultId: string): Promise<boolean> => {
  try {
    // Call the Supabase Edge Function to claim reward
    const { data, error } = await supabase.functions.invoke('claim-blockchain-reward', {
      body: { resultId }
    });
    
    if (error) throw error;
    
    if (data.success) {
      // Update local record
      const { error: updateError } = await supabase
        .from('quiz_results')
        .update({ reward_claimed: true })
        .eq('id', resultId);
      
      if (updateError) throw updateError;
      
      toast.success("Blockchain reward claimed successfully!");
      return true;
    } else {
      throw new Error(data.message || "Failed to claim reward");
    }
  } catch (error) {
    console.error("Error claiming reward:", error);
    toast.error("Failed to claim reward. Please try again.");
    
    // Fallback to localStorage update if Supabase fails
    try {
      const resultsJson = localStorage.getItem('quiz_results');
      if (!resultsJson) return false;
      
      const allResults: QuizResult[] = JSON.parse(resultsJson);
      const updatedResults = allResults.map(result => 
        result.id === resultId 
          ? { ...result, rewardClaimed: true } 
          : result
      );
      
      localStorage.setItem('quiz_results', JSON.stringify(updatedResults));
      return true;
    } catch (e) {
      console.error("Error updating localStorage:", e);
      return false;
    }
  }
};

// Check if user is eligible for reward (score >= 70%)
export const isEligibleForReward = (score: number): boolean => {
  return score >= 70;
};
