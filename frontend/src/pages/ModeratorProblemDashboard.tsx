import React from 'react';
import { Container, Typography, Box } from '@mui/material';
// Import the problem list component we will create next
import ModeratorProblemList from '../components/moderator/ModeratorProblemList';

const ModeratorProblemDashboard: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Moderator Problem Dashboard
        </Typography>
        <Typography paragraph>
          Manage problems: create new ones, edit existing ones, and manage their visibility.
        </Typography>
        <ModeratorProblemList />
      </Box>
    </Container>
  );
};

export default ModeratorProblemDashboard; 