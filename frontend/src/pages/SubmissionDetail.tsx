import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Checkbox,
  FormControlLabel,
  FormGroup,
  Snackbar,
  AlertTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { useGetSubmissionByIdQuery, useAppealSubmissionBatchMutation, useAcceptScoreMutation } from '../store/apis/submissionsApi';
import { Submission, ErrorDetail, SubmissionStatus, ErrorAppeal } from '../types/submission';
import { MooLoading, MooMascot, getSubmissionMoo } from '../components/shared/MooComponents';
import { StatusChip, StatusProgress, ScoreDisplay } from '../components/shared/StatusIndicators';
import { MathContent } from '../components/math/MathRenderer';
import LaTeXEditor from '../components/math/LaTeXEditor';

const SubmissionContentDisplay: React.FC<{ submission: Submission }> = ({ submission }) => {
  return (
    <Paper elevation={0} sx={(theme) => ({ p: 3, bgcolor: theme.palette.grey[50], height: '100%', overflowX: 'auto' })}>
      <MathContent content={submission.solution_text} />
    </Paper>
  );
};

type AppealState = {
  [errorId: string]: { 
    selected: boolean; 
    justification: string;
    inputMode: 'text' | 'image';
    imageFile?: File;
    imagePreview?: string;
  };
};

