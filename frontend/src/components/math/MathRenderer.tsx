import React from 'react';
import { Typography, Box } from '@mui/material';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// A simplified version of the Math content renderer that doesn't rely on external modules
// This addresses the module resolution errors with remark-math and rehype-katex
type MathContentProps = {
  content: string;
  containerProps?: React.ComponentProps<typeof Box>;
};

// Helper function to parse and render markdown with LaTeX
const renderWithKaTeX = (content: string): JSX.Element[] => {
  // Split content by LaTeX delimiters
  const parts = [];
  let currentIndex = 0;
  
  // Look for block math first (\\[...\\])
  const blockRegex = /\\\[(.*?)\\\]/g;
  let blockMatch;
  
  while ((blockMatch = blockRegex.exec(content)) !== null) {
    // Add text before the math block
    if (blockMatch.index > currentIndex) {
      parts.push(
        <Typography 
          key={`text-${currentIndex}`} 
          component="div" 
          dangerouslySetInnerHTML={{ __html: content.substring(currentIndex, blockMatch.index) }} 
        />
      );
    }
    
    // Add the math block
    try {
      parts.push(
        <BlockMath key={`block-${blockMatch.index}`} math={blockMatch[1]} />
      );
    } catch (e) {
      console.error('Error rendering block math:', e);
      parts.push(
        <Box key={`error-${blockMatch.index}`} sx={{ color: 'error.main', fontFamily: 'monospace' }}>
          Error rendering: {blockMatch[1]}
        </Box>
      );
    }
    
    currentIndex = blockMatch.index + blockMatch[0].length;
  }
  
  // Handle remaining text and look for inline math (\\(...\\))
  if (currentIndex < content.length) {
    const remainingContent = content.substring(currentIndex);
    const inlineRegex = /\\\((.*?)\\\)/g;
    let inlineParts = [];
    let inlineCurrentIndex = 0;
    let inlineMatch;
    
    while ((inlineMatch = inlineRegex.exec(remainingContent)) !== null) {
      // Add text before the inline math
      if (inlineMatch.index > inlineCurrentIndex) {
        inlineParts.push(
          <span 
            key={`inline-text-${inlineCurrentIndex}`}
            dangerouslySetInnerHTML={{ 
              __html: remainingContent.substring(inlineCurrentIndex, inlineMatch.index) 
            }} 
          />
        );
      }
      
      // Add the inline math
      try {
        inlineParts.push(
          <InlineMath key={`inline-math-${inlineMatch.index}`} math={inlineMatch[1]} />
        );
      } catch (e) {
        console.error('Error rendering inline math:', e);
        inlineParts.push(
          <span key={`inline-error-${inlineMatch.index}`} style={{ color: 'red', fontFamily: 'monospace' }}>
            Error rendering: {inlineMatch[1]}
          </span>
        );
      }
      
      inlineCurrentIndex = inlineMatch.index + inlineMatch[0].length;
    }
    
    // Add any remaining text
    if (inlineCurrentIndex < remainingContent.length) {
      inlineParts.push(
        <span 
          key={`final-text`}
          dangerouslySetInnerHTML={{ 
            __html: remainingContent.substring(inlineCurrentIndex) 
          }} 
        />
      );
    }
    
    // If we found any inline math, wrap it all in Typography
    if (inlineParts.length > 0) {
      parts.push(
        <Typography key={`inline-container-${currentIndex}`} component="div">
          {inlineParts}
        </Typography>
      );
    } else {
      // Otherwise just add the remaining content as regular HTML
      parts.push(
        <Typography 
          key={`text-${currentIndex}`} 
          component="div" 
          dangerouslySetInnerHTML={{ __html: remainingContent }} 
        />
      );
    }
  }
  
  return parts;
};

// Component for rendering markdown with LaTeX math expressions
const MathContent: React.FC<MathContentProps> = ({ content, containerProps }) => {
  return (
    <Box sx={{ overflowX: 'auto' }} {...containerProps}>
      {renderWithKaTeX(content)}
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
  return (
    <Box {...containerProps}>
      {variant === 'block' ? (
        <BlockMath math={latex} />
      ) : (
        <InlineMath math={latex} />
      )}
    </Box>
  );
};

export { MathContent, LaTeXDisplay }; 