import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  useTheme,
} from '@mui/material';
import SimpleMarkdownRenderer from '../components/SimpleMarkdownRenderer';
import { fetchProblemById, createSubmission } from '../services/api';

// Interface for the problem data
interface Problem {
  id: number;
  title: string;
  statement: string;
  difficulty: number;
  topics: string[];
  created_at: string;
}

// Interface for submission data
interface SubmissionData {
  problem_id: number;
  content_type: 'direct' | 'image';
  content: string;
}

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const problemId = Number(id);
  
  // States
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [submissionType, setSubmissionType] = useState<'direct' | 'image'>('direct');
  const [directInput, setDirectInput] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      if (isNaN(problemId)) {
        setError('Invalid problem ID');
        setLoading(false);
        return;
      }
      
      try {
        const data = await fetchProblemById(problemId);
        setProblem(data);
        setError(null);
      } catch (err) {
        setError('Failed to load problem. Please try again later.');
        console.error('Error fetching problem:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProblem();
  }, [problemId]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle submission type change
  const handleSubmissionTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubmissionType(event.target.value as 'direct' | 'image');
  };
  
  // Handle direct input change
  const handleDirectInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDirectInput(event.target.value);
  };
  
  // Handle image URL change
  const handleImageUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
  };
  
  // Handle submission
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      const content = submissionType === 'direct' ? directInput : imageUrl;
      
      if (!content.trim()) {
        setSubmitError('Please provide a submission');
        setSubmitting(false);
        return;
      }
      
      const submissionData: SubmissionData = {
        problem_id: problemId,
        content_type: submissionType,
        content,
      };
      
      const submission = await createSubmission(submissionData);
      
      // Navigate to the submission detail page
      navigate(`/submissions/${submission.id}`);
    } catch (err) {
      setSubmitError('Failed to submit solution. Please try again.');
      console.error('Error submitting solution:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Get difficulty label
  const getDifficultyLabel = (difficulty: number) => {
    const labels: Record<number, string> = {
      1: 'Very Easy',
      2: 'Easy',
      3: 'Somewhat Easy',
      4: 'Medium-Easy',
      5: 'Medium',
      6: 'Medium-Hard',
      7: 'Somewhat Hard',
      8: 'Hard',
      9: 'Very Hard',
    };
    
    return labels[difficulty] || `Level ${difficulty}`;
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return theme.palette.success.main;
    if (difficulty <= 6) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  // Render problem statement tab
  const renderProblemTab = () => {
    if (!problem) return null;
    
    return (
      <Box>
        <SimpleMarkdownRenderer content={problem.statement} />
      </Box>
    );
  };
  
  // Render submission tab
  const renderSubmissionTab = () => {
    return (
      <Box sx={{ mt: 2 }}>
        <Card sx={{ mb: 3, p: 2 }}>
          <CardContent>
            <FormControl component="fieldset">
              <FormLabel component="legend">Submission Type</FormLabel>
              <RadioGroup
                row
                name="submission-type"
                value={submissionType}
                onChange={handleSubmissionTypeChange}
              >
                <FormControlLabel value="direct" control={<Radio />} label="Direct Input (LaTeX)" />
                <FormControlLabel value="image" control={<Radio />} label="Image URL" />
              </RadioGroup>
            </FormControl>
            
            {submissionType === 'direct' ? (
              <TextField
                label="Enter your solution in LaTeX"
                multiline
                rows={10}
                fullWidth
                value={directInput}
                onChange={handleDirectInputChange}
                sx={{ mt: 2 }}
                placeholder="Enter your mathematical solution using LaTeX notation..."
              />
            ) : (
              <TextField
                label="Image URL"
                fullWidth
                value={imageUrl}
                onChange={handleImageUrlChange}
                sx={{ mt: 2 }}
                placeholder="Paste the URL of your solution image..."
                helperText="Upload your handwritten solution image and paste the URL here"
              />
            )}
            
            {submitError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {submitError}
              </Alert>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : null}
              >
                {submitting ? 'Submitting...' : 'Submit Solution'}
              </Button>
            </Box>
          </CardContent>
        </Card>
        
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Submission Guidelines:
        </Typography>
        <ul>
          <li>
            <Typography variant="body2">
              For direct input, use LaTeX notation for mathematical expressions.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              For image submissions, ensure your handwriting is clear and legible.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Show all steps of your solution for better evaluation.
            </Typography>
          </li>
        </ul>
      </Box>
    );
  };
  
  return (
    <Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : problem ? (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {problem.title}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label={getDifficultyLabel(problem.difficulty)}
                sx={{ bgcolor: getDifficultyColor(problem.difficulty), color: 'white' }}
              />
              
              {problem.topics.map((topic) => (
                <Chip key={topic} label={topic} variant="outlined" />
              ))}
            </Box>
          </Box>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="problem tabs">
              <Tab label="Problem" id="problem-tab-0" aria-controls="problem-tabpanel-0" />
              <Tab label="Submit" id="problem-tab-1" aria-controls="problem-tabpanel-1" />
            </Tabs>
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 0} id="problem-tabpanel-0">
            {activeTab === 0 && renderProblemTab()}
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 1} id="problem-tabpanel-1">
            {activeTab === 1 && renderSubmissionTab()}
          </Box>
        </>
      ) : (
        <Alert severity="warning">Problem not found</Alert>
      )}
    </Box>
  );
};

export default ProblemDetail; 