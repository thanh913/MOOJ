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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
  TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import SimpleMarkdownRenderer from '../components/SimpleMarkdownRenderer';
import { MathContent } from '../components/math/MathRenderer';
import LaTeXEditor from '../components/math/LaTeXEditor';
import { useGetProblemByIdQuery } from '../store/apis/problemsApi';
import { useCreateSubmissionMutation, useGetSubmissionsQuery } from '../store/apis/submissionsApi';
import { Problem } from '../types/problem';
import { Submission } from '../types/submission';
import { getDifficultyColor, getDifficultyLabel } from '../utils/problemUtils';
import { formatDistanceToNow } from 'date-fns';
import { Link as RouterLink } from 'react-router-dom';

const SubmissionStatusChip = ({ status }: { status: string }) => {
  let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
  
  switch (status) {
    case 'pending':
      color = 'warning';
      break;
    case 'processing':
    case 'appealing': // Treat appealing like processing for color
      color = 'info';
      break;
    case 'completed':
      color = 'success';
      break;
    case 'evaluation_error': // Map evaluation_error to error color
      color = 'error';
      break;
    // 'failed' case removed
    default:
      color = 'default';
  }
  
  return <Chip size="small" label={status} color={color} />;
};

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
  
  const [submissionsPage, setSubmissionsPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  const { 
    data: problemSubmissions, 
    isLoading: isLoadingSubmissions 
  } = useGetSubmissionsQuery({
    problem_id: problemId,
    skip: submissionsPage * rowsPerPage,
    limit: rowsPerPage
  });
  
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
  
  const handleChangeSubmissionsPage = (event: unknown, newPage: number) => {
    setSubmissionsPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setSubmissionsPage(0);
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
      <Box sx={{ pt: 3, px: 1 }}>
        <Box 
          sx={{ 
            maxWidth: '100%',
            '& .katex-display': {
              // Override KaTeX default overflow behavior
              overflow: 'hidden',
              // Allow breaking on very long equations if needed
              overflowWrap: 'break-word',
            },
            // Increase readability with spacing
            '& p': { mb: 2 }
          }}
        >
          <MathContent 
            content={problem.statement} 
            containerProps={{
              sx: {
                // Remove horizontal scrollbar
                overflowX: 'visible',
                // Add some spacing between paragraphs
                '& > div': { mb: 2 },
                lineHeight: 1.6,
                fontSize: '1.05rem',
              }
            }}
          />
        </Box>
      </Box>
    );
  };
  
  const renderSubmissionsTab = () => {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Submissions for this problem
        </Typography>
        
        {isLoadingSubmissions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : !problemSubmissions || problemSubmissions.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No submissions found for this problem yet. Be the first to submit a solution!
          </Typography>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {problemSubmissions.map((submission) => (
                    <TableRow key={submission.id} hover>
                      <TableCell>
                        <Link component={RouterLink} to={`/submissions/${submission.id}`}>
                          #{submission.id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <SubmissionStatusChip status={submission.status} />
                      </TableCell>
                      <TableCell>
                        {submission.status === 'completed' 
                          ? `${submission.score}/100` 
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={-1}
              rowsPerPage={rowsPerPage}
              page={submissionsPage}
              onPageChange={handleChangeSubmissionsPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelDisplayedRows={({ from, to }) => `${from}-${to}`}
            />
          </>
        )}
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
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: 'rgba(0, 0, 0, 0.02)'
                      },
                      mb: 2,
                    }}
                    onClick={handleBrowseClick}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Selected preview" style={{ maxWidth: '100%', maxHeight: 300 }} />
                    ) : (
                      <Typography color="text.secondary">
                        Click or drag image here
                      </Typography>
                    )}
                  </Box>
                  {selectedFile && (
                    <Typography variant="body2">Selected: {selectedFile.name}</Typography>
                  )}
                  {submitError && (
                    <Alert severity="error" sx={{ mt: 2 }}>{apiErrorMessage}</Alert>
                  )}
                </Box>
              )}
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || (inputMode === 'text' && !solutionText.trim()) || (inputMode === 'image' && !selectedFile)}
                sx={{ mt: 3, float: 'right' }}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Submit Solution'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const difficultyLabel = getDifficultyLabel(problem.difficulty);
  const difficultyColor = getDifficultyColor(problem.difficulty);
  
  return (
    <Box sx={{ my: 4 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {problem.title}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(problem.topics ?? []).map((topic) => (
                <Chip key={topic} label={topic} size="small" />
              ))}
            </Box>
          </Box>
          <Chip 
            label={`${difficultyLabel} (${problem.difficulty.toFixed(1)})`}
            sx={{ 
              bgcolor: difficultyColor,
              color: 'white',
              fontWeight: 'bold' 
            }}
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          indicatorColor="primary" 
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}
        >
          <Tab label="Problem Statement" />
          <Tab label="Submit Solution" />
          <Tab label="Submissions" />
        </Tabs>

        <Box>
          {activeTab === 0 && renderProblemTab()}
          {activeTab === 1 && renderSubmissionTab()}
          {activeTab === 2 && renderSubmissionsTab()}
        </Box>
      </Paper>
    </Box>
  );
};

export default ProblemDetail; 