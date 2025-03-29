import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
// Import your reducers here when you create them
import authReducer, { AuthState } from './slices/authSlice';
import { baseApi } from './api'; // Import the api slice

// Define the reducer map
const reducerMap = {
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
};

// Combine reducers (no explicit typing)
const rootReducer = combineReducers(reducerMap);

// Configure the store
export const store = configureStore({
  reducer: rootReducer,
  // Use type assertion to bypass TypeScript checking
  middleware: getDefaultMiddleware => 
    getDefaultMiddleware().concat(baseApi.middleware) as any,
});

// Infer RootState and AppDispatch from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);