import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

type MascotProps = {
  emoji: string;
  message: string;
  submessage?: string;
  size?: 'small' | 'medium' | 'large';
};

// Base component for all Moo mascot appearances
export const MooMascot: React.FC<MascotProps> = ({ emoji, message, submessage, size = 'medium' }) => {
  const emojiSize = size === 'small' ? '2rem' : size === 'large' ? '4rem' : '3rem';
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
      <Box 
        component="span" 
        role="img" 
        aria-label="mascot" 
        sx={{ 
          fontSize: emojiSize, 
          mb: 2,
          animation: 'bounce 2s infinite ease-in-out'
        }}
      >
        {emoji}
      </Box>
      <Typography variant="body1" align="center" color="text.secondary">
        {message}
      </Typography>
      {submessage && (
        <Typography variant="caption" align="center" color="text.secondary" sx={{ mt: 1 }}>
          {submessage}
        </Typography>
      )}
    </Box>
  );
};

// Loading state with Moo mascot
export const MooLoading: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
    <MooMascot 
      emoji="🐄" 
      message={message}
      submessage="Our mathematical cow is working hard!"
    />
    <CircularProgress data-testid="main-loader" size={24} sx={{ mt: 1 }} />
  </Box>
);

// Empty state with Moo mascot
export const MooEmpty: React.FC<{ message?: string }> = ({ message = 'No items found.' }) => (
  <MooMascot 
    emoji="🐄" 
    message={message}
    submessage="Try different filters or come back later!"
  />
);

// Success state with Moo mascot
export const MooSuccess: React.FC<{ message?: string }> = ({ message = 'Success!' }) => (
  <MooMascot 
    emoji="🥳🐄" 
    message={message}
    size="large"
  />
);

// Error state with Moo mascot
export const MooError: React.FC<{ message?: string }> = ({ message = 'Something went wrong.' }) => (
  <MooMascot 
    emoji="😓🐄" 
    message={message}
    submessage="Please try again later."
  />
);

// Get the appropriate Moo mascot based on submission status and score
export const getSubmissionMoo = (status: string, score?: number) => {
  if (status === 'completed') {
    if (score === undefined) {
      // Should ideally not happen, but handle gracefully
      return { emoji: '🤔🐄', message: 'Evaluation complete.' };
    }
    if (score >= 90) {
      return { emoji: '🥳🐄', message: 'Excellent work! Your solution is correct!' };
    } else if (score >= 70) {
      return { emoji: '😊🐄', message: 'Good job! Solution is mostly correct.' };
    } else if (score >= 50) {
      return { emoji: '🤔🐄', message: 'Solution has some correct elements, but needs improvement.' };
    } else {
      // Completed, but low score (potentially after rejected appeals)
      return { emoji: '😕🐄', message: 'Completed, but significant errors remain.' };
    }
  } else if (status === 'failed' || status === 'evaluation_error') {
    return {
      emoji: '😓🐄',
      message: 'There was an issue evaluating your submission. Please try again.'
    };
  } else if (status === 'processing') {
    return {
      emoji: '⏳🐄',
      message: 'Your submission is being processed...'
    };
  } else if (status === 'pending') {
    return {
      emoji: '🐄',
      message: 'Your submission is waiting to be evaluated.'
    };
  } else if (status === 'appealing') {
    return {
      emoji: '🤔🐄',
      message: 'Review the feedback & decide whether to appeal or accept score.'
    };
  } else {
    // Default case for any other status
    return {
      emoji: '🐄',
      message: 'Your submission has been received.'
    };
  }
}; 