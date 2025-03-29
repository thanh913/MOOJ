import { createApi, fetchBaseQuery, BaseQueryApi } from '@reduxjs/toolkit/query/react';
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

// Define a service using a base URL and expected endpoints
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    // Use environment variable for base URL, fallback to localhost for development
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1',
    prepareHeaders: (headers: Headers, { getState }: { getState: () => unknown }) => {
      // Add the auth token to headers if it exists in the state
      const token = (getState() as import('./index').RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Problem', 'User', 'Submission'], // Define tag types for caching
  endpoints: (builder: EndpointBuilder<any, any, any>) => ({}), // Endpoints will be injected later
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
// Example: export const { useGetPokemonByNameQuery } = baseApi; // Will be generated when endpoints are added 