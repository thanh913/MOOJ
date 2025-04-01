import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Link,
  Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useGetSubmissionsQuery } from '../store/apis/submissionsApi';

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

const Submissions: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const { data: submissions, isLoading, error } = useGetSubmissionsQuery({
    skip: page * rowsPerPage,
    limit: rowsPerPage
  });
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Submissions
      </Typography>
      <Paper elevation={2} sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">
            Error loading submissions. Please try again later.
          </Alert>
        ) : !submissions || submissions.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No submissions found. Try solving some problems!
          </Typography>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Problem</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id} hover>
                      <TableCell>
                        <Link component={RouterLink} to={`/submissions/${submission.id}`}>
                          #{submission.id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link component={RouterLink} to={`/problems/${submission.problem_id}`}>
                          Problem #{submission.problem_id}
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
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelDisplayedRows={({ from, to }) => `${from}-${to}`}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Submissions; 