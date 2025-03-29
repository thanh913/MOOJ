import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container, Box, CircularProgress } from '@mui/material';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProblemList from './pages/ProblemList';
import ProblemDetail from './pages/ProblemDetail';
import SubmissionDetail from './pages/SubmissionDetail';
import Login from './components/auth/Login';
import Register from './pages/Register';
import OAuthCallback from './pages/OAuthCallback';
import ModeratorProblemDashboard from './pages/ModeratorProblemDashboard';
import theme from './theme';
import { UserRole } from './types/user';
import { useGetMeQuery } from './store/apis/authApi';

// Import components here when implemented
// import Home from './pages/Home';
// import Login from './pages/Login';

function App() {
  // Attempt to fetch user data on initial load if token exists
  const { isLoading: isAuthLoading, error: authError } = useGetMeQuery();

  // Optional: Display a loading indicator while checking auth status
  if (isAuthLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Optional: Handle error during initial auth check (e.g., invalid token)
  // if (authError) { ... display error message or redirect ... }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        <Header />
        <Container component="main" sx={{ py: 4, minHeight: 'calc(100vh - 130px)' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/problems" replace />} />
            <Route path="/problems" element={<ProblemList />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
            <Route path="/submissions/:id" element={<SubmissionDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route element={<ProtectedRoute allowedRoles={[UserRole.Moderator, UserRole.Admin]} />}>
              <Route path="/moderator/problems" element={<ModeratorProblemDashboard />} />
            </Route>
            <Route path="*" element={
              <div style={{ textAlign: 'center', marginTop: '5rem' }}>
                <span role="img" aria-label="lost cow" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>
                  🔍🐄
                </span>
                <h2>Page Not Found</h2>
                <p>Sorry, the page you are looking for doesn't exist.</p>
              </div>
            } />
          </Routes>
        </Container>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
