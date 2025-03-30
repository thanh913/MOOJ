import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../../store/api'; // Assuming baseApi setup
import ProblemList from '../../pages/ProblemList';
// Import Problem type from the correct location
import { Problem } from '../../types/problem'; 
// Import User type AND UserRole enum
import { User, UserRole } from '../../types/user'; 

// Mock data using the correct type and enum
const mockCreator: User = { 
  id: 1, username: 'testuser', email: 'test@test.com', role: UserRole.User, created_at: new Date().toISOString() 
};
const mockProblems: Problem[] = [
  { 
    id: 1, title: 'Problem Alpha', statement: 'Stmt A', difficulty: 3, topics: ['calculus'], is_published: true, 
    created_at: '2023-01-01T00:00:00Z', created_by_id: 1, creator: mockCreator 
  },
  { 
    id: 2, title: 'Problem Beta', statement: 'Stmt B', difficulty: 7, topics: ['algebra'], is_published: true, 
    created_at: '2023-01-02T00:00:00Z', created_by_id: 1, creator: mockCreator 
  },
];

// Mock RTK Query hook
jest.mock('../../store/apis/problemsApi', () => ({
  useGetProblemsQuery: jest.fn(() => ({
    data: mockProblems,
    isLoading: false,
    error: null,
  })),
}));

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useNavigate: () => mockedNavigate,
}));

// Helper function to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      // Add other reducers if needed
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
};

describe('<ProblemList />', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Reset mock implementation if needed (e.g., for error/loading states)
    require('../../store/apis/problemsApi').useGetProblemsQuery.mockImplementation(() => ({
      data: mockProblems,
      isLoading: false,
      error: null,
    }));
  });

  test('renders problem list correctly', async () => {
    renderWithProviders(<ProblemList />);

    // Check if problem titles are rendered
    await waitFor(() => {
      expect(screen.getByText('Problem Alpha')).toBeInTheDocument();
      expect(screen.getByText('Problem Beta')).toBeInTheDocument();
    });

    // Check if difficulty badges are rendered (assuming ProblemCard renders them)
    expect(screen.getByText('3')).toBeInTheDocument(); 
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  test('filters problems by search query', async () => {
    renderWithProviders(<ProblemList />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Problem Alpha')).toBeInTheDocument();
    });

    // Simulate typing in the search box
    const searchInput = screen.getByPlaceholderText('Search problems...');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    // Check if only matching problem remains
    await waitFor(() => {
      expect(screen.getByText('Problem Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Problem Beta')).not.toBeInTheDocument();
    });
  });

  test('navigates to problem detail on card click', async () => {
    renderWithProviders(<ProblemList />);

    // Wait for card to be available
    const problemCard = await screen.findByText('Problem Alpha');
    fireEvent.click(problemCard); 

    // Check if navigate was called with the correct path
    expect(mockedNavigate).toHaveBeenCalledWith('/problems/1');
  });

  // Add more tests for filtering by difficulty, topics, sorting, pagination, loading state, error state etc.
  test('shows loading state initially', () => {
    require('../../store/apis/problemsApi').useGetProblemsQuery.mockImplementation(() => ({
      data: undefined, // No data yet
      isLoading: true,
      error: null,
    }));
    renderWithProviders(<ProblemList />);
    // Check for loading indicator (adjust query based on MooLoading implementation)
    expect(screen.getByRole('progressbar')).toBeInTheDocument(); 
  });

  test('shows error state on fetch failure', () => {
    require('../../store/apis/problemsApi').useGetProblemsQuery.mockImplementation(() => ({
      data: undefined,
      isLoading: false,
      error: { status: 500, data: 'Server Error' }, // Example error object
    }));
    renderWithProviders(<ProblemList />);
    // Check for error message (adjust query based on Alert implementation)
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load problems/i)).toBeInTheDocument();
  });
}); 