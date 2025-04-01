import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Submission, MultiAppealCreate } from '../../types/submission';

export const submissionsApi = createApi({
  reducerPath: 'submissionsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/' }),
  tagTypes: ['Submission'],
  endpoints: (builder) => ({
    getSubmissionById: builder.query<Submission, number>({
      query: (id) => `submissions/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Submission', id }],
    }),
    
    getSubmissions: builder.query<Submission[], { skip?: number; limit?: number; problem_id?: number }>({
      query: ({ skip = 0, limit = 20, problem_id }) => {
        // Build query params
        const params = new URLSearchParams();
        params.append('skip', skip.toString());
        params.append('limit', limit.toString());
        if (problem_id) {
          params.append('problem_id', problem_id.toString());
        }
        
        return {
          url: `submissions/?${params.toString()}`,
        };
      },
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Submission' as const, id })),
              { type: 'Submission', id: 'LIST' },
            ]
          : [{ type: 'Submission', id: 'LIST' }],
    }),
    
    createSubmission: builder.mutation<
      Submission, 
      { problem_id: number; solution_text: string } | FormData
    >({
      query: (data) => {
        // Determine if this is FormData or a JSON object
        const isFormData = data instanceof FormData;
        
        return {
          url: 'submissions/',
          method: 'POST',
          // Do not set content-type for any request - let browser handle it
          // For FormData, browser will set multipart/form-data with boundary
          // For converted FormData (from JSON), same applies
          // This removes the Content-Type: application/json header that was confusing the server
          headers: undefined,
          // For both cases, send as FormData because backend expects Form data, not JSON
          body: isFormData ? data : (() => {
            const formData = new FormData();
            if ('problem_id' in data) formData.append('problem_id', data.problem_id.toString());
            if ('solution_text' in data) formData.append('solution_text', data.solution_text);
            return formData;
          })(),
        };
      },
      invalidatesTags: [{ type: 'Submission', id: 'LIST' }],
    }),
    
    appealSubmissionBatch: builder.mutation<
      Submission,
      { submission_id: number; appeal_batch: MultiAppealCreate }
    >({
      query: ({ submission_id, appeal_batch }) => ({
        url: `submissions/${submission_id}/appeals`,
        method: 'POST',
        body: appeal_batch,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Submission', id: arg.submission_id },
      ],
    }),

    acceptScore: builder.mutation<
      Submission,
      { submission_id: number }
    >({
      query: ({ submission_id }) => ({
        url: `submissions/${submission_id}/accept`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Submission', id: arg.submission_id },
      ],
    }),
  }),
});

export const {
  useGetSubmissionByIdQuery,
  useGetSubmissionsQuery,
  useCreateSubmissionMutation,
  useAppealSubmissionBatchMutation,
  useAcceptScoreMutation,
} = submissionsApi; 