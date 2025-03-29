import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
// Import your reducers here when you create them
import authReducer from './slices/authSlice';
import { baseApi } from './api'; // Import the api slice

// Define the reducer map
const reducerMap = {
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
};

// Combine reducers
const rootReducer = combineReducers(reducerMap);

// Infer RootState from the rootReducer *before* creating the store
export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  // Keep middleware simple, rely on inference
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

// Infer AppDispatch
export type AppDispatch = typeof store.dispatch; 