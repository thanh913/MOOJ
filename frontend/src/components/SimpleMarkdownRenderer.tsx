import React, { useMemo } from 'react';
import { Typography, Box, Link } from '@mui/material';

interface SimpleMarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * A very basic Markdown renderer that handles simple formatting.
 * This is a temporary solution until the dependency issues with 
 * remark-math and rehype-katex are resolved.
 */
const SimpleMarkdownRenderer: React.FC<SimpleMarkdownRendererProps> = ({ content, className }) => {
  // Memoize the processed content to avoid reprocessing on every render
  const processedContent = useMemo(() => {
    if (!content) return '';
    
    // Basic processing of Markdown
    return processMarkdown(content);
  }, [content]);
  
  return (
    <Box className={className} sx={{ overflowX: 'auto' }}>
      <Typography 
        component="div" 
        variant="body1"
        sx={{
          '& .math-block': {
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            padding: 2,
            borderRadius: 1,
            overflowX: 'auto',
            fontFamily: 'monospace',
            marginY: 2,
          },
          '& .math-inline': {
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            padding: '0 4px',
            borderRadius: 1,
          },
          '& a': {
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
          '& h1': {
            fontSize: '1.8rem',
            fontWeight: 500,
            marginTop: 3,
            marginBottom: 2,
          },
          '& h2': {
            fontSize: '1.5rem',
            fontWeight: 500,
            marginTop: 3,
            marginBottom: 1.5,
          },
          '& h3': {
            fontSize: '1.3rem',
            fontWeight: 500,
            marginTop: 2,
            marginBottom: 1,
          },
          '& p': {
            marginBottom: 1.5,
          },
          '& ul, & ol': {
            paddingLeft: 3,
            marginBottom: 1.5,
          },
          '& li': {
            marginBottom: 0.5,
          },
          '& pre': {
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            padding: 2,
            borderRadius: 1,
            overflowX: 'auto',
            fontFamily: 'monospace',
            marginBottom: 1.5,
          },
          '& code': {
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            padding: '0 4px',
            borderRadius: 1,
          },
        }}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </Box>
  );
};

// Basic processing of Markdown
// This is extremely simplified and only handles a few Markdown features
const processMarkdown = (text: string): string => {
  try {
    let processed = text;
    
    // Handle headers
    processed = processed.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    processed = processed.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    processed = processed.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    
    // Handle bold and italic
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Handle links
    processed = processed.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
    
    // Handle code blocks with ```
    processed = processed.replace(/```(.+?)```/gs, '<pre><code>$1</code></pre>');
    
    // Handle inline code with `
    processed = processed.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // Handle unordered lists
    processed = processed.replace(/^\s*[\-\*]\s+(.+)$/gm, '<li>$1</li>');
    processed = processed.replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>');
    
    // Handle ordered lists
    processed = processed.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
    processed = processed.replace(/(<li>.*<\/li>\n)+/g, match => {
      return match.includes('<ul>') ? match : '<ol>' + match + '</ol>';
    });
    
    // Handle paragraphs (must handle after lists, code blocks, etc.)
    processed = processed.split('\n\n').map(para => {
      if (!para.trim()) return '';
      if (
        para.startsWith('<h') || 
        para.startsWith('<ul') || 
        para.startsWith('<ol') || 
        para.startsWith('<pre')
      ) {
        return para;
      }
      return `<p>${para}</p>`;
    }).join('\n');
    
    // Preserve LaTeX content by wrapping it in specific tags
    // Block LaTeX
    processed = processed.replace(/\$\$(.*?)\$\$/gs, (_, latex) => {
      // Escape HTML entities that might be in the LaTeX
      const escaped = escapeHtml(latex);
      return `<div class="math-block">${escaped}</div>`;
    });
    
    // Inline LaTeX
    processed = processed.replace(/\$(.*?)\$/g, (_, latex) => {
      // Escape HTML entities that might be in the LaTeX
      const escaped = escapeHtml(latex);
      return `<span class="math-inline">${escaped}</span>`;
    });
    
    return processed;
  } catch (error) {
    console.error('Error processing Markdown:', error);
    return `<p>Error rendering content. Please try again later.</p>`;
  }
};

// Helper function to escape HTML entities
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export default SimpleMarkdownRenderer; 