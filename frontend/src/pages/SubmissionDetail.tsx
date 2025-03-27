import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchSubmissionById, fetchProblemById } from '../services/api';
import { MooLoading, MooMascot, getSubmissionMoo } from '../components/shared/MooComponents';
import { StatusChip, StatusProgress, ScoreDisplay } from '../components/shared/StatusIndicators';
import { MathContent } from '../components/math/MathRenderer';

// Interfaces for the data
interface Submission {
  id: number;
  problem_id: number;
  user_id: number;
  content_type: 'direct' | 'image';
  content: string;
  latex_content?: string;
  score?: number;
  feedback?: string;
  submitted_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface Problem {
  id: number;
  title: string;
  difficulty: number;
}

interface FeedbackError {
  type: 'error' | 'warning' | 'success';
  message: string;
}

// Helper component for displaying the submission content
const SubmissionContent: React.FC<{
  submission: Submission;
}> = ({ submission }) => {
  return (
    <Paper elevation={0} sx={(theme) => ({ p: 3, bgcolor: theme.palette.grey[50], height: '100%' })}>
      {submission.content_type === 'direct' ? (
        <Box sx={{ overflowX: 'auto' }}>
          <MathContent content={submission.content} />
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <img
            src={submission.content}
            alt="Submitted solution"
            style={{ maxWidth: '100%', maxHeight: '400px' }}
          />
        </Box>
      )}
      
      {submission.latex_content && submission.content_type === 'image' && (
        <Box sx={{ mt: 3 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>LaTeX Conversion</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ overflowX: 'auto' }}>
                <MathContent content={submission.latex_content} />
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </Paper>
  );
};

// Helper component for displaying feedback analysis
const FeedbackAnalysis: React.FC<{
  feedback: string;
}> = ({ feedback }) => {
  // Parse feedback to extract errors (mock function, replace with actual implementation)
  const parseErrors = (feedback: string): FeedbackError[] => {
    // This is a simplified implementation - in a real app, you'd parse the structured feedback
    return [
      { type: 'error', message: 'Incorrect application of the chain rule on line 3' },
      { type: 'warning', message: 'The final answer is correct, but the working steps could be clearer' },
      { type: 'success', message: 'Correct application of the product rule' },
    ];
  };
  
  // Get icon for error type
  const getErrorIcon = (type: FeedbackError['type']) => {
    if (type === 'error') return <ErrorIcon color="error" />;
    if (type === 'warning') return <WarningIcon color="warning" />;
    return <CheckCircleIcon color="success" />;
  };

  const errors = parseErrors(feedback);
  
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <MathContent content={feedback} />
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Typography variant="subtitle2" gutterBottom>
        Detailed Analysis
      </Typography>
      
      <List>
        {errors.map((error, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              {getErrorIcon(error.type)}
            </ListItemIcon>
            <ListItemText primary={error.message} />
          </ListItem>
        ))}
      </List>
    </>
  );
};

// Helper component for submission metadata
const SubmissionMetadata: React.FC<{
  submission: Submission;
}> = ({ submission }) => {
  // Format the submitted date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary">
        Submission Time
      </Typography>
      <Typography variant="body1">
        {formatDate(submission.submitted_at)}
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Submission Type
        </Typography>
        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
          {submission.content_type === 'direct' ? 'Direct Input (LaTeX)' : 'Image Upload'}
        </Typography>
      </Box>
    </Box>
  );
};

const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const submissionId = Number(id);
  
  // State for data
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch submission data with polling for status updates
  const fetchSubmission = useCallback(async () => {
    if (isNaN(submissionId)) {
      setError('Invalid submission ID');
      setLoading(false);
      return;
    }
    
    try {
      const data = await fetchSubmissionById(submissionId);
      setSubmission(data);
      
      // If we don't have the problem info yet and have the problem_id, fetch it
      if (!problem && data.problem_id) {
        try {
          const problemData = await fetchProblemById(data.problem_id);
          setProblem(problemData);
        } catch (err) {
          console.error('Error fetching problem:', err);
        }
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load submission. Please try again later.');
      console.error('Error fetching submission:', err);
    } finally {
      setLoading(false);
    }
  }, [submissionId, problem]);
  
  // Initial data load
  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);
  
  // Polling for status updates
  useEffect(() => {
    // Only poll if the submission is in a non-final state
    if (submission && (submission.status === 'pending' || submission.status === 'processing')) {
      const interval = setInterval(() => {
        fetchSubmission();
      }, 3000); // Poll every 3 seconds
      
      return () => clearInterval(interval);
    }
  }, [submission, fetchSubmission]);
  
  // Render submission feedback section
  const renderFeedback = () => {
    if (!submission) return null;
    
    if (submission.status === 'completed') {
      return submission.feedback ? (
        <FeedbackAnalysis feedback={submission.feedback} />
      ) : (
        <Typography color="text.secondary">
          No detailed feedback is available for this submission.
        </Typography>
      );
    } else if (submission.status === 'failed') {
      return (
        <Alert severity="error">
          There was an error processing your submission. Please try submitting again.
        </Alert>
      );
    } else {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={24} sx={{ mb: 2 }} />
          <Typography color="text.secondary">
            Waiting for evaluation to complete...
          </Typography>
        </Box>
      );
    }
  };
  
  return (
    <Box>
      {loading ? (
        <MooLoading message="Fetching your submission..." />
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : submission ? (
        <>
          {/* Header with navigation */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                component={RouterLink}
                to={`/problems/${submission.problem_id}`}
                sx={{ mb: 2 }}
              >
                Back to Problem
              </Button>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Submission {submission.id}
                {problem && (
                  <Typography variant="h6" component="span" color="text.secondary" sx={{ ml: 2 }}>
                    for {problem.title}
                  </Typography>
                )}
              </Typography>
            </Box>
          </Box>
          
          {/* Submission Status Card */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <StatusChip 
                      status={submission.status} 
                      showRefreshIndicator={true}
                    />
                  </Box>
                  
                  <StatusProgress status={submission.status} />
                  
                  {submission.status === 'completed' && submission.score !== undefined && (
                    <ScoreDisplay score={submission.score} />
                  )}
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <SubmissionMetadata submission={submission} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* Result Mascot */}
          {submission && (
            <Box sx={{ my: 3 }}>
              <MooMascot 
                {...getSubmissionMoo(submission.status, submission.score)}
              />
            </Box>
          )}
          
          {/* Submission Content and Feedback */}
          <Grid container spacing={3}>
            {/* Original Submission */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" component="h2" gutterBottom>
                Your Submission
              </Typography>
              <SubmissionContent submission={submission} />
            </Grid>
            
            {/* Feedback */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" component="h2" gutterBottom>
                Feedback
              </Typography>
              <Paper elevation={0} sx={{ p: 3, bgcolor: theme.palette.grey[50], height: 'calc(100% - 40px)' }}>
                {renderFeedback()}
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : (
        <Alert severity="warning">Submission not found</Alert>
      )}
    </Box>
  );
};

export default SubmissionDetail; 