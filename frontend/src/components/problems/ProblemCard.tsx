import React from 'react';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Tooltip,
  styled,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { Problem } from '../../types/problem';
import { getDifficultyColor, getDifficultyLabel } from '../../utils/problemUtils'; // Import centralized functions

// Styled components for visual elements
const DifficultyBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  borderRadius: '50%',
  width: 36,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  color: theme.palette.common.white,
  boxShadow: theme.shadows[2],
}));

interface ProblemCardProps {
  problem: Problem;
  onClick: (id: number) => void;
}

const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  onClick,
}) => {
  const difficultyColor = getDifficultyColor(problem.difficulty);
  const difficultyLabel = getDifficultyLabel(problem.difficulty);
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardActionArea 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'stretch',
          height: '100%',
        }}
        onClick={() => onClick(problem.id)}
      >
        <CardContent sx={{ flexGrow: 1, pb: 2 }}>
          {/* Difficulty Badge */}
          <Tooltip title={`${difficultyLabel} (${problem.difficulty.toFixed(1)})`}>
            <DifficultyBadge sx={{ bgcolor: difficultyColor }}>
              {problem.difficulty.toFixed(1)}
            </DifficultyBadge>
          </Tooltip>
          
          {/* Title */}
          <Typography 
            variant="h6" 
            component="h2" 
            gutterBottom 
            noWrap 
            sx={{ 
              mr: 5, 
              fontWeight: 'bold',
              transition: 'color 0.2s',
            }}
          >
            {problem.title}
          </Typography>
          
          {/* Topic Chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {(problem.topics ?? []).map((topic) => (
              <Chip 
                key={topic} 
                label={topic} 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(0, 0, 0, 0.05)', 
                  fontSize: '0.7rem',
                  height: 22,
                }} 
              />
            ))}
          </Box>
          
          {/* Statistics */}
          {/* Remove this section as data is not available */}
          {/* <Box sx={{ mt: 'auto' }}> */}
            {/* Success Rate */}
            {/* <Box sx={{ mb: 1.5 }}> */}
              {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}> */}
                {/* <Typography variant="body2" color="text.secondary"> */}
                  {/* Success Rate */}
                {/* </Typography> */}
                {/* <Typography variant="body2" fontWeight="medium"> */}
                  {/* {successRate}% */}
                {/* </Typography> */}
              {/* </Box> */}
              {/* <LinearProgress  */}
                {/* variant="determinate"  */}
                {/* value={successRate}  */}
                {/* sx={{ */} 
                  {/* height: 6, */}
                  {/* borderRadius: 3, */}
                  {/* bgcolor: 'rgba(0, 0, 0, 0.05)', */}
                  {/* '& .MuiLinearProgress-bar': { */}
                    {/* bgcolor: successRate > 70 ? '#4caf50' : successRate > 40 ? '#ff9800' : '#f44336', */}
                    {/* borderRadius: 3, */}
                  {/* }, */} 
                {/* }} */} 
              {/* /> */} 
            {/* </Box> */} 
            
            {/* Metadata */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Tooltip title="Created on">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5, fontSize: '1rem' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(problem.created_at)}
                  </Typography>
                </Box>
              </Tooltip>
              
              {/* Remove Attempts section */}
              {/* <Tooltip title="Attempts"> */}
                {/* <Box sx={{ display: 'flex', alignItems: 'center' }}> */}
                  {/* <AssignmentTurnedInIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5, fontSize: '1rem' }} /> */}
                  {/* <Typography variant="caption" color="text.secondary"> */}
                    {/* {attemptCount} */}
                  {/* </Typography> */}
                {/* </Box> */}
              {/* </Tooltip> */}
            </Box>
          {/* </Box> */}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProblemCard; 