const ErrorCard: React.FC<{ 
  error: ErrorDetail;
  isAppealable: boolean;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  appeal: {
    justification: string;
    inputMode: 'text' | 'image';
    imageFile?: File;
    imagePreview?: string;
  };
  onJustificationChange: (value: string) => void;
  onInputModeChange: (mode: 'text' | 'image') => void;
  onImageChange: (file: File | undefined, preview: string | undefined) => void;
  isLoading: boolean;
}> = ({ 
  error, 
  isAppealable, 
  isSelected, 
  onSelect, 
  appeal, 
  onJustificationChange,
  onInputModeChange,
  onImageChange,
  isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Create a preview URL for the image
      const fileReader = new FileReader();
      fileReader.onload = () => {
        onImageChange(file, fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getStatusColor = () => {
    switch(error.status) {
      case 'resolved': return theme.palette.success.main;
      case 'rejected': return theme.palette.error.main;
      case 'appealing': return theme.palette.warning.main;
      default: return theme.palette.info.main;
    }
  };

  const getStatusText = () => {
    switch(error.status) {
      case 'active': return 'Active';
      case 'appealing': return 'Appealing';
      case 'resolved': return 'Resolved';
      case 'rejected': return 'Rejected';
      case 'overturned': return 'Overturned';
      default: return error.status;
    }
  };

  // Determine card background color based on status
  const getCardBackgroundColor = () => {
    if (isSelected) return 'action.selected';
    
    switch(error.status) {
      case 'appealing': return `${theme.palette.warning.light}20`; // Light yellow background
      case 'rejected': return `${theme.palette.error.light}10`; // Light red background
      default: return 'background.paper';
    }
  };

  // Determine card border color based on status
  const getCardBorderColor = () => {
    if (isSelected) return theme.palette.primary.main;
    
    switch(error.status) {
      case 'appealing': return theme.palette.warning.main;
      case 'rejected': return theme.palette.error.light;
      default: return theme.palette.divider;
    }
  };

  // Allow selecting/appealing if the error is 'active' or 'rejected' and appeals are possible
  const canBeAppealed = isAppealable && (error.status === 'active' || error.status === 'rejected');

  return (
    <Card 
      elevation={isSelected && canBeAppealed ? 2 : 0} 
      sx={{
        mb: 2,
        p: 0,
        transition: 'all 0.3s ease',
        bgcolor: getCardBackgroundColor(),
        borderRadius: '8px',
        borderWidth: error.status === 'appealing' ? 2 : 1,
        borderStyle: 'solid',
        borderColor: getCardBorderColor(),
        '&:hover': {
          boxShadow: canBeAppealed && !isSelected ? 2 : undefined,
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          {canBeAppealed ? (
            <FormControlLabel
              control={
                <Checkbox 
                  checked={isSelected}
                  onChange={(e) => onSelect(e.target.checked)}
                  // Disable checkbox only if loading or already appealing (not if rejected)
                  disabled={isLoading || error.status === 'appealing'}
                  color="primary"
                />
              }
              label={
                <Typography variant="subtitle1" fontWeight={isSelected ? 'bold' : 'normal'} color={isSelected ? 'primary.main' : 'text.primary'}>
                  {error.description}
                </Typography>
              }
              sx={{ alignItems: 'flex-start', flexGrow: 1, mr: 2 }}
            />
          ) : (
            <Typography 
              variant="subtitle1" 
              // Dim rejected errors slightly if they can't be appealed anymore (out of attempts)
              color={error.status === 'resolved' ? 'success.main' : (error.status === 'rejected' && !isAppealable) ? 'text.disabled' : 'text.primary'}
              sx={{ flexGrow: 1, mr: 2 }}
            >
              {error.description}
            </Typography>
          )}
          
          <Chip 
            label={getStatusText()}
            size="small"
            sx={{ 
              bgcolor: `${getStatusColor()}20`, 
              color: getStatusColor(),
              fontWeight: 'bold',
            }}
          />
        </Box>

        {canBeAppealed && isSelected && (
          <Box sx={{ pl: 4, mt: 2 }}>
            <Box sx={{ display: 'flex', mb: 1 }}>
              <Tooltip title="Justify with LaTeX">
                <IconButton 
                  color={appeal.inputMode === 'text' ? 'primary' : 'default'} 
                  onClick={() => onInputModeChange('text')}
                >
                  <TextFieldsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Justify with Image">
                <IconButton 
                  color={appeal.inputMode === 'image' ? 'primary' : 'default'} 
                  onClick={() => onInputModeChange('image')}
                >
                  <ImageIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {appeal.inputMode === 'text' ? (
              <LaTeXEditor
                value={appeal.justification}
                onChange={onJustificationChange}
                label="LaTeX Justification"
                rows={4}
                error={isSelected && !appeal.justification.trim()}
                helperText={isSelected && !appeal.justification.trim() ? "Justification is required" : ""}
                disabled={isLoading}
              />
            ) : (
              <Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  disabled={isLoading}
                />
                
                <Box 
                  sx={{
                    border: '2px dashed',
                    borderColor: appeal.imagePreview ? theme.palette.primary.main : theme.palette.divider,
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: 'rgba(0, 0, 0, 0.02)'
                    },
                    mb: 1,
                  }}
                  onClick={handleBrowseClick}
                >
                  {appeal.imagePreview ? (
                    <img src={appeal.imagePreview} alt="Justification" style={{ maxWidth: '100%', maxHeight: 200 }} />
                  ) : (
                    <Box sx={{ py: 3 }}>
                      <ImageIcon fontSize="large" color="action" />
                      <Typography color="text.secondary" sx={{ mt: 1 }}>
                        Click to upload image justification
                      </Typography>
                    </Box>
                  )}
                </Box>
                {!appeal.imageFile && isSelected && (
                  <Typography variant="caption" color="error">Image justification is required</Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const FeedbackAnalysisDisplay: React.FC<{ 
    submission: Submission;
    onSubmitAppealBatch: (appeals: ErrorAppeal[], appealState: AppealState) => void;
    isLoading: boolean;
}> = ({ submission, onSubmitAppealBatch, isLoading }) => {
  const [appeals, setAppeals] = useState<AppealState>({});
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    setAppeals(prevAppeals => {
      const newAppeals: AppealState = {};
      // Determine which errors should potentially have state managed
      const relevantErrors = (submission.errors ?? []).filter(e => 
        e.status === 'active' || 
        e.status === 'appealing' || 
        (e.status === 'rejected' && submission.status === SubmissionStatus.Appealing && submission.appeal_attempts < 5)
      );

      relevantErrors.forEach(error => {
        if (prevAppeals[error.id]) {
          // Preserve existing state if the error is still relevant
          newAppeals[error.id] = prevAppeals[error.id];
        } else {
          // Initialize state for newly relevant errors
          newAppeals[error.id] = { selected: false, justification: '', inputMode: 'text' };
        }
      });
      return newAppeals;
    });
  }, [submission.errors, submission.status, submission.appeal_attempts]);

  const handleCheckboxChange = (errorId: string, checked: boolean) => {
    setAppeals(prev => ({ 
      ...prev, 
      [errorId]: { ...prev[errorId], selected: checked }
    }));
  };

  const handleJustificationChange = (errorId: string, value: string) => {
    setAppeals(prev => ({
      ...prev, 
      [errorId]: { ...prev[errorId], justification: value }
    }));
  };

  const handleInputModeChange = (errorId: string, mode: 'text' | 'image') => {
    setAppeals(prev => ({
      ...prev, 
      [errorId]: { ...prev[errorId], inputMode: mode }
    }));
  };

  const handleImageChange = (errorId: string, file: File | undefined, preview: string | undefined) => {
    setAppeals(prev => ({
      ...prev, 
      [errorId]: { ...prev[errorId], imageFile: file, imagePreview: preview }
    }));
  };

  const handleSubmit = () => {
    const appealsToSubmit: ErrorAppeal[] = Object.entries(appeals)
      .filter(([_, state]) => {
        if (!state.selected) return false;
        if (state.inputMode === 'text' && !state.justification.trim()) return false;
        if (state.inputMode === 'image' && !state.imageFile) return false;
        return true;
      })
      .map(([errorId, state]) => {
        if (state.inputMode === 'text') {
          return { error_id: errorId, justification: state.justification };
        } else if (state.imageFile) {
          // For now, just send the basic info - image processing will happen in onSubmitAppealBatch
          return { error_id: errorId, justification: `Image: ${state.imageFile.name}` };
        }
        return { error_id: errorId, justification: 'Error: No justification provided' };
      });

    if (appealsToSubmit.length > 0) {
      onSubmitAppealBatch(appealsToSubmit, appeals);
    } else {
      console.warn("No valid appeals selected or justified.");
    }
  };
  
  // Update activeErrors filtering to include rejected only if appeals are possible
  const activeErrors = useMemo(() => 
     (submission.errors ?? []).filter(e => 
        e.status === 'active' || 
        e.status === 'appealing' || 
        (e.status === 'rejected' && submission.status === SubmissionStatus.Appealing && submission.appeal_attempts < 5) // Show rejected only if can appeal
     ), 
     [submission.errors, submission.status, submission.appeal_attempts]
  );

  // Update resolvedErrors filtering to include rejected if appeals are NOT possible
  const resolvedErrors = useMemo(() => 
     (submission.errors ?? []).filter(e => 
        e.status === 'resolved' || 
        (e.status === 'rejected' && submission.status !== SubmissionStatus.Appealing) // Show rejected here if can't appeal
     ),
     [submission.errors, submission.status]
  );
  
  const canSubmit = useMemo(() => 
    Object.entries(appeals).some(([_, state]) => {
      if (!state?.selected) return false;
      if (state.inputMode === 'text' && (!state.justification || !state.justification.trim())) return false;
      if (state.inputMode === 'image' && !state.imageFile) return false;
      return true;
    }), 
    [appeals]
  );

  // Handle tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Count errors by status for tabs
  const activeCnt = activeErrors.length;
  const resolvedCnt = resolvedErrors.length;

  return (
    <Box>
      {submission.feedback ? (
        <Paper elevation={0} sx={() => ({ p: 3, mb: 4, bgcolor: theme.palette.grey[50], borderRadius: '8px' })}>
            <Typography variant="h6" gutterBottom>Feedback</Typography>
            <MathContent content={submission.feedback} />
        </Paper>
      ) : null}
      
      <Typography variant="h5" gutterBottom sx={{ mt: 3, fontWeight: 'medium' }}>
        Identified Issues
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="error status tabs"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label={`Active (${activeCnt})`} 
            disabled={activeCnt === 0}
            iconPosition="start"
          />
          <Tab 
            label={`Resolved (${resolvedCnt})`} 
            disabled={resolvedCnt === 0}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Active errors tab */}
      {tabValue === 0 && (
        <Box>
          {activeErrors.length > 0 ? (
          <FormGroup>
              {activeErrors.map((error) => (
                <ErrorCard
                  key={error.id}
                  error={error}
                  isAppealable={submission.status === SubmissionStatus.Appealing && submission.appeal_attempts < 5}
                  isSelected={appeals[error.id]?.selected || false}
                  onSelect={(selected) => handleCheckboxChange(error.id, selected)}
                  appeal={appeals[error.id] || { justification: '', inputMode: 'text' }}
                  onJustificationChange={(value) => handleJustificationChange(error.id, value)}
                  onInputModeChange={(mode) => handleInputModeChange(error.id, mode)}
                  onImageChange={(file, preview) => handleImageChange(error.id, file, preview)}
                  isLoading={isLoading}
                />
            ))}
          </FormGroup>
          ) : (
            <Alert severity="info" variant="outlined" sx={{ borderRadius: '8px' }}>
              No active issues to display.
            </Alert>
          )}
          
          {submission.status === SubmissionStatus.Appealing && submission.appeal_attempts < 5 && activeErrors.some(e => e.status === 'active' || e.status === 'rejected') && (
            <Button
               variant="contained"
              color="primary"
               onClick={handleSubmit}
               disabled={!canSubmit || isLoading}
               startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              sx={{ mt: 2, borderRadius: '20px', px: 3 }}
             >
               {isLoading ? 'Submitting Appeals...' : 'Submit Selected Appeals'}
             </Button>
          )}
        </Box>
      )}

      {/* Resolved errors tab */}
      {tabValue === 1 && (
        <Box>
          {resolvedErrors.length > 0 ? (
            resolvedErrors.map((error) => (
              <ErrorCard
                key={error.id}
                error={error}
                isAppealable={false}
                isSelected={false}
                onSelect={() => {}}
                appeal={{ justification: '', inputMode: 'text' }}
                onJustificationChange={() => {}}
                onInputModeChange={() => {}}
                onImageChange={() => {}}
                isLoading={false}
              />
            ))
          ) : (
            <Alert severity="info" variant="outlined" sx={{ borderRadius: '8px' }}>
              No resolved issues to display.
            </Alert>
          )}
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
  
  const { data: submission, error: fetchError, isLoading: isFetchingSubmission, isFetching, refetch } = useGetSubmissionByIdQuery(
    submissionId, 
    {
      skip: isNaN(submissionId),
      pollingInterval: 5000, // Re-enable polling
      refetchOnMountOrArgChange: true,
    }
  );
  const [appealSubmissionBatch, { isLoading, error: appealError }] = useAppealSubmissionBatchMutation();
  const [acceptScore, { isLoading: isAccepting, error: acceptError }] = useAcceptScoreMutation();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleShowSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    // Optional: could stop polling explicitly if status becomes final
  }, [submission?.status]);

  const handleAppealBatchSubmit = async (appealsToSubmit: ErrorAppeal[], appealState: AppealState) => {
    if (!submission) return;

    // Process any image-based appeals to convert files to base64
    const processedAppeals = await Promise.all(
      appealsToSubmit.map(async (appeal) => {
        // Find the appeal state from the local state object
        const errorId = appeal.error_id;
        const currentAppealState = appealState[errorId];
        
        if (currentAppealState?.inputMode === 'image' && currentAppealState?.imageFile) {
          return new Promise<ErrorAppeal>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              // Once the file is read, resolve with both justification text and base64 image
              resolve({ 
                error_id: appeal.error_id, 
                justification: currentAppealState.justification || `Image justification for error ${appeal.error_id}`,
                image_justification: reader.result as string
              });
            };
            
            // Make sure imageFile is defined before reading
            if (currentAppealState.imageFile) {
              reader.readAsDataURL(currentAppealState.imageFile);
            } else {
              // If somehow imageFile became undefined, resolve with text justification only
              resolve({ 
                error_id: appeal.error_id, 
                justification: currentAppealState.justification || `Appeal for error ${appeal.error_id}`
              });
            }
          });
        }
        
        // For text-based appeals, return as is
        return appeal;
      })
    );
    
    try {
      await appealSubmissionBatch({ 
          submission_id: submissionId, 
          appeal_batch: { appeals: processedAppeals } 
      }).unwrap();
      handleShowSnackbar("Appeal batch submitted successfully!", 'success');
      refetch();
    } catch (err: any) {
      console.error("Failed to submit appeal batch:", err);
      const message = err?.data?.detail || "Failed to submit appeal batch.";
      handleShowSnackbar(message, 'error');
    }
  };

  const handleAcceptScore = async () => {
    if (!submission) return;
    try {
      await acceptScore({ submission_id: submissionId }).unwrap();
      handleShowSnackbar("Score accepted.", 'success');
      refetch();
    } catch (err: any) { 
      console.error("Failed to accept score:", err);
      const message = err?.data?.detail || "Failed to accept score.";
      handleShowSnackbar(message, 'error');
    }
  };
  
  if (isFetchingSubmission) {
    return <MooLoading message="Loading submission details..." />;
  }

  if (fetchError) {
    let errorDisplayMessage = 'Failed to load submission details.';
    let mooAssetKey: 'pending' | 'failed' = 'failed';
    if (fetchError && 'status' in fetchError) {
        errorDisplayMessage = `Error ${fetchError.status}: ${JSON.stringify(fetchError.data)}`;
        if (fetchError.status === 404) {
             errorDisplayMessage = 'Submission not found.';
             mooAssetKey = 'pending';
        }
    }
    const mooProps = getSubmissionMoo(mooAssetKey); 
    return (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
            <MooMascot {...mooProps} />
            <Alert severity={mooAssetKey === 'failed' ? "error" : "warning"} sx={{ mt: 2 }}>{errorDisplayMessage}</Alert>
            <Button component={RouterLink} to="/problems" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
                Back to Problems
            </Button>
        </Box>
    );
  }

  if (!submission) {
    const mooProps = getSubmissionMoo('pending');
    return (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
            <MooMascot {...mooProps} />
            <Alert severity="warning">Submission not found.</Alert>
            <Button component={RouterLink} to="/problems" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
                Back to Problems
            </Button>
        </Box>
    );
  }

  const isBeingJudged = submission.status === SubmissionStatus.Pending || submission.status === SubmissionStatus.Processing;
  const isAwaitingUserAction = submission.status === SubmissionStatus.Appealing;
  const canAppealNow = isAwaitingUserAction && submission.appeal_attempts < 5;
  const maxAppealsReached = submission.appeal_attempts >= 5;
  const isFinalState = submission.status === SubmissionStatus.Completed || submission.status === SubmissionStatus.EvaluationError; 

  const mooProps = getSubmissionMoo(submission.status, submission.score);

  const mapStatusForChipAndProgress = (status: SubmissionStatus): 'pending' | 'processing' | 'completed' | 'failed' => {
      switch (status) {
          case SubmissionStatus.Appealing:
              return 'processing';
          case SubmissionStatus.EvaluationError:
              return 'failed';
          case SubmissionStatus.Pending:
              return 'pending';
          case SubmissionStatus.Processing:
              return 'processing';
          case SubmissionStatus.Completed:
              return 'completed';
          default:
              console.warn(`Unknown submission status encountered: ${status}`);
              return 'pending';
      }
  };
  const mappedStatus = mapStatusForChipAndProgress(submission.status);

  return (
    <Box>
      <Button component={RouterLink} to={`/problems/${submission.problem_id}`} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Back to Problem
      </Button>
      
      <Paper elevation={2} sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1" fontWeight="medium">
              Submission #{submission.id}
            </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row" sx={{ width: '180px', bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2">Status</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StatusChip status={mappedStatus} />
                {(isBeingJudged || isFetching || isLoading || isAccepting) && (
                      <Box sx={{ ml: 2, flexGrow: 1 }}>
                    <StatusProgress status={mappedStatus} />
                      </Box>
                )}
                 {submission.status === SubmissionStatus.EvaluationError && (
                      <Alert severity="error" variant="outlined" sx={{ ml: 2 }}>
                        Evaluation Error: The judge could not process this submission.
                      </Alert>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell component="th" scope="row" sx={{ bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2">Score</Typography>
                </TableCell>
                <TableCell>
                  {submission.status === SubmissionStatus.Completed && submission.score !== undefined ? (
                    (() => {
                      const score = submission.score || 0;
                      return (
                        <Typography 
                          variant="h4" 
                          component="div" 
                          sx={(theme) => ({ 
                            fontWeight: 'bold', 
                            color: score >= 50 ? theme.palette.success.main : theme.palette.error.main 
                          })}
                        >
                          {score}/100
                        </Typography>
                      );
                    })()
                  ) : (
                    <Typography color="text.secondary">Not scored yet</Typography>
                  )}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell component="th" scope="row" sx={{ bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2">Submission Time</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">
                    {new Date(submission.submitted_at).toLocaleString()}
                  </Typography>
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell component="th" scope="row" sx={{ bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2">Appeal Attempts</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">
                    {submission.appeal_attempts} / 5
                  </Typography>
                </TableCell>
              </TableRow>
              
                {isAwaitingUserAction && (
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2">Awaiting Action</Typography>
                  </TableCell>
                  <TableCell>
                    <Alert 
                      severity="info" 
                      variant="outlined" 
                      sx={{ mb: 0 }}
                      action={ 
                      !maxAppealsReached ? (
                       <Button 
                            color="primary" 
                            variant="contained"
                         size="small"
                         onClick={handleAcceptScore}
                         disabled={isAccepting || isLoading}
                         startIcon={isAccepting ? <CircularProgress size={16}/> : <CheckCircleOutlineIcon/>}
                       >
                         Accept Score
                       </Button>
                       ) : null
                      }
                    >
                     <AlertTitle>Awaiting Action</AlertTitle>
                     {canAppealNow 
                       ? `Errors found. You can appeal (${5 - submission.appeal_attempts} attempts left) or accept the current score.`
                       : `Maximum appeal attempts reached. Accept the score to finalize.`
                     }
                   </Alert>
                  </TableCell>
                </TableRow>
                )}
              
                 {maxAppealsReached && !isFinalState && (
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2">Appeal Status</Typography>
                  </TableCell>
                  <TableCell>
                    <Alert severity="warning" variant="outlined" sx={{ mb: 0 }}>
                      Maximum appeal attempts reached.
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                 <MooMascot {...mooProps} />
             </Box>
      </Paper>
          
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
              <Typography variant="h6" gutterBottom>Submitted Solution</Typography>
              <SubmissionContentDisplay submission={submission} />
      </Paper>
            
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
        {!isBeingJudged ? (
                <FeedbackAnalysisDisplay 
                    submission={submission} 
                    onSubmitAppealBatch={handleAppealBatchSubmit} 
                    isLoading={isLoading}
                />
        ) : (
                <MooLoading message="Evaluation in progress..." />
            )}
      </Paper>

      <Snackbar 
         open={snackbarOpen} 
         autoHideDuration={6000} 
         onClose={() => setSnackbarOpen(false)}
         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SubmissionDetail; 