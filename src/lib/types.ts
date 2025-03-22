
export type UserRole = 'tutor' | 'learner';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  subjects: string[];
  availability: string[];
  bio?: string;
  hourlyRate?: number;
  created_at?: string;
}

export interface Session {
  id: string;
  tutorId: string;
  learnerId: string;
  subject: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  created_at: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  role?: UserRole;
  subjects?: string[];
  availability?: string[];
}

export interface BookingFormData {
  subject: string;
  availability: string;
}

export const SUBJECTS = [
  'Mathematics', 
  'Physics', 
  'Chemistry', 
  'Biology', 
  'Computer Science', 
  'English', 
  'History', 
  'Geography',
  'Economics',
  'Business Studies',
  'Psychology',
  'Philosophy',
  'Art',
  'Music',
  'Physical Education'
];

export const TIME_SLOTS = [
  'Monday 9:00 AM',
  'Monday 10:00 AM',
  'Monday 11:00 AM',
  'Monday 2:00 PM',
  'Monday 3:00 PM',
  'Monday 4:00 PM',
  'Tuesday 9:00 AM',
  'Tuesday 10:00 AM',
  'Tuesday 11:00 AM',
  'Tuesday 2:00 PM',
  'Tuesday 3:00 PM',
  'Tuesday 4:00 PM',
  'Wednesday 9:00 AM',
  'Wednesday 10:00 AM',
  'Wednesday 11:00 AM',
  'Wednesday 2:00 PM',
  'Wednesday 3:00 PM',
  'Wednesday 4:00 PM',
  'Thursday 9:00 AM',
  'Thursday 10:00 AM',
  'Thursday 11:00 AM',
  'Thursday 2:00 PM',
  'Thursday 3:00 PM',
  'Thursday 4:00 PM',
  'Friday 9:00 AM',
  'Friday 10:00 AM',
  'Friday 11:00 AM',
  'Friday 2:00 PM',
  'Friday 3:00 PM',
  'Friday 4:00 PM',
];

// Sample user data for demo purposes
export const SAMPLE_TUTORS: UserProfile[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    role: 'tutor',
    subjects: ['Mathematics', 'Physics'],
    availability: ['Monday 10:00 AM', 'Tuesday 2:00 PM', 'Friday 3:00 PM'],
    bio: 'Mathematics and Physics tutor with 5+ years of experience. PhD in Applied Mathematics.',
    hourlyRate: 40,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    role: 'tutor',
    subjects: ['Chemistry', 'Biology'],
    availability: ['Monday 9:00 AM', 'Wednesday 2:00 PM', 'Thursday 11:00 AM'],
    bio: 'Chemistry specialist with a focus on organic chemistry. I make complex concepts simple.',
    hourlyRate: 35,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    email: 'michael.johnson@example.com',
    role: 'tutor',
    subjects: ['Computer Science', 'Mathematics'],
    availability: ['Tuesday 3:00 PM', 'Wednesday 4:00 PM', 'Friday 10:00 AM'],
    bio: 'Software engineer teaching programming and mathematics. I focus on practical applications.',
    hourlyRate: 45,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    email: 'emily.wilson@example.com',
    role: 'tutor',
    subjects: ['English', 'History'],
    availability: ['Monday 11:00 AM', 'Thursday 2:00 PM', 'Friday 4:00 PM'],
    bio: 'Literature and history expert. I help students develop critical thinking and writing skills.',
    hourlyRate: 30,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    email: 'david.lee@example.com',
    role: 'tutor',
    subjects: ['Economics', 'Business Studies'],
    availability: ['Tuesday 10:00 AM', 'Wednesday 9:00 AM', 'Thursday 3:00 PM'],
    bio: 'Economics professor with real-world business experience. I make economics practical and understandable.',
    hourlyRate: 50,
    created_at: new Date().toISOString()
  }
];
