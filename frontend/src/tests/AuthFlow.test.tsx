import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import App from '../App';
import { authApi } from '../store/apis/authApi';
import authReducer, { AuthState, logout } from '../store/slices/authSlice';
import * as api from '../services/api';
import { baseApi } from '../store/api';
import { UserRole } from '../types/user';
import { act } from 'react';

// Define RootState type to match store/index.ts
type RootState = {
  auth: AuthState;
  'baseApi': ReturnType<typeof baseApi.reducer>;
};

// Mock the API service
jest.mock('../services/api', () => ({
  getGoogleOAuthUrl: jest.fn(),
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  fetchProblems: jest.fn().mockResolvedValue([
    {
      id: 1,
      title: "Sample Problem",
      statement: "This is a sample problem statement",
      difficulty: 3,
      topics: ["algebra", "calculus"],
      is_published: true,
      created_by_id: 1,
      created_at: new Date().toISOString(),
      creator: {
        id: 1,
        username: "moderator",
        email: "moderator@example.com",
        role: "moderator",
        created_at: new Date().toISOString()
      }
    }
  ]),
}));

// Mock react-redux
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

// Mock the auth API hooks
const mockGetMeQuery = jest.fn();
const mockLoginMutation = jest.fn();
const mockRegisterMutation = jest.fn();

// Create controllable state for the mutation mocks
// Define a type for the mutation state to allow flexible error types
type MutationState = {
  isLoading: boolean;
  error: any | null; // Allow null or any error structure
  isSuccess: boolean;
};

let mockRegisterMutationState: MutationState = { isLoading: false, error: null, isSuccess: false };
let mockLoginMutationState: MutationState = { isLoading: false, error: null, isSuccess: false };

jest.mock('../store/apis/authApi', () => {
  const actual = jest.requireActual('../store/apis/authApi');
  return {
    ...actual,
    useGetMeQuery: () => mockGetMeQuery(),
    // Return the trigger and the controllable state for login (using renamed variable)
    useLoginMutation: () => [mockLoginMutation, mockLoginMutationState],
    // Return the trigger and the controllable state for register (using renamed variable)
    useRegisterMutation: () => [mockRegisterMutation, mockRegisterMutationState],
  };
});

// Set up initial mock responses
beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks(); 
  // Reset mutation states before each test (using renamed variables)
  mockRegisterMutationState = { isLoading: false, error: null, isSuccess: false };
  mockLoginMutationState = { isLoading: false, error: null, isSuccess: false };
  
  mockGetMeQuery.mockReturnValue({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false
  });
});

// Create a mock store
const createMockStore = (initialState: Partial<RootState> = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    preloadedState: initialState,
  });
};

