import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../store/apis/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import { TextField, Button, Typography, Container, Box, CircularProgress, Alert } from '@mui/material';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [login, { isLoading, error, data, isSuccess }] = useLoginMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // The login mutation hook handles the API call internally
            // We just need to pass the credentials
            await login({ username, password }).unwrap();
            // No need to manually dispatch here if the mutation handles it via onQueryStarted
            // However, if the API doesn't return the full user object or you need immediate state update,
            // you might dispatch here based on the `data` received.
            // If `login` endpoint in `authApi` dispatches `setCredentials`, this manual dispatch is redundant.
            // Check `frontend/src/store/apis/authApi.ts` `login` endpoint logic.
        } catch (err) {
            // Error is already captured by the `error` object from the hook
            console.error('Failed to login:', err);
        }
    };

    useEffect(() => {
        if (isSuccess && data) {
            // If login mutation doesn't automatically dispatch, do it here:
            // dispatch(setCredentials({ user: ???, token: data.access_token })); // Adjust based on actual data structure
            // Assuming the mutation's onQueryStarted handles dispatching setCredentials correctly.
            navigate('/'); // Redirect to home or dashboard after login
        }
    }, [isSuccess, data, navigate, dispatch]);


    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                        {/* @ts-ignore */}
                        Login Failed: {error?.data?.detail || 'An unknown error occurred'}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                    />
                    {/* Add Remember Me checkbox if needed */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>
                    {/* Add Links for Sign Up or Forgot Password if needed */}
                </Box>
            </Box>
        </Container>
    );
};

export default Login; 