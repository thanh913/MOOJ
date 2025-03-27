import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { googleLogin } from '../services/api';

// Component for showing the Moo mascot
const MooLoading: React.FC<{ message: string }> = ({ message }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
      <span role="img" aria-label="cow" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        🐄
      </span>
      <CircularProgress size={24} sx={{ mb: 2 }} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Get code from URL query params
      const queryParams = new URLSearchParams(location.search);
      const code = queryParams.get('code');
      
      if (!code) {
        setError('No authentication code received');
        return;
      }
      
      try {
        // Exchange code for token
        const authResult = await googleLogin(code);
        
        // Store token and user info
        localStorage.setItem('token', authResult.token);
        localStorage.setItem('user', JSON.stringify(authResult.user));
        
        // Redirect to home page
        navigate('/');
      } catch (err) {
        console.error('Google OAuth error:', err);
        setError('Failed to authenticate with Google');
      }
    };
    
    handleOAuthCallback();
  }, [location, navigate]);

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          Authentication Error
        </Typography>
        <Typography variant="body1">
          {error}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          <span 
            style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
            onClick={() => navigate('/login')}
          >
            Return to login
          </span>
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh'
    }}>
      <MooLoading message="Logging you in with Google..." />
    </Box>
  );
};

export default OAuthCallback; 