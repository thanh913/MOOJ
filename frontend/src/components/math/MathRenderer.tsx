import React from 'react';
import { Typography, Box } from '@mui/material';

// A simplified version of the Math content renderer that doesn't rely on external modules
// This addresses the module resolution errors with remark-math and rehype-katex
type MathContentProps = {
  content: string;
  containerProps?: React.ComponentProps<typeof Box>;
};

// Component for rendering markdown with LaTeX math expressions
const MathContent: React.FC<MathContentProps> = ({ content, containerProps }) => {
  // Simple implementation that just renders the content with Typography
  // In production, this would use react-markdown with remark-math and rehype-katex
  return (
    <Box sx={{ overflowX: 'auto' }} {...containerProps}>
      <Typography 
        component="div"
        variant="body1" 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </Box>
  );
};

// Simple formatted display of LaTeX (no markdown)
type LaTeXDisplayProps = {
  latex: string;
  variant?: 'inline' | 'block';
  containerProps?: React.ComponentProps<typeof Box>;
};

const LaTeXDisplay: React.FC<LaTeXDisplayProps> = ({ 
  latex, 
  variant = 'block',
  containerProps 
}) => {
  // For block display, wrap in pre tags
  const formattedLatex = variant === 'block' 
    ? `<pre>${latex}</pre>` 
    : latex;
    
  return (
    <MathContent 
      content={formattedLatex}
      containerProps={containerProps}
    />
  );
};

export { MathContent, LaTeXDisplay }; 