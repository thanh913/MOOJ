import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Tabs,
  Tab,
  Grid,
  Divider,
} from '@mui/material';
import { MathContent } from './MathRenderer';

interface LaTeXEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  rows?: number;
}

const LaTeXEditor: React.FC<LaTeXEditorProps> = ({
  value,
  onChange,
  label = 'LaTeX Content',
  error = false,
  helperText = '',
  disabled = false,
  rows = 10,
}) => {
  const [tabValue, setTabValue] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 0, overflow: 'hidden' }}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="LaTeX editor tabs"
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Editor" />
        <Tab label="Preview" />
        <Tab label="Split View" />
      </Tabs>

      {/* Editor Only */}
      {tabValue === 0 && (
        <Box sx={{ p: 2 }}>
          <TextField
            label={label}
            multiline
            rows={rows}
            fullWidth
            value={value}
            onChange={(e) => onChange(e.target.value)}
            error={error}
            helperText={helperText}
            disabled={disabled}
            sx={{ 
              '& .MuiInputBase-root': { 
                fontFamily: 'monospace',
              },
            }}
            placeholder="Enter your content using Markdown and LaTeX notation. Use $ for inline math and $$ for block equations."
          />
        </Box>
      )}

      {/* Preview Only */}
      {tabValue === 1 && (
        <Box sx={{ p: 2, minHeight: `${rows * 24}px` }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Preview
          </Typography>
          <Paper 
            elevation={0} 
            sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: `${rows * 20}px` }}
          >
            {value ? (
              <MathContent content={value} />
            ) : (
              <Typography color="text.secondary" fontStyle="italic">
                Enter content in the editor to see preview
              </Typography>
            )}
          </Paper>
        </Box>
      )}

      {/* Split View */}
      {tabValue === 2 && (
        <Grid container spacing={0}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, borderRight: { md: 1 }, borderColor: 'divider' }}>
              <TextField
                label={label}
                multiline
                rows={rows}
                fullWidth
                value={value}
                onChange={(e) => onChange(e.target.value)}
                error={error}
                helperText={helperText}
                disabled={disabled}
                sx={{ 
                  '& .MuiInputBase-root': { 
                    fontFamily: 'monospace',
                  },
                }}
                placeholder="Enter your content using Markdown and LaTeX notation."
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Preview
              </Typography>
              <Paper 
                elevation={0} 
                sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: `${rows * 20}px` }}
              >
                {value ? (
                  <MathContent content={value} />
                ) : (
                  <Typography color="text.secondary" fontStyle="italic">
                    Enter content in the editor to see preview
                  </Typography>
                )}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default LaTeXEditor; 