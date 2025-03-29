import { baseApi } from '../api';
import { Problem, ProblemCreate, ProblemUpdate } from '../../types/problem'; // Assuming types are defined here

export const problemsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Query to get a list of problems
    getProblems: builder.query<Problem[], { skip?: number; limit?: number }>({ // Specify return type and arg type
      query: ({ skip = 0, limit = 100 } = {}) => `problems?skip=${skip}&limit=${limit}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Problem' as const, id })),
              { type: 'Problem', id: 'LIST' },
            ]
          : [{ type: 'Problem', id: 'LIST' }],
    }),
    // Query to get a single problem by ID
    getProblemById: builder.query<Problem, number>({ // Specify return type and arg type (problem ID)
      query: (id) => `problems/${id}`,
      providesTags: (result, error, id) => [{ type: 'Problem', id }],
    }),
    // Mutation to create a new problem
    createProblem: builder.mutation<Problem, ProblemCreate>({ // Specify return type and arg type
      query: (newProblem) => ({
        url: 'problems',
        method: 'POST',
        body: newProblem,
      }),
      invalidatesTags: [{ type: 'Problem', id: 'LIST' }], // Invalidate the list cache on creation
    }),
    // Mutation to update an existing problem
    updateProblem: builder.mutation<Problem, { id: number; data: ProblemUpdate }>({ // Specify return type and arg type
      query: ({ id, data }) => ({
        url: `problems/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Problem', id }], // Invalidate cache for this specific problem
    }),
    // Mutation to delete a problem
    deleteProblem: builder.mutation<Problem, number>({ // Specify return type and arg type (problem ID)
      query: (id) => ({
        url: `problems/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Problem', id },
        { type: 'Problem', id: 'LIST' } // Also invalidate the list cache
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetProblemsQuery,
  useGetProblemByIdQuery,
  useCreateProblemMutation,
  useUpdateProblemMutation,
  useDeleteProblemMutation,
} = problemsApi; 