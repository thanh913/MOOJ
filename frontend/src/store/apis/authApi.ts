import { baseApi } from '../api';
import { User, UserCreate } from '../../types/user';
import { Token } from '../../types/token'; // Assuming Token type exists
import { setCredentials } from '../slices/authSlice';

// Define the shape for login credentials (matching OAuth2PasswordRequestForm)
interface LoginCredentials {
  username: string; // Corresponds to email
  password: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Mutation for user login
    login: builder.mutation<Token, LoginCredentials>({
      query: (credentials) => {
        // Convert credentials to form data for OAuth2PasswordRequestForm
        const body = new URLSearchParams();
        body.append('username', credentials.username);
        body.append('password', credentials.password);

        return {
          url: 'auth/login',
          method: 'POST',
          body: body,
          headers: {
             'Content-Type': 'application/x-www-form-urlencoded'
          }
        };
      },
      // We don't invalidate tags here, but dispatch setCredentials on success
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Fetch user details after successful login using the new token
          // Need to manually dispatch a fetch for 'me' or decode token
          // For now, just store token, user will be fetched later or on page load
          dispatch(setCredentials({ token: data.access_token, user: null })); 
        } catch (error) {
          // Handle login error (already handled globally?)
          console.error('Login failed:', error);
        }
      },
    }),
    // Mutation for user registration
    register: builder.mutation<User, UserCreate>({
      query: (newUser) => ({
        url: 'auth/register',
        method: 'POST',
        body: newUser,
      }),
       // Optionally log in user after successful registration
      // async onQueryStarted(arg, { dispatch, queryFulfilled }) {
      //   try {
      //     await queryFulfilled;
      //     // Trigger login mutation automatically? Or prompt user?
      //   } catch (error) { }
      // },
    }),
    // Query to get current user details
    getMe: builder.query<User, void>({
      query: () => 'auth/me',
      providesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update user info in auth state, keeping existing token
          dispatch(setCredentials({ user: data, token: localStorage.getItem('authToken') }));
        } catch (error) {
          // If /me fails (e.g., invalid token), log out the user
          console.error('/me endpoint failed, logging out:', error);
          dispatch(setCredentials({ user: null, token: null })); // Effectively logs out
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLazyGetMeQuery // Use lazy query for manual fetching if needed
} = authApi; 