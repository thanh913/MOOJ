import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
// Remove authReducer import
// import authReducer, { AuthState } from './slices/authSlice'; 
import { baseApi } from './api'; // Import the api slice
import { submissionsApi } from './apis/submissionsApi'; // Import the submissions API

// Configure the store with all necessary reducers and middleware
export const store = configureStore({
  reducer: {
    // auth: authReducer, 
    [baseApi.reducerPath]: baseApi.reducer,
    [submissionsApi.reducerPath]: submissionsApi.reducer, // Add submissions API reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(submissionsApi.middleware),
});

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Infer types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;