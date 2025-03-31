import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const MySubmissions: React.FC = () => {
  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Submissions
      </Typography>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          This page is under construction. Your submissions will appear here soon!
        </Typography>
        {/* TODO: Implement submission list fetching and display */}
      </Paper>
    </Box>
  );
};

export default MySubmissions; 