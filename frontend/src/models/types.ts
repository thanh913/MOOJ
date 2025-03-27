// Define shared interfaces for the application to avoid circular dependencies

// Problem model
export interface Problem {
  id: number;
  title: string;
  statement: string;
  difficulty: number;
  topics: string[];
  created_at: string;
  created_by: number;
  is_published: boolean;
}

// User model
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

// Submission data for creating a submission
export interface SubmissionData {
  problem_id: number;
  content_type: 'direct' | 'image';
  content: string;
}

// Submission model with complete information
export interface Submission {
  id: number;
  problem_id: number;
  user_id: number;
  content_type: 'direct' | 'image';
  content: string;
  latex_content?: string;
  score?: number;
  feedback?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  submitted_at: string;
} 