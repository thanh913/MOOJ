import { baseApi } from '../api';
import { Problem } from '../../types/problem';

export const problemsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Query to get a list of problems
    getProblems: builder.query<Problem[], { skip?: number; limit?: number }>({
      query: ({ skip = 0, limit = 100 } = {}) => {
        // Add cache-busting timestamp parameter to avoid browser caching
        const timestamp = new Date().getTime();
        // Add trailing slash for FastAPI compatibility
        return `problems/?skip=${skip}&limit=${limit}&_ts=${timestamp}`;
      },
      providesTags: (result: Problem[] | undefined) =>
        result
          ? [
              ...result.map(({ id }: { id: number }) => ({ type: 'Problem' as const, id })),
              { type: 'Problem', id: 'LIST' },
            ]
          : [{ type: 'Problem', id: 'LIST' }],
    }),
    // Query to get a single problem by ID
    getProblemById: builder.query<Problem, number>({
      query: (id: number) => {
        // Add cache-busting timestamp parameter to avoid browser caching
        const timestamp = new Date().getTime();
        // No trailing slash needed for ID-specific requests
        return `problems/${id}?_ts=${timestamp}`;
      },
      providesTags: (result: Problem | undefined, error: any, id: number) => [{ type: 'Problem', id }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetProblemsQuery,
  useGetProblemByIdQuery,
} = problemsApi; 