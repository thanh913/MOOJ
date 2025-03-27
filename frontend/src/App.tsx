import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container } from '@mui/material';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProblemList from './pages/ProblemList';
import ProblemDetail from './pages/ProblemDetail';
import SubmissionDetail from './pages/SubmissionDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuthCallback from './pages/OAuthCallback';
import theme from './theme';

// Import components here when implemented
// import Home from './pages/Home';
// import Login from './pages/Login';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
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
      </Router>
    </ThemeProvider>
  );
}

export default App;
