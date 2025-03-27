import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubmissionDetail from '../../pages/SubmissionDetail';
import * as apiService from '../../services/api';

// Mock the API service
jest.mock('../../services/api');
// Mock React Router's useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '5' }),
  useNavigate: () => jest.fn()
}));

const mockPendingSubmission = {
  id: 5,
  problem_id: 1,
  content_type: 'direct_input',
  content: 'x = -1',
  status: 'pending',
  submitted_at: '2023-01-01T12:00:00Z'
};

const mockProcessingSubmission = {
  ...mockPendingSubmission,
  status: 'processing'
};

const mockCompletedSubmission = {
  ...mockPendingSubmission,
  status: 'completed',
  latex_content: 'x = -1',
  score: 85,
  feedback: '# Feedback\n\nYour solution is correct!'
};

const mockErrorSubmission = {
  ...mockPendingSubmission,
  status: 'error',
  feedback: 'Error processing submission'
};

describe('SubmissionDetail Component', () => {
  beforeEach(() => {
    // Reset mocks and timers before each test
    jest.resetAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render loading state initially', () => {
    // Mock the API to not resolve immediately
    jest.spyOn(apiService, 'getSubmission').mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <SubmissionDetail />
      </BrowserRouter>
    );

    // Check for loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render pending submission with polling', async () => {
    // Setup mock responses for multiple calls
    const getSubmissionMock = jest.spyOn(apiService, 'getSubmission')
      .mockResolvedValueOnce(mockPendingSubmission)
      .mockResolvedValueOnce(mockProcessingSubmission)
      .mockResolvedValueOnce(mockCompletedSubmission);

    render(
      <BrowserRouter>
        <SubmissionDetail />
      </BrowserRouter>
    );

    // Wait for initial submission to be loaded
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('Status: Pending')).toBeInTheDocument();
    });

    // Fast-forward polling interval
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    // Check if status updated to "Processing"
    await waitFor(() => {
      expect(screen.getByText('Status: Processing')).toBeInTheDocument();
    });

    // Fast-forward polling interval again
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    // Check if status updated to "Completed" and results are displayed
    await waitFor(() => {
      expect(screen.getByText('Status: Completed')).toBeInTheDocument();
      expect(screen.getByText('Score: 85%')).toBeInTheDocument();
    });

    // Verify the polling behavior
    expect(getSubmissionMock).toHaveBeenCalledTimes(3);
  });

  it('should render completed submission', async () => {
    // Mock successful API response with completed submission
    jest.spyOn(apiService, 'getSubmission').mockResolvedValue(mockCompletedSubmission);

    render(
      <BrowserRouter>
        <SubmissionDetail />
      </BrowserRouter>
    );

    // Wait for submission to be loaded
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('Status: Completed')).toBeInTheDocument();
    });

    // Check if submission details are displayed
    expect(screen.getByText('Your Solution')).toBeInTheDocument();
    expect(screen.getByText('x = -1')).toBeInTheDocument();
    expect(screen.getByText('Score: 85%')).toBeInTheDocument();
    expect(screen.getByText('Feedback:')).toBeInTheDocument();
    
    // The submission should have feedback (displayed via ReactMarkdown)
    expect(screen.getByText('Your solution is correct!')).toBeInTheDocument();
  });

  it('should render error submission', async () => {
    // Mock API response with error submission
    jest.spyOn(apiService, 'getSubmission').mockResolvedValue(mockErrorSubmission);

    render(
      <BrowserRouter>
        <SubmissionDetail />
      </BrowserRouter>
    );

    // Wait for submission to be loaded
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('Status: Error')).toBeInTheDocument();
    });

    // Check if error message is displayed
    expect(screen.getByText('Error processing submission')).toBeInTheDocument();
  });

  it('should handle API error', async () => {
    // Mock API error
    jest.spyOn(apiService, 'getSubmission').mockRejectedValue(new Error('Failed to fetch'));

    render(
      <BrowserRouter>
        <SubmissionDetail />
      </BrowserRouter>
    );

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('Failed to load submission details. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should navigate back to problem page', async () => {
    // Mock successful API response
    jest.spyOn(apiService, 'getSubmission').mockResolvedValue(mockCompletedSubmission);
    
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    render(
      <BrowserRouter>
        <SubmissionDetail />
      </BrowserRouter>
    );

    // Wait for submission to be loaded
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Click back to problem button
    const backButton = screen.getByText('Back to Problem');
    fireEvent.click(backButton);

    // Check if navigation to problem page happened
    expect(mockNavigate).toHaveBeenCalledWith('/problems/1');
  });
}); 