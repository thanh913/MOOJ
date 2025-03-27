import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProblemList from '../../pages/ProblemList';
import * as apiService from '../../services/api';

// Mock the API service
jest.mock('../../services/api');

const mockProblems = [
  { id: 1, title: 'Problem 1', difficulty: 3, topics: ['algebra', 'linear-equations'] },
  { id: 2, title: 'Problem 2', difficulty: 5, topics: ['calculus', 'integration'] },
  { id: 3, title: 'Problem 3', difficulty: 8, topics: ['geometry', 'trigonometry'] }
];

describe('ProblemList Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
  });

  it('should render loading state initially', () => {
    // Mock the API to not resolve immediately
    jest.spyOn(apiService, 'getProblems').mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <ProblemList />
      </BrowserRouter>
    );

    // Check for loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render the list of problems', async () => {
    // Mock successful API response
    jest.spyOn(apiService, 'getProblems').mockResolvedValue(mockProblems);

    render(
      <BrowserRouter>
        <ProblemList />
      </BrowserRouter>
    );

    // Wait for problems to be loaded
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check if problem titles are displayed
    expect(screen.getByText('Problem 1')).toBeInTheDocument();
    expect(screen.getByText('Problem 2')).toBeInTheDocument();
    expect(screen.getByText('Problem 3')).toBeInTheDocument();

    // Check if difficulty levels are displayed
    expect(screen.getByText('Difficulty: 3/9')).toBeInTheDocument();
    expect(screen.getByText('Difficulty: 5/9')).toBeInTheDocument();
    expect(screen.getByText('Difficulty: 8/9')).toBeInTheDocument();

    // Check if topic tags are displayed
    expect(screen.getByText('algebra')).toBeInTheDocument();
    expect(screen.getByText('calculus')).toBeInTheDocument();
    expect(screen.getByText('geometry')).toBeInTheDocument();
  });

  it('should filter problems by difficulty', async () => {
    // Mock initial API response
    jest.spyOn(apiService, 'getProblems').mockResolvedValue(mockProblems);

    render(
      <BrowserRouter>
        <ProblemList />
      </BrowserRouter>
    );

    // Wait for problems to be loaded
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Mock filtered API response
    jest.spyOn(apiService, 'getProblems').mockResolvedValue([mockProblems[0]]);

    // Select difficulty level 3
    fireEvent.mouseDown(screen.getByLabelText('Difficulty'));
    fireEvent.click(screen.getByText('Level 3'));

    // Wait for filtered problems to be loaded
    await waitFor(() => {
      expect(apiService.getProblems).toHaveBeenCalledWith({ difficulty: 3 });
    });

    // Only "Problem 1" should be visible after filtering
    await waitFor(() => {
      expect(screen.getByText('Problem 1')).toBeInTheDocument();
      expect(screen.queryByText('Problem 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Problem 3')).not.toBeInTheDocument();
    });
  });

  it('should handle API error', async () => {
    // Mock API error
    jest.spyOn(apiService, 'getProblems').mockRejectedValue(new Error('Failed to fetch'));

    render(
      <BrowserRouter>
        <ProblemList />
      </BrowserRouter>
    );

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('Failed to load problems. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should display a message when no problems match the filter', async () => {
    // Mock empty API response
    jest.spyOn(apiService, 'getProblems').mockResolvedValue([]);

    render(
      <BrowserRouter>
        <ProblemList />
      </BrowserRouter>
    );

    // Wait for message to be displayed
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('No problems found matching the selected criteria.')).toBeInTheDocument();
    });
  });
}); 