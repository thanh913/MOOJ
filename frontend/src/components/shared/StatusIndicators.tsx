import React from 'react';
import { Chip, Box, Typography, LinearProgress, Theme } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';

type StatusChipProps = {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  showRefreshIndicator?: boolean;
};

export const StatusChip: React.FC<StatusChipProps> = ({ status, showRefreshIndicator = false }) => {
  const getStatusColor = (theme: Theme, status: string) => {
    const statusColors: Record<string, string> = {
      pending: theme.palette.warning.main,
      processing: theme.palette.info.main,
      completed: theme.palette.success.main,
      failed: theme.palette.error.main,
    };
    
    return statusColors[status] || theme.palette.grey[500];
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip 
        label={status.toUpperCase()}
        sx={(theme) => ({ 
          bgcolor: getStatusColor(theme, status),
          color: 'white',
          fontWeight: 'bold',
        })}
      />
      {showRefreshIndicator && (status === 'pending' || status === 'processing') && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TimerIcon fontSize="small" />
          Refreshing automatically...
        </Typography>
      )}
    </Box>
  );
};

type StatusProgressProps = {
  status: 'pending' | 'processing' | 'completed' | 'failed';
};

export const StatusProgress: React.FC<StatusProgressProps> = ({ status }) => {
  const getProgressValue = (status: string) => {
    const values: Record<string, number> = {
      pending: 25,
      processing: 65,
      completed: 100,
      failed: 100,
    };
    
    return values[status] || 0;
  };

  if (status !== 'pending' && status !== 'processing') {
    return null;
  }

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <LinearProgress variant="determinate" value={getProgressValue(status)} />
    </Box>
  );
};

type ScoreDisplayProps = {
  score: number;
};

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  const getScoreColor = (theme: Theme, score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.success.light;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Score
      </Typography>
      <Typography 
        variant="h3" 
        component="div" 
        sx={(theme) => ({ fontWeight: 'bold', color: getScoreColor(theme, score) })}
      >
        {score}/100
      </Typography>
    </Box>
  );
}; 