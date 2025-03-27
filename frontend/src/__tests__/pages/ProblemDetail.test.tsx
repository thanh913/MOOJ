import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProblemDetail from '../../pages/ProblemDetail';
import * as apiService from '../../services/api';

// Mock the API service
jest.mock('../../services/api');
// Mock React Router's useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn()
}));

const mockProblem = {
  id: 1,
  title: 'Test Problem',
  statement: '# Test Problem Statement\n\nSolve the equation: $x^2 + 2x + 1 = 0$',
  difficulty: 3,
  topics: ['algebra', 'equations']
};

describe('ProblemDetail Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
  });

  it('should render loading state initially', () => {
    // Mock the API to not resolve immediately
    jest.spyOn(apiService, 'getProblem').mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <ProblemDetail />
      </BrowserRouter>
    );

    // Check for loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render problem details', async () => {
    // Mock successful API response
    jest.spyOn(apiService, 'getProblem').mockResolvedValue(mockProblem);

    render(
      <BrowserRouter>
        <ProblemDetail />
      </BrowserRouter>
    );

    // Wait for problem to be loaded
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check if problem details are displayed
    expect(screen.getByText('Test Problem')).toBeInTheDocument();
    expect(screen.getByText('Difficulty: 3/9')).toBeInTheDocument();
    expect(screen.getByText('algebra')).toBeInTheDocument();
    expect(screen.getByText('equations')).toBeInTheDocument();
    
    // Problem statement should be displayed (via ReactMarkdown)
    expect(screen.getByText('Submit Your Solution')).toBeInTheDocument();
  });

  it('should handle direct input submission', async () => {
    // Mock successful API responses
    jest.spyOn(apiService, 'getProblem').mockResolvedValue(mockProblem);
    jest.spyOn(apiService, 'createSubmission').mockResolvedValue({ id: 5 });
    
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    render(
      <BrowserRouter>
        <ProblemDetail />
      </BrowserRouter>
    );

    // Wait for problem to be loaded
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Enter solution text
    const solutionInput = screen.getByLabelText('Solution (LaTeX)');
    fireEvent.change(solutionInput, { target: { value: 'x = -1' } });

    // Submit solution
    const submitButton = screen.getByText('Submit Solution');
    fireEvent.click(submitButton);

    // Check if submission was created correctly
    await waitFor(() => {
      expect(apiService.createSubmission).toHaveBeenCalledWith({
        problem_id: 1,
        content_type: 'direct_input',
        content: 'x = -1'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/submissions/5');
    });
  });

  it('should handle validation for empty submission', async () => {
    // Mock successful API response
    jest.spyOn(apiService, 'getProblem').mockResolvedValue(mockProblem);

    render(
      <BrowserRouter>
        <ProblemDetail />
      </BrowserRouter>
    );

    // Wait for problem to be loaded
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Submit empty solution
    const submitButton = screen.getByText('Submit Solution');
    fireEvent.click(submitButton);

    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('Solution content is required')).toBeInTheDocument();
    });
  });

  it('should handle API error', async () => {
    // Mock API error
    jest.spyOn(apiService, 'getProblem').mockRejectedValue(new Error('Failed to fetch'));

    render(
      <BrowserRouter>
        <ProblemDetail />
      </BrowserRouter>
    );

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('Failed to load problem. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should switch between direct input and image upload', async () => {
    // Mock successful API response
    jest.spyOn(apiService, 'getProblem').mockResolvedValue(mockProblem);

    render(
      <BrowserRouter>
        <ProblemDetail />
      </BrowserRouter>
    );

    // Wait for problem to be loaded
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check if direct input is initially selected
    expect(screen.getByLabelText('Solution (LaTeX)')).toBeInTheDocument();

    // Switch to image upload
    fireEvent.mouseDown(screen.getByLabelText('Submission Type'));
    fireEvent.click(screen.getByText('Image Upload'));

    // Check if image upload UI is now displayed
    await waitFor(() => {
      expect(screen.getByText('Select Image')).toBeInTheDocument();
      expect(screen.queryByLabelText('Solution (LaTeX)')).not.toBeInTheDocument();
    });

    // Switch back to direct input
    fireEvent.mouseDown(screen.getByLabelText('Submission Type'));
    fireEvent.click(screen.getByText('Direct Input (LaTeX)'));

    // Check if direct input UI is displayed again
    await waitFor(() => {
      expect(screen.getByLabelText('Solution (LaTeX)')).toBeInTheDocument();
      expect(screen.queryByText('Select Image')).not.toBeInTheDocument();
    });
  });
}); 