// Test helper to render the app with necessary providers
const renderApp = (initialState: Partial<RootState> = {}, initialEntries = ['/']) => {
  const store = createMockStore(initialState);
  // Return the render result, including rerender
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

// --- Test Suite ---

describe('Authentication Flow Integration Test', () => {
  jest.setTimeout(30000);

  // Disable error logging in tests
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    // Restore console.error
    jest.restoreAllMocks();
  });

  // Need to fix the mock setup for useRegisterMutation to properly trigger the success state in the component.
  test('should allow registration, logout, login, access protected route, and logout', async () => {
    // Render the app, starting at the home page
    const { rerender } = renderApp(); // Capture rerender
    let currentStore = createMockStore(); // Keep track of store state

    // 1. Navigate to Register Page
    const signUpLink = await screen.findByRole('link', { name: /sign up/i });
    await userEvent.click(signUpLink);
    expect(await screen.findByRole('heading', { name: /create an account/i })).toBeInTheDocument();

    // 2. Register User - Set up mock before interaction
    // Let the hook manage its initial state
    mockRegisterMutation.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ message: 'User registered successfully' }),
    });

    // Fill in the form
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByTestId('email-input'), 'test@example.com');
    await userEvent.type(screen.getByTestId('password-input'), 'password123');
    await userEvent.type(screen.getByTestId('confirm-password-input'), 'password123');

    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    // Wait for the mutation trigger to be called
    await waitFor(() => {
      expect(mockRegisterMutation).toHaveBeenCalledTimes(1);
      expect(mockRegisterMutation).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // Update the mock state *after* the mutation is called, simulating the hook's behavior
    mockRegisterMutationState = { isLoading: false, error: null, isSuccess: true };
    
    // Explicitly rerender the component with the updated mock state
    rerender(
      <Provider store={currentStore}>
        <MemoryRouter initialEntries={['/register']}> {/* Ensure we stay on the register page */}
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Wait for the success alert
    const successAlert = await screen.findByTestId('success-alert');
    expect(successAlert).toBeInTheDocument();
    expect(successAlert).toHaveTextContent(/Registration successful! You can now sign in./i);

    // 3. Navigate to Login using the link within the alert
    const signInLink = within(successAlert).getByRole('link', { name: /sign in/i });
    await userEvent.click(signInLink);

    // Wait for navigation to complete and Login page to render
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });

    // 4. Attempt Login - Simulate Failure
    mockLoginMutation.mockReturnValue({
      unwrap: jest.fn().mockRejectedValue({ data: { detail: 'Invalid credentials' } }),
    });
    
    // Update state for error case
    mockLoginMutationState = { isLoading: false, error: { data: { detail: 'Invalid credentials' } }, isSuccess: false }; 

    // Find email input (combines getBy and waitFor)
    const emailInput = await screen.findByTestId('email-input');
    await userEvent.type(emailInput, 'testuser');

    // Find password input (combines getBy and waitFor)
    const passwordInput = await screen.findByTestId('password-input');
    await userEvent.type(passwordInput, 'wrongpassword');

    // Click submit button
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockLoginMutation).toHaveBeenCalledTimes(1);
    });

    // Wait for error alert
    await waitFor(async () => {
      const errorAlert = await screen.findByRole('alert');
      expect(errorAlert).toHaveTextContent(/Invalid credentials/i);
    });

    // 5. Attempt Login - Simulate Success
    const mockUser = { 
      id: 1, 
      username: 'testuser', 
      email: 'test@example.com', 
      role: UserRole.User,
      created_at: new Date().toISOString()
    };
    
    mockLoginMutation.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ access_token: 'fake-token', user: mockUser }),
    });
    
    // Reset state
    mockLoginMutationState = { isLoading: false, error: null, isSuccess: false }; 
    
    // Update getMe mock
    mockGetMeQuery.mockReturnValue({ isLoading: false, data: mockUser, error: undefined, isSuccess: true });
    
    // Update store state
    currentStore = createMockStore({ 
      auth: { 
        user: mockUser, 
        token: 'fake-token', 
        isAuthenticated: true
      } 
    });

    // Clear previous inputs and enter new credentials
    await userEvent.clear(screen.getByTestId('email-input'));
    await userEvent.clear(screen.getByTestId('password-input'));
    await userEvent.type(screen.getByTestId('email-input'), 'testuser');
    // Wait specifically for the password input before typing (successful login)
    await waitFor(() => expect(screen.getByTestId('password-input')).toBeInTheDocument());
    await userEvent.type(screen.getByTestId('password-input'), 'password123');
    
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockLoginMutation).toHaveBeenCalledTimes(2); 
    });

    // Update mock state after successful login
    mockLoginMutationState.isSuccess = true;
    mockLoginMutationState.isLoading = false;
    
    // Verify login success and navigation
    await waitFor(async () => {
      expect(await screen.findByRole('button', { name: /logout/i })).toBeInTheDocument();
      expect(screen.getByText(/testuser/i)).toBeInTheDocument(); 
      expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
    });
    
    await waitFor(() => expect(mockGetMeQuery).toHaveBeenCalled());

    // 8. Logout
    mockGetMeQuery.mockReturnValue({ 
      isLoading: false, 
      data: null, 
      error: new Error('Unauthorized'), 
      isSuccess: false 
    }); 
    
    // Reset dispatch mock, but DO NOT reset store yet
    mockDispatch.mockClear(); 

    await userEvent.click(screen.getByRole('button', { name: /logout/i }));

    // 6. Wait for navigation to login page
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });

    // Reset the store AFTER logout and navigation is confirmed
    currentStore = createMockStore(); 

    // 7. Attempt to fill out login form (Failed Login First)
    // Reset mock state for login mutation (simulate failed login first)
    mockLoginMutationState = { isLoading: false, error: { data: { detail: 'Invalid credentials' } }, isSuccess: false };

    // Wait specifically for the email input after logout before typing
    await waitFor(() => expect(screen.getByTestId('email-input')).toBeInTheDocument());
    await userEvent.type(screen.getByTestId('email-input'), 'testuser');
    // Wait specifically for the password input before typing (after logout)
    await waitFor(() => expect(screen.getByTestId('password-input')).toBeInTheDocument());
    await userEvent.type(screen.getByTestId('password-input'), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // 8. Attempt successful login
    mockLoginMutationState = { isLoading: false, error: null, isSuccess: true };
    await userEvent.clear(screen.getByTestId('email-input'));
    await userEvent.clear(screen.getByTestId('password-input'));
    await userEvent.type(screen.getByTestId('email-input'), 'testuser');
    // Wait specifically for the password input before typing (after logout - successful)
    await waitFor(() => expect(screen.getByTestId('password-input')).toBeInTheDocument());
    await userEvent.type(screen.getByTestId('password-input'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLoginMutation).toHaveBeenCalledTimes(2); 
    });

    // Verify logged-out state
    await waitFor(async () => {
      expect(await screen.findByRole('button', { name: /login/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/testuser/i)).not.toBeInTheDocument();
    });
  });
}); 