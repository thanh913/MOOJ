/**
 * @fileoverview Legacy API service functions.
 * This module contains functions for interacting with the backend API using Axios.
 * NOTE: This is largely legacy and being replaced by RTK Query hooks defined
 * in src/store/apis/*.ts. It is primarily kept for compatibility with existing tests.
 * Consider refactoring tests to mock RTK Query hooks instead.
 */
import axios from 'axios';
// Import types from the /types directory
import { Problem } from '../types/problem';
import { User } from '../types/user';
import { Submission, SubmissionCreate } from '../types/submission';

// Set base URL from environment variable or use default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
// Set Google OAuth client ID from environment variable
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
// For development, set redirect URI
const GOOGLE_REDIRECT_URI = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/oauth/callback'
  : `${window.location.origin}/oauth/callback`;

// Create axios instance with base config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// API Functions

// Problems
export const fetchProblems = async (filters = {}): Promise<Problem[]> => {
  try {
    const response = await api.get('/api/problems', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching problems:', error);
    throw error;
  }
};

export const fetchProblemById = async (id: number): Promise<Problem> => {
  try {
    const response = await api.get(`/api/problems/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching problem ${id}:`, error);
    throw error;
  }
};

// Submissions
export const createSubmission = async (data: SubmissionCreate): Promise<Submission> => {
  try {
    const response = await api.post('/api/submissions', data);
    return response.data;
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  }
};

export const fetchSubmissionById = async (id: number): Promise<Submission> => {
  try {
    const response = await api.get(`/api/submissions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching submission ${id}:`, error);
    throw error;
  }
};

export const fetchUserSubmissions = async (): Promise<Submission[]> => {
  const response = await api.get('/api/submissions');
  return response.data;
};

// Authentication
export const login = async (credentials: { email: string; password: string }): Promise<{ token: string; user: User }> => {
  const response = await api.post('/api/auth/login', credentials);
  const { access_token, token_type, user } = response.data;
  return { token: access_token, user };
};

export const register = async (userData: { username: string; email: string; password: string }): Promise<{ token: string; user: User }> => {
  const response = await api.post('/api/auth/register', userData);
  // Since register doesn't return a token, we'll log in right after registration
  const loginResponse = await login({ email: userData.email, password: userData.password });
  return loginResponse;
};

export const googleLogin = async (code: string): Promise<{ token: string; user: User }> => {
  const response = await api.post('/api/auth/google', {
    code,
    redirect_uri: GOOGLE_REDIRECT_URI
  });
  const { access_token, token_type, user } = response.data;
  return { token: access_token, user };
};

// Google OAuth helper functions
export const getGoogleOAuthUrl = (): string => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  
  const options = {
    redirect_uri: GOOGLE_REDIRECT_URI,
    client_id: GOOGLE_CLIENT_ID || '',
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ')
  };
  
  const queryString = new URLSearchParams(options);
  return `${rootUrl}?${queryString.toString()}`;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

// Re-export types for convenience
export type { Problem, User, Submission, SubmissionCreate };

export default api; 