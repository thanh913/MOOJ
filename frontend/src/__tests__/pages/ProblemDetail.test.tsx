import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProblemDetail from '../../pages/ProblemDetail';
import * as apiService from '../../services/api';
import { Problem } from '../../types/problem';

// Mock the specific API service functions used by ProblemDetail
jest.mock('../../services/api'); // Mock the whole module

// Mock React Router hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }), // Ensure ID is a string if param is string
  useNavigate: () => jest.fn()
}));

// Mock the apiService module
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

// Helper function to render with router context
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

// Define a mock user structure (inline for now, until User is exported)
const mockUser = { 
  id: 101,
  username: 'testuser',
  email: 'testuser@example.com',
  role: 'user',
  created_at: '2023-01-15T09:00:00Z'
};

const mockProblem: Problem = {
  id: 1,
  title: 'Test Problem',
  statement: 'Solve for x: 2x + 3 = 1',
  difficulty: 300,
  topics: ['algebra', 'equations'],
  created_by_id: 101,
  created_at: '2023-10-26T10:00:00Z',
  creator: mockUser as any, // Cast mock user structure to any
  is_published: true,
};

describe('ProblemDetail Component', () => {
  // Define mockSubmitForm here so it's accessible to tests
  let mockSubmitForm: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Default successful mock for fetchProblemById
    mockedApiService.fetchProblemById.mockResolvedValue(mockProblem as any);
    // Define and reset mockSubmitForm before each test
    mockSubmitForm = jest.fn().mockResolvedValue({ submissionId: 'sub123' }); // Default successful mock
    // Correctly assign the mock implementation
    mockedApiService.createSubmission.mockImplementation(mockSubmitForm);
  });

  it('should render loading state initially', () => {
    // Use the correct function name
    (apiService.fetchProblemById as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <ProblemDetail />
      </BrowserRouter>
    );

    // Check for loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render problem details', async () => {
    renderWithRouter(<ProblemDetail />); // Use helper

    // Wait for problem details to load
    await screen.findByRole('heading', { name: /Test Problem/i });

    // Check if problem details are displayed
    expect(screen.getByText('Test Problem')).toBeInTheDocument();
    expect(screen.getByText(/Level 300/i)).toBeInTheDocument();
    expect(screen.getByText('algebra')).toBeInTheDocument();
    expect(screen.getByText('equations')).toBeInTheDocument();
    
    // Check if the problem statement is rendered (basic check)
    expect(screen.getByText(/Solve for x/i)).toBeInTheDocument();
  });

  it('should handle direct input submission', async () => {
    renderWithRouter(<ProblemDetail />); // Use helper

    // Wait for problem details to load
    await screen.findByRole('heading', { name: /Test Problem/i });

    // Click the Submit Tab
    const submitTab = screen.getByRole('tab', { name: /Submit/i });
    fireEvent.click(submitTab);

    // Wait for the Submit tab content to load AND the default radio to be checked
    const directInputRadio = await screen.findByLabelText(/Direct Input \(LaTeX\)/i);
    expect(directInputRadio).toBeChecked();

    // Wait specifically for the input element (e.g., textarea/textbox) after confirming radio state
    const solutionInput = await screen.findByRole('textbox');
    expect(solutionInput).toBeInTheDocument();
    fireEvent.change(solutionInput, { target: { value: 'x = -1' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Submit Solution/i }));

    // Check if submitForm was called correctly
    await waitFor(() => {
      expect(mockSubmitForm).toHaveBeenCalledWith({
        problem_id: 1,
        content: 'x = -1',
        content_type: 'direct'
      });
    });
  });

  it('should handle validation for empty submission', async () => {
    renderWithRouter(<ProblemDetail />); // Use helper

    // Wait for problem details to load
    await screen.findByRole('heading', { name: /Test Problem/i });

    // Click the Submit Tab
    const submitTab = screen.getByRole('tab', { name: /Submit/i });
    fireEvent.click(submitTab);

    // Wait for the Submit tab content to load AND the default radio to be checked
    const directInputRadio = await screen.findByLabelText(/Direct Input \(LaTeX\)/i);
    expect(directInputRadio).toBeChecked();

    // Find the submit button
    const submitButton = screen.getByRole('button', { name: /Submit Solution/i });

    // Click submit button without entering text
    fireEvent.click(submitButton);

    // Check if validation error is displayed - Wait *after* clicking submit
    await waitFor(() => {
      expect(screen.getByText('Please provide a submission')).toBeInTheDocument();
    });

    // Ensure submitForm was NOT called due to validation failure
    expect(mockSubmitForm).not.toHaveBeenCalled();
  });

  it('should handle API error', async () => {
    // Use the correct function name
    (apiService.fetchProblemById as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

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
    renderWithRouter(<ProblemDetail />); // Use helper

    // Wait for problem details to load
    await screen.findByRole('heading', { name: /Test Problem/i });

    // Click the Submit Tab
    const submitTab = screen.getByRole('tab', { name: /Submit/i });
    fireEvent.click(submitTab);

    // Wait for the Submit tab content to load AND the default radio to be checked
    const directInputRadio = await screen.findByLabelText(/Direct Input \(LaTeX\)/i);
    expect(directInputRadio).toBeChecked();

    // Check if direct input is initially selected and visible
    await screen.findByRole('textbox');
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    // Switch to image upload
    const imageUploadRadio = screen.getByLabelText(/Image URL/i);
    fireEvent.click(imageUploadRadio);

    // Wait for image upload radio to be checked and assert visibility changes
    await waitFor(() => {
      expect(imageUploadRadio).toBeChecked();
      expect(screen.getByRole('textbox', { name: 'Image URL' })).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: /Enter your solution/i })).not.toBeInTheDocument();
    });

    // Switch back to direct input
    fireEvent.click(directInputRadio);

    // Wait for direct input radio to be checked and assert visibility changes back
    await waitFor(() => {
      expect(directInputRadio).toBeChecked();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.queryByText('Upload Solution Image')).not.toBeInTheDocument();
    });
  });

  test('should display error message on fetch failure', async () => {
    // ... existing code ...
  });
}); 