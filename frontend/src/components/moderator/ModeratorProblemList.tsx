import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Snackbar,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import {
  useGetProblemsQuery,
  useDeleteProblemMutation,
} from '../../store/apis/problemsApi';
// Import Problem type
import { Problem } from '../../types/problem';
import ProblemFormDialog from './ProblemFormDialog'; // Import the dialog component
import ConfirmationDialog from '../common/ConfirmationDialog'; // Import confirmation dialog

const ModeratorProblemList: React.FC = (): React.ReactElement | null => {
  const { data: problems, error, isLoading, isFetching } = useGetProblemsQuery({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  // State for delete confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState<number | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const [deleteProblem, { isLoading: isDeleting, error: deleteError }] = useDeleteProblemMutation();

  const handleCreate = () => {
    setSelectedProblem(null); // Clear selection for create mode
    setDialogOpen(true); // Open the dialog
  };

  const handleEdit = (problem: Problem) => {
    setSelectedProblem(problem); // Set the problem to edit
    setDialogOpen(true); // Open the dialog
  };

  const handleDelete = (id: number) => {
    setProblemToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (problemToDelete !== null) {
      try {
        await deleteProblem(problemToDelete).unwrap();
        setSnackbarMessage('Problem deleted successfully');
      } catch (err) {
        console.error('Failed to delete problem:', err);
        setSnackbarMessage('Failed to delete problem');
      } finally {
        setConfirmOpen(false);
        setProblemToDelete(null);
      }
    }
  };

  if (isLoading || isFetching) {
    return <CircularProgress />;
  }

  if (error) {
    // Attempt to extract error message
    const errorMessage = 
      ('status' in error ? `Error ${error.status}: ` : '') + 
      (error.data?.detail || error.data || 'Failed to load problems.');
    return <Alert severity="error">{errorMessage}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Problems</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Create Problem
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell align="center">Difficulty</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {problems && problems.length > 0 ? (
              problems.map((problem) => (
                <TableRow
                  key={problem.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {problem.id}
                  </TableCell>
                  <TableCell>{problem.title}</TableCell>
                  <TableCell align="center">{problem.difficulty}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={problem.is_published ? 'Published' : 'Draft'} 
                      color={problem.is_published ? 'success' : 'default'} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(problem)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(problem.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No problems found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Render the dialog */} 
      <ProblemFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        problem={selectedProblem}
      />
    </Box>
  );
};

export default ModeratorProblemList; 