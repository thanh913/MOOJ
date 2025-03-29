import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubmissionDetail from '../../pages/SubmissionDetail';
import * as apiService from '../../services/api';
import userEvent from '@testing-library/user-event';
import { act } from 'react';

// Mock the API service
jest.mock('../../services/api');
// Mock React Router's useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '5' }),
  useNavigate: () => jest.fn()
}));

const mockPendingSubmission = {
  id: 123,
  problem_id: 1,
  user_id: 1,
  content_type: 'direct_input',
  content: 'x = 1',
  latex_content: 'x = 1',
  status: 'pending' as const,
  score: null,
  feedback: null,
  submitted_at: new Date().toISOString(),
  evaluation_started_at: null,
  evaluation_completed_at: null,
};

const mockProcessingSubmission = {
  ...mockPendingSubmission,
  status: 'processing' as const,
  evaluation_started_at: new Date().toISOString(),
};

const mockCompletedSubmission = {
  ...mockProcessingSubmission,
  status: 'completed' as const,
  score: 85,
  feedback: '# Good job!\nSome minor improvements possible.',
  evaluation_completed_at: new Date().toISOString(),
};

const mockErrorSubmission = {
  ...mockProcessingSubmission,
  status: 'failed' as const,
  feedback: 'Evaluation failed due to an internal error.',
  evaluation_completed_at: new Date().toISOString(),
};

describe('SubmissionDetail Component', () => {
  beforeEach(() => {
    // Reset mocks and timers before each test
    (apiService.fetchSubmissionById as jest.Mock).mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render loading state initially', () => {
    (apiService.fetchSubmissionById as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(
      <BrowserRouter>
        <SubmissionDetail />
      </BrowserRouter>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render pending submission with polling', async () => {
    const fetchMock = (apiService.fetchSubmissionById as jest.Mock)
      .mockResolvedValueOnce(mockPendingSubmission)
      .mockResolvedValueOnce(mockProcessingSubmission)
      .mockResolvedValue(mockCompletedSubmission);

    render(
      <BrowserRouter>
        <SubmissionDetail />
      </BrowserRouter>
    );

    // Wait for initial loading to finish by checking for a stable element
    await screen.findByText(/Submission Time/i);

    // Check initial status (could be PENDING or PROCESSING due to fast polling)
    await screen.findByText(/PENDING|PROCESSING/);

    // Advance timer and wait for 'PROCESSING' within the same act scope
    await act(async () => {
      jest.advanceTimersByTime(3000);
      // Wait for the status to update to PROCESSING *inside* act
      await waitFor(() => {
        expect(screen.getByText('PROCESSING')).toBeInTheDocument(); 
      });
    });
    
    // Advance timer again and wait for 'COMPLETED' within the same act scope
    await act(async () => {
      jest.advanceTimersByTime(3000);
       // Wait for the status to update to COMPLETED *inside* act
      await waitFor(() => {
        expect(screen.getByText('COMPLETED')).toBeInTheDocument();
        expect(screen.getByText(/85.*100/)).toBeInTheDocument();
      });
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('should render completed submission', async () => {
    (apiService.fetchSubmissionById as jest.Mock).mockResolvedValue(mockCompletedSubmission);

    render(
      <BrowserRouter>
        <SubmissionDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });

    expect(screen.getByText('Your Submission')).toBeInTheDocument();
    expect(screen.getByAltText('Submitted solution')).toBeInTheDocument();
    expect(screen.getByText(/85.*100/)).toBeInTheDocument(); 
    expect(screen.getByText('Feedback')).toBeInTheDocument(); 
    
    // Find the specific feedback container and check its content
    const feedbackContainer = screen.getByText((content, element) => {
      // Check if the element is the correct div and contains the start of the feedback
      return element?.tagName.toLowerCase() === 'div' && 
             element.classList.contains('MuiTypography-root') &&
             content.startsWith('# Good job!');
    });
    expect(feedbackContainer).toBeInTheDocument();
    expect(feedbackContainer.textContent).toContain('# Good job!');
    expect(feedbackContainer.textContent).toContain('Some minor improvements possible.');
  });

  it('should render error submission', async () => {
    (apiService.fetchSubmissionById as jest.Mock).mockResolvedValue(mockErrorSubmission);
    render(
      <BrowserRouter>
        <SubmissionDetail />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    expect(screen.getByText('FAILED')).toBeInTheDocument(); 
    expect(screen.getByText('There was an error processing your submission. Please try submitting again.')).toBeInTheDocument();
  });

  it('should handle API error', async () => {
    (apiService.fetchSubmissionById as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    render(
      <BrowserRouter>
        <SubmissionDetail />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('Failed to load submission. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should render back link with correct href', async () => {
    // No need to mock navigate if just checking href
    (apiService.fetchSubmissionById as jest.Mock).mockResolvedValue(mockCompletedSubmission);
    
    render(
      <BrowserRouter>
        <SubmissionDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Find the back link/button
    const backLink = screen.getByRole('link', { name: /back to problem/i }); 
    expect(backLink).toBeInTheDocument();
    // Check its href attribute
    expect(backLink).toHaveAttribute('href', '/problems/1'); 
  });
}); 