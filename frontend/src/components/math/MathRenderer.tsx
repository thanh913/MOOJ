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
  const parts: JSX.Element[] = [];
  // Regex to find block or inline math delimiters
  // Captures the content inside: group 1 for block, group 2 for inline
  const regex = /(\\\[.*?\]|\\\(.*?\\\))/g;
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = regex.exec(content)) !== null) {
    // Add the text segment before the math
    if (match.index > lastIndex) {
      parts.push(
        <Typography key={`text-${keyIndex++}`} component="span">
          {content.substring(lastIndex, match.index)}
        </Typography>
      );
    }

    const mathContent = match[1]; // The captured full math segment, e.g., \[E=mc^2\] or \(ax^2+b=0\)

    try {
      if (mathContent.startsWith('\\\[')) {
        // Block Math
        const blockContent = mathContent.slice(2, -2); // Remove \[ and \]
        parts.push(
          // Wrap BlockMath in Typography for proper block display behavior
          <Typography key={`block-${keyIndex++}`} component="div" sx={{ textAlign: 'center', my: 1 }}>
             <BlockMath math={blockContent} />
          </Typography>
        );
      } else if (mathContent.startsWith('\\\(')) {
        // Inline Math
        const inlineContent = mathContent.slice(2, -2); // Remove \( and \)
        parts.push(
          <InlineMath key={`inline-${keyIndex++}`} math={inlineContent} />
        );
      } else {
         // Should not happen with the regex, but handle as text if it does
         parts.push(<span key={`unknown-${keyIndex++}`}>{mathContent}</span>);
      }
    } catch (e) {
      console.error('Error rendering math:', e);
      // Add error message inline
      parts.push(
        <Box key={`error-${keyIndex++}`} component="span" sx={{ color: 'error.main', fontFamily: 'monospace' }}>
          {`[KaTeX Error: ${mathContent}]`}
        </Box>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Add any remaining text after the last match
  if (lastIndex < content.length) {
    parts.push(
      <Typography key={`text-${keyIndex++}`} component="span">
        {content.substring(lastIndex)}
      </Typography>
    );
  }

  // Wrap all parts in a single Typography container for consistent styling if needed,
  // or return the array directly if parent handles spacing.
  // Returning array directly for flexibility.
  return parts;
};

// Component for rendering markdown with LaTeX math expressions
const MathContent: React.FC<MathContentProps> = ({ content, containerProps }) => {
  const renderedParts = renderWithKaTeX(content);
  return (
    // Use a Box that allows flow layout; Typography was forcing block context
    <Box sx={{ overflowX: 'auto', lineHeight: 1.7 }} {...containerProps}>
      {renderedParts.map((part, index) => (
        // Render each part; spans/InlineMath will flow, Typography[component=div]/BlockMath will break line
        <React.Fragment key={index}>{part}</React.Fragment>
      ))}
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