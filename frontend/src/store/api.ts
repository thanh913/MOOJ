import { createApi, fetchBaseQuery, BaseQueryApi } from '@reduxjs/toolkit/query/react';
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

// Define a service using a base URL and expected endpoints
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    // Use relative URL for better proxy handling
    baseUrl: '/api/v1/',
    // Add basic error handling for common network issues
    fetchFn: async (...args) => {
      try {
        const response = await fetch(...args);
        // Log response status for debugging
        console.log(`API response status: ${response.status} for ${args[0]}`);
        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
          // Throw an error for bad responses
          throw new Error(`API request failed with status ${response.status}`);
        }
        return response;
      } catch (error) {
        console.error('Network error or API failure:', error);
        // Re-throw as a structured error for RTK Query to handle
        // You might want to customize the structure based on how you handle errors downstream
        throw { 
          status: 'FETCH_ERROR', 
          message: error instanceof Error ? error.message : 'An unknown network error occurred',
          originalError: error 
        };
      }
    }
  }),
  tagTypes: ['Problem', 'Submission'], // Define tag types for caching
  endpoints: (builder: EndpointBuilder<any, any, any>) => ({}), // Endpoints will be injected later
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
// Example: export const { useGetPokemonByNameQuery } = baseApi; // Will be generated when endpoints are added 