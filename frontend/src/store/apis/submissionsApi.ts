import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Submission } from '../../types/submission';

export const submissionsApi = createApi({
  reducerPath: 'submissionsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Submission'],
  endpoints: (builder) => ({
    getSubmissionById: builder.query<Submission, number>({
      query: (id) => `submissions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Submission', id }],
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
          // If FormData, don't set content-type (browser will set it with boundary)
          // If JSON, use application/json
          headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
          // If FormData, send as is; otherwise stringify the JSON data
          body: isFormData ? data : data,
        };
      },
      invalidatesTags: ['Submission'],
    }),
    
    appealSubmission: builder.mutation<
      Submission,
      { submission_id: number; error_id: string; justification: string }
    >({
      query: ({ submission_id, ...data }) => ({
        url: `submissions/${submission_id}/appeals`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Submission', id: arg.submission_id },
      ],
    }),
  }),
});

export const {
  useGetSubmissionByIdQuery,
  useCreateSubmissionMutation,
  useAppealSubmissionMutation,
} = submissionsApi; 