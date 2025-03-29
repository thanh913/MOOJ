import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, Google } from '@mui/icons-material';
import { getGoogleOAuthUrl } from '../services/api';
import { useRegisterMutation } from '../store/apis/authApi';
import { UserRole } from '../types/user';

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.User);
  const [showPassword, setShowPassword] = useState(false);
  
  // RTK Query Mutation Hook
  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();
  const [apiError, setApiError] = useState<string | null>(null); // Separate state for API errors
  const [validationError, setValidationError] = useState<string | null>(null); // State for validation errors
  
  // Form validation
  const validateForm = (): { valid: boolean; message?: string } => {
    if (password !== confirmPassword) {
      return { valid: false, message: 'Passwords do not match' };
    }
    
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (username.length < 3) {
      return { valid: false, message: 'Username must be at least 3 characters long' };
    }
    
    return { valid: true };
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm();
    if (!validation.valid) {
      setValidationError(validation.message || 'Validation error');
      setApiError(null); // Clear API error on new validation error
      return;
    }
    
    setValidationError(null); // Clear validation error if validation passes
    setApiError(null); // Clear previous API error
    
    try {
      // Call the register mutation
      await register({ username, email, password, role }).unwrap();
      // On success, isSuccess becomes true, handled by useEffect or UI conditional rendering
      // No need to manually navigate or set tokens here
    } catch (err: any) {
      // Set API error based on the error from the hook
      const errorDetail = err?.data?.detail || 'Registration failed. Please try again.';
      setApiError(errorDetail);
      console.error('Registration failed:', err);
    }
  };
  
  // Handle Google login
  const handleGoogleLogin = () => {
    window.location.href = getGoogleOAuthUrl();
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Create an Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join MOOJ and start solving math problems
            </Typography>
            {/* Moo mascot */}
            <Box sx={{ fontSize: '3rem', my: 1 }}>🐄</Box>
          </Box>
          
          {/* Error message */}
          {validationError && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {validationError}
            </Alert>
          )}
          {apiError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {apiError}
            </Alert>
          )}
          {isSuccess && (
            <Alert severity="success" sx={{ mb: 3 }} data-testid="success-alert">
              Registration successful! You can now {' '}
              <Link to="/login" style={{ fontWeight: 'bold' }}>
                sign in
              </Link>
              .
            </Alert>
          )}
          
          {/* Registration form */}
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={isLoading || isSuccess}
            />
            
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              type="email"
              value={email}
              inputProps={{ 'data-testid': 'email-input' }}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={isLoading || isSuccess}
            />
            
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              margin="normal"
              type={showPassword ? 'text' : 'password'}
              value={password}
              inputProps={{ 'data-testid': 'password-input' }}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              disabled={isLoading || isSuccess}
            />
            
            <TextField
              fullWidth
              label="Confirm Password"
              variant="outlined"
              margin="normal"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              inputProps={{ 'data-testid': 'confirm-password-input' }}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={isLoading || isSuccess}
            />
            
            {/* Add role selection for testing purposes */}
            <FormControl fullWidth margin="normal" disabled={isLoading || isSuccess}>
              <InputLabel id="role-select-label">Role (For Testing)</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={role}
                label="Role (For Testing)"
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <MenuItem value={UserRole.User}>User</MenuItem>
                <MenuItem value={UserRole.Moderator}>Moderator</MenuItem>
                <MenuItem value={UserRole.Admin}>Admin</MenuItem>
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Note: In production, all users would register as regular users by default.
              </Typography>
            </FormControl>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading || isSuccess}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
          </form>
          
          <Divider sx={{ my: 3 }}>OR</Divider>
          
          {/* Google login button */}
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            size="large"
            startIcon={<Google />}
            onClick={handleGoogleLogin}
            sx={{ mb: 2, mt: 1 }}
            disabled={isLoading}
          >
            Sign up with Google
          </Button>
          
          {/* Sign in link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none', color: 'primary.main' }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 