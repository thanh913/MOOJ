import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserRole } from '../../types/user';

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
}

// Attempt to load token from localStorage on initial load
const loadToken = (): string | null => {
  try {
    return localStorage.getItem('authToken');
  } catch (e) {
    console.error("Could not load token from localStorage", e);
    return null;
  }
};

const initialState: AuthState = {
  token: loadToken(),
  isAuthenticated: !!loadToken(), // Initial auth state based on token presence
  user: null, // User info will be fetched separately or decoded from token
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      { payload: { user, token } }: PayloadAction<{ user: User | null; token: string | null }>
    ) => {
      state.user = user;
      state.token = token;
      state.isAuthenticated = !!token;
      // Save/Remove token from localStorage
      try {
          if (token) {
            localStorage.setItem('authToken', token);
          } else {
            localStorage.removeItem('authToken');
          }
      } catch (e) {
          console.error("Could not save/remove token in localStorage", e);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      try {
          localStorage.removeItem('authToken');
      } catch (e) {
          console.error("Could not remove token from localStorage", e);
      }
    },
  },
  // TODO: Add extraReducers to handle pending/fulfilled states of login/register mutations if needed
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role; 