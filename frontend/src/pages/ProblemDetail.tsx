import React, { useState, useRef } from 'react';
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
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import SimpleMarkdownRenderer from '../components/SimpleMarkdownRenderer';
import { MathContent } from '../components/math/MathRenderer';
import LaTeXEditor from '../components/math/LaTeXEditor';
import { useGetProblemByIdQuery } from '../store/apis/problemsApi';
import { useCreateSubmissionMutation } from '../store/apis/submissionsApi';
import { Problem } from '../types/problem';
import { Submission } from '../types/submission';

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const problemId = Number(id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: problem, error: fetchError, isLoading } = useGetProblemByIdQuery(problemId, {
    skip: isNaN(problemId),
  });
  const [createSubmission, { isLoading: isSubmitting, error: submitError }] = useCreateSubmissionMutation();
  
  const [activeTab, setActiveTab] = useState<number>(0);
  const [solutionText, setSolutionText] = useState<string>('');
  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleInputModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'text' | 'image') => {
    if (newMode !== null) {
      setInputMode(newMode);
      // Reset the other input type when switching
      if (newMode === 'text') {
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        setSolutionText('');
      }
    }
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Create a preview URL for the image
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };
  
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleSolutionTextChange = (value: string) => {
    setSolutionText(value);
  };
  
  const handleSubmit = async () => {
    try {
      let submissionResult: Submission;
      
      if (inputMode === 'text') {
        // Text submission
        if (!solutionText.trim()) {
          console.warn('Submission text cannot be empty');
          return;
        }
        
        submissionResult = await createSubmission({ 
          problem_id: problemId, 
          solution_text: solutionText 
        }).unwrap();
      } else {
        // Image submission
        if (!selectedFile) {
          console.warn('No image selected');
          return;
        }
        
        const formData = new FormData();
        formData.append('problem_id', problemId.toString());
        formData.append('image_file', selectedFile);
        
        submissionResult = await createSubmission(formData).unwrap();
      }
      
      if (submissionResult && submissionResult.id) {
        navigate(`/submissions/${submissionResult.id}`);
      } else {
        console.error('Submission creation succeeded but no ID received.');
      }
    } catch (err) {
      console.error('Failed to submit solution:', err);
    }
  };
  
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
  
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return theme.palette.success.main;
    if (difficulty <= 6) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  if (isLoading) {
    return <CircularProgress />;
  }

  if (fetchError || !problem) {
     const errorMessage = 
      fetchError ? (
        // Handle different types of errors
        'status' in fetchError ? 
          // API errors
          `Error ${fetchError.status}: ${JSON.stringify(fetchError.data)}` : 
          // Network errors
          fetchError.status === 'FETCH_ERROR' ? 
            'Network error: Unable to connect to the server. Please check your connection and try again.' :
            'Failed to load problem details.'
      ) : 'Failed to load problem details.';
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 600 }}>{errorMessage}</Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </Box>
    );
  }

  const renderProblemTab = () => {
    if (!problem) return null;
    
    return (
      <Box>
        <MathContent content={problem.statement} />
      </Box>
    );
  };
  
  const renderSubmissionTab = () => {
    const apiErrorMessage = submitError ? (
        ('status' in submitError ? 
         `API Error (${submitError.status}): ${JSON.stringify(submitError.data)}` : 
         (submitError as any).message) || 'Failed to submit'
    ) : null;

    return (
      <Box sx={{ mt: 2 }}>
        <Card sx={{ mb: 3, p: 2 }}>
          <CardContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Your Solution
              </Typography>
              
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup
                  value={inputMode}
                  exclusive
                  onChange={handleInputModeChange}
                  aria-label="solution input mode"
                >
                  <ToggleButton value="text" aria-label="text input">
                    <EditIcon sx={{ mr: 1 }} />
                    Type LaTeX
                  </ToggleButton>
                  <ToggleButton value="image" aria-label="image upload">
                    <ImageIcon sx={{ mr: 1 }} />
                    Upload Image
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              {inputMode === 'text' && (
                <LaTeXEditor
                  value={solutionText}
                  onChange={handleSolutionTextChange}
                  label="Enter your solution in LaTeX"
                  disabled={isSubmitting}
                  error={!!submitError}
                  helperText={apiErrorMessage || ''}
                  rows={10}
                />
              )}
              
              {inputMode === 'image' && (
                <Box>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                  
                  <Box 
                    sx={{
                      border: '2px dashed #ccc',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: '#f8f9fa',
                      mb: 2,
                    }}
                  >
                    {previewUrl ? (
                      <Box>
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '300px',
                            borderRadius: '4px',
                            marginBottom: '16px'
                          }} 
                        />
                        <Typography variant="body2" color="text.secondary" paragraph>
                          The system will convert your handwritten math to LaTeX for evaluation.
                        </Typography>
                        <Button 
                          variant="outlined" 
                          onClick={handleBrowseClick}
                          disabled={isSubmitting}
                        >
                          Change Image
                        </Button>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          Drag & drop an image or click to browse
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Upload an image of your handwritten mathematical solution.
                          We'll convert it to LaTeX using OCR.
                        </Typography>
                        <Button 
                          variant="contained" 
                          onClick={handleBrowseClick}
                          disabled={isSubmitting}
                        >
                          Browse Files
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || (inputMode === 'text' ? !solutionText.trim() : !selectedFile)}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Solution'}
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
              Use LaTeX notation for mathematical expressions or upload an image of your handwritten solution.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Use $ for inline math (e.g. $x+y=z$) and $$ for display math (e.g. $$\int_a^b f(x)dx$$).
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Your submission will be evaluated asynchronously.
            </Typography>
          </li>
        </ul>
      </Box>
    );
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md>
          <Typography variant="h4" component="h1" gutterBottom>
            {problem.title}
          </Typography>
        </Grid>
        <Grid item xs={12} md="auto">
          <Chip 
            label={getDifficultyLabel(problem.difficulty)}
            size="medium"
            sx={{ 
              backgroundColor: getDifficultyColor(problem.difficulty),
              color: theme.palette.getContrastText(getDifficultyColor(problem.difficulty)),
              fontWeight: 'bold',
            }} 
          />
        </Grid>
      </Grid>
      
      {problem.topics && problem.topics.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {problem.topics.map((topic) => (
            <Chip key={topic} label={topic} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
          ))}
        </Box>
      )}

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Problem details tabs">
          <Tab label="Problem Statement" />
          <Tab label="Submit Solution" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderProblemTab()}
      {activeTab === 1 && renderSubmissionTab()}

    </Paper>
  );
};

export default ProblemDetail; 