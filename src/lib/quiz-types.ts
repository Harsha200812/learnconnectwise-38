
import { UserProfile } from "./types";

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
};

export type Quiz = {
  id: string;
  title: string;
  subject: string;
  questions: QuizQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in minutes
};

export type QuizResult = {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  timeTaken: number; // in seconds
  completed: boolean;
  rewardClaimed: boolean;
  createdAt: string;
};

// Sample quiz data
export const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: '1',
    title: 'Basic Mathematics',
    subject: 'Mathematics',
    difficulty: 'easy',
    timeLimit: 10,
    questions: [
      {
        id: '1',
        question: 'What is 2 + 3?',
        options: ['4', '5', '6', '7'],
        correctAnswer: '5',
        explanation: 'The sum of 2 and 3 is 5'
      },
      {
        id: '2',
        question: 'What is 9 - 4?',
        options: ['3', '4', '5', '6'],
        correctAnswer: '5',
        explanation: 'The difference between 9 and 4 is 5'
      },
      {
        id: '3',
        question: 'What is 3 × 4?',
        options: ['7', '10', '12', '15'],
        correctAnswer: '12',
        explanation: 'The product of 3 and 4 is 12'
      },
      {
        id: '4',
        question: 'What is 10 ÷ 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: '5',
        explanation: 'The quotient of 10 divided by 2 is 5'
      },
      {
        id: '5',
        question: 'What is 3² (3 squared)?',
        options: ['6', '8', '9', '12'],
        correctAnswer: '9',
        explanation: '3² = 3 × 3 = 9'
      }
    ]
  },
  {
    id: '2',
    title: 'Introduction to Physics',
    subject: 'Physics',
    difficulty: 'medium',
    timeLimit: 15,
    questions: [
      {
        id: '1',
        question: 'What is the unit of force?',
        options: ['Watt', 'Joule', 'Newton', 'Volt'],
        correctAnswer: 'Newton',
        explanation: 'The SI unit of force is the Newton (N)'
      },
      {
        id: '2',
        question: 'Which law states that energy cannot be created or destroyed?',
        options: [
          'Law of Inertia', 
          'Law of Conservation of Energy', 
          'Law of Action-Reaction', 
          'Law of Acceleration'
        ],
        correctAnswer: 'Law of Conservation of Energy',
        explanation: 'The Law of Conservation of Energy states that energy cannot be created or destroyed, only transformed from one form to another'
      },
      {
        id: '3',
        question: 'What is the acceleration due to gravity on Earth?',
        options: ['5.6 m/s²', '7.8 m/s²', '9.8 m/s²', '11.2 m/s²'],
        correctAnswer: '9.8 m/s²',
        explanation: 'The acceleration due to gravity on Earth is approximately 9.8 m/s²'
      }
    ]
  },
  {
    id: '3',
    title: 'Computer Science Basics',
    subject: 'Computer Science',
    difficulty: 'easy',
    timeLimit: 12,
    questions: [
      {
        id: '1',
        question: 'What does CPU stand for?',
        options: [
          'Central Processing Unit', 
          'Computer Processing Unit', 
          'Central Program Unit', 
          'Core Processing Unit'
        ],
        correctAnswer: 'Central Processing Unit',
        explanation: 'CPU stands for Central Processing Unit, which is the primary component of a computer that processes instructions'
      },
      {
        id: '2',
        question: 'Which of these is NOT a programming language?',
        options: ['Java', 'Python', 'HTML', 'Photoshop'],
        correctAnswer: 'Photoshop',
        explanation: 'Photoshop is image editing software, not a programming language'
      },
      {
        id: '3',
        question: 'What does RAM stand for?',
        options: [
          'Random Access Memory', 
          'Read Access Memory', 
          'Random Allocation Memory', 
          'Readily Available Memory'
        ],
        correctAnswer: 'Random Access Memory',
        explanation: 'RAM stands for Random Access Memory, which is a type of computer memory that can be accessed randomly'
      }
    ]
  }
];

