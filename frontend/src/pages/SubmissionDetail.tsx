import React, { useState, useEffect } from 'react';
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
  TextField,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useGetSubmissionByIdQuery, useAppealSubmissionMutation } from '../store/apis/submissionsApi';
import { Submission, ErrorDetail, SubmissionStatus } from '../types/submission';
import { MooLoading, MooMascot, getSubmissionMoo } from '../components/shared/MooComponents';
import { StatusChip, StatusProgress, ScoreDisplay } from '../components/shared/StatusIndicators';
import { MathContent } from '../components/math/MathRenderer';

const SubmissionContentDisplay: React.FC<{ submission: Submission }> = ({ submission }) => {
  return (
    <Paper elevation={0} sx={(theme) => ({ p: 3, bgcolor: theme.palette.grey[50], height: '100%', overflowX: 'auto' })}>
      <MathContent content={submission.solution_text} />
    </Paper>
  );
};

const FeedbackAnalysisDisplay: React.FC<{ 
    submission: Submission;
    onAppeal: (errorId: string, justification: string) => void;
    isAppealing: boolean;
}> = ({ submission, onAppeal, isAppealing }) => {
  const [appealErrorId, setAppealErrorId] = useState<string | null>(null);
  const [justification, setJustification] = useState<string>('');

  const handleAppealSubmit = () => {
      if (appealErrorId) {
          onAppeal(appealErrorId, justification);
          // Note: Don't reset state here, will be reset in parent component after successful appeal
      }
  }

  return (
    <Box>
      {submission.feedback ? (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Feedback</Typography>
            <MathContent content={submission.feedback} />
        </Box>
      ) : (
        <Typography color="text.secondary" sx={{ mb: 3 }}>No textual feedback provided.</Typography>
      )}
      
      {submission.errors && submission.errors.length > 0 && (
          <Box>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Identified Issues</Typography>
            {submission.errors.map((error: ErrorDetail) => (
                <Card key={error.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="subtitle1" color="error">{error.description}</Typography>
                        {error.location && <Typography variant="body2" color="text.secondary">Location: {error.location}</Typography>}
                        {error.type && <Typography variant="body2" color="text.secondary">Type: {error.type}</Typography>}
                        {error.severity && <Typography variant="body2" color="text.secondary">Severity: {error.severity}</Typography>}
                        {error.status && <Typography variant="body2" color="text.secondary">Status: {error.status}</Typography>}
                        
                        {error.status === 'active' && (
                            appealErrorId === error.id ? (
                                <Box sx={{ mt: 2 }}>
                                    <TextField 
                                        fullWidth 
                                        label="Appeal Justification"
                                        multiline
                                        rows={3}
                                        value={justification}
                                        onChange={(e) => setJustification(e.target.value)}
                                        sx={{ mb: 1 }}
                                        disabled={isAppealing}
                                    />
                                    <Button 
                                        size="small" 
                                        variant="contained" 
                                        onClick={handleAppealSubmit} 
                                        disabled={!justification.trim() || isAppealing}
                                    >
                                        {isAppealing ? 'Submitting...' : 'Submit Appeal'}
                                    </Button>
                                    <Button 
                                        size="small" 
                                        onClick={() => setAppealErrorId(null)} 
                                        sx={{ ml: 1 }}
                                        disabled={isAppealing}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            ) : (
                                <Button 
                                    size="small" 
                                    variant="outlined" 
                                    onClick={() => { setAppealErrorId(error.id); setJustification(''); }} 
                                    sx={{ mt: 1 }}
                                    disabled={isAppealing}
                                >
                                    Appeal this issue
                                </Button>
                            )
                        )}
                    </CardContent>
                </Card>
            ))}
          </Box>
      )}
    </Box>
  );
};

const SubmissionMetadataDisplay: React.FC<{ submission: Submission }> = ({ submission }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch (e) {
        return dateString;
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary">Submission Time</Typography>
      <Typography variant="body1">{formatDate(submission.submitted_at)}</Typography>
    </Box>
  );
};

const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const submissionId = Number(id);
  
  const [appealErrorId, setAppealErrorId] = useState<string | null>(null);
  const [justification, setJustification] = useState<string>('');

  const { data: submission, error: fetchError, isLoading, isFetching, refetch } = useGetSubmissionByIdQuery(
    submissionId, 
    {
      skip: isNaN(submissionId),
    }
  );

  const [appealSubmission, { isLoading: isAppealing }] = useAppealSubmissionMutation();

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    if (submission && (submission.status === SubmissionStatus.Pending || submission.status === SubmissionStatus.Processing)) {
        intervalId = setInterval(() => {
            refetch();
        }, 5000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [submission, refetch]);

  const handleAppeal = async (errorId: string, justification: string) => {
      try {
          await appealSubmission({ 
              submission_id: submissionId, 
              error_id: errorId, 
              justification 
          }).unwrap();
          // Show success message (placeholder)
          alert("Appeal submitted successfully!");
          setAppealErrorId(null);
          setJustification('');
      } catch (err) {
          console.error("Failed to submit appeal:", err);
          // Show error to user (placeholder)
          alert("Failed to submit appeal.");
      }
  }
  
  if (isLoading) {
    return <MooLoading message="Loading submission details..." />;
  }

  if (fetchError) {
    const errorMessage = 
      fetchError && 'status' in fetchError 
        ? `Error ${fetchError.status}: ${JSON.stringify(fetchError.data)}` 
        : 'Failed to load submission details.';
    return (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
            <MooMascot {...getSubmissionMoo('failed')} />
            <Alert severity="error">{errorMessage}</Alert>
            <Button component={RouterLink} to="/problems" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
                Back to Problems
            </Button>
        </Box>
    );
  }

  if (!submission) {
    return (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
            <MooMascot {...getSubmissionMoo('pending')} />
            <Alert severity="warning">Submission not found.</Alert>
            <Button component={RouterLink} to="/problems" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
                Back to Problems
            </Button>
        </Box>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch (e) {
        return dateString;
    }
  };

  return (
    <Box>
      <Button component={RouterLink} to={`/problems/${submission.problem_id}`} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Back to Problem
      </Button>
      
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h5" component="h1" gutterBottom>
              Submission #{submission.id}
            </Typography>
            <Box sx={{ mb: 3 }}>
                <StatusChip status={submission.status} />
                {(submission.status === SubmissionStatus.Pending || submission.status === SubmissionStatus.Processing || isFetching) && (
                    <StatusProgress status={submission.status} />
                )}
            </Box>
            {submission.status === SubmissionStatus.Completed && submission.score !== undefined && (
              <Box sx={{ mb: 3 }}>
                <ScoreDisplay score={submission.score} />
              </Box>
            )}
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Submission Time</Typography>
              <Typography variant="body1">{formatDate(submission.submitted_at)}</Typography>
            </Box>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <MooMascot {...getSubmissionMoo(submission.status, submission.score)} />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Submitted Solution</Typography>
              <SubmissionContentDisplay submission={submission} />
            </Box>
            
            <Divider sx={{ my: 3 }} />

            {submission.status === SubmissionStatus.Completed && (
                <FeedbackAnalysisDisplay 
                    submission={submission} 
                    onAppeal={handleAppeal} 
                    isAppealing={isAppealing}
                />
            )}
            {submission.status === SubmissionStatus.Failed && (
                <Alert severity="error">Evaluation failed. Please try submitting again later or contact support.</Alert>
            )}
             {(submission.status === SubmissionStatus.Pending || submission.status === SubmissionStatus.Processing) && (
                <MooLoading message="Evaluation in progress..." />
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SubmissionDetail; 