import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container, Box, Typography } from '@mui/material';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProblemList from './pages/ProblemList';
import ProblemDetail from './pages/ProblemDetail';
import SubmissionDetail from './pages/SubmissionDetail';
import theme from './theme';

// Import components here when implemented
// import Home from './pages/Home';
// import Login from './pages/Login';

function App() {
  console.log('!!! App.tsx: App component is rendering !!!');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Flex container for header, main content, and footer */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        {/* Main content container */}
        <Container 
          component="main" 
          maxWidth="lg" // Consistent max width
          sx={{ 
            flexGrow: 1, // Allow content to grow and push footer down
            py: 4, // Vertical padding
            mt: `calc(${theme.mixins.toolbar.minHeight}px + ${theme.spacing(1)})` // Add margin top based on AppBar height + spacing
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/problems" replace />} />
            <Route path="/problems" element={<ProblemList />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
            <Route path="/submissions/:id" element={<SubmissionDetail />} />
            <Route path="*" element={
              <Box sx={{ textAlign: 'center', mt: '5rem' }}> {/* Use Box for styling */}
                <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>🔍🐄</Typography>
                <Typography variant="h4" component="h2" gutterBottom>
                  Page Not Found
                </Typography>
                <Typography color="text.secondary">
                  Sorry, the page you are looking for doesn't exist.
                </Typography>
              </Box>
            } />
          </Routes>
        </Container>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
