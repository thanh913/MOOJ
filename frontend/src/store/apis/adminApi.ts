import { baseApi } from '../api';
import { User, UserRole } from '../../types/user';

// Define the expected response type for fetching users (adjust if backend returns pagination)
interface UserListResponse {
  users: User[];
  // Add pagination fields if backend provides them (e.g., total: number, page: number, size: number)
}

// Define the type for updating a user's role
interface UpdateUserRolePayload {
  userId: number;
  role: UserRole;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Query to get a list of all users
    getUsers: builder.query<User[], void>({ // Assuming it returns a simple array for now
      query: () => 'admin/users',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    // Mutation to update a user's role
    updateUserRole: builder.mutation<User, UpdateUserRolePayload>({
      query: ({ userId, role }) => ({
        url: `admin/users/${userId}/role`,
        method: 'PATCH',
        body: { role }, // Send the new role in the request body
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ], // Invalidate specific user and the list
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
} = adminApi; 