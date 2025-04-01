import React, { useState } from 'react';
import {
  Box,
  Typography,
  Slider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
  Paper,
  Grid,
  IconButton,
  useTheme,
  Collapse,
  Button,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TuneIcon from '@mui/icons-material/Tune';
import { 
  getDifficultyLabel, 
  getDifficultyColor, 
  getDifficultyBackgroundColor 
} from '../../utils/problemUtils'; // Import centralized functions

interface ProblemFiltersProps {
  difficultyRange: [number, number];
  setDifficultyRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  selectedTopics: string[];
  setSelectedTopics: React.Dispatch<React.SetStateAction<string[]>>;
  availableTopics: string[];
  applyFilters: () => void;
  resetFilters: () => void;
}

const ProblemFilters: React.FC<ProblemFiltersProps> = ({
  difficultyRange,
  setDifficultyRange,
  selectedTopics,
  setSelectedTopics,
  availableTopics,
  applyFilters,
  resetFilters,
}) => {
  const theme = useTheme();
  const [showFilters, setShowFilters] = useState(false);

  // Handle difficulty slider change
  const handleDifficultyChange = (event: Event, newValue: number | number[]) => {
    // Use unscaled values directly
    setDifficultyRange(newValue as [number, number]); 
  };

  // Handle topic selection
  const handleTopicChange = (event: SelectChangeEvent<typeof selectedTopics>) => {
    const {
      target: { value },
    } = event;
    setSelectedTopics(typeof value === 'string' ? value.split(',') : value);
  };

  // Handle removing a topic
  const handleRemoveTopic = (topicToRemove: string) => {
    setSelectedTopics(selectedTopics.filter((topic) => topic !== topicToRemove));
  };

  // Get value text for difficulty slider
  const valueLabelFormat = (value: number) => {
    return getDifficultyLabel(value);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Filters
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={showFilters ? <CloseIcon /> : <TuneIcon />}
          onClick={() => setShowFilters(!showFilters)}
          size="small"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </Box>

      <Collapse in={showFilters}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            {/* Difficulty Range Slider */}
            <Grid item xs={12}>
              <Typography gutterBottom>Difficulty Range</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={difficultyRange} // Use unscaled value directly
                  onChange={handleDifficultyChange}
                  valueLabelDisplay="auto"
                  valueLabelFormat={valueLabelFormat}
                  min={1}
                  max={9}
                  step={0.5} 
                  marks={[
                    { value: 1, label: '1' }, 
                    { value: 2, label: '2' },
                    { value: 3, label: '3' }, 
                    { value: 4, label: '4' },
                    { value: 5, label: '5' },
                    { value: 6, label: '6' },
                    { value: 7, label: '7' },
                    { value: 8, label: '8' },
                    { value: 9, label: '9' }
                  ]} 
                  sx={{
                    '& .MuiSlider-thumb': {
                      height: 24,
                      width: 24,
                      backgroundColor: '#fff',
                      border: '2px solid currentColor',
                      '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                        boxShadow: 'inherit',
                      },
                    },
                    '& .MuiSlider-track': {
                      height: 8,
                      borderRadius: 4,
                    },
                    '& .MuiSlider-rail': {
                      height: 8,
                      borderRadius: 4,
                      opacity: 0.5,
                      backgroundColor: '#bfbfbf',
                    },
                    '& .MuiSlider-mark': {
                      backgroundColor: '#bfbfbf',
                      height: 12,
                      width: 2,
                      marginTop: -2,
                    },
                    '& .MuiSlider-markLabel': {
                      fontSize: '0.75rem',
                      marginTop: 5,
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" sx={{ color: getDifficultyColor(difficultyRange[0]) }}> 
                  {getDifficultyLabel(difficultyRange[0])}
                </Typography>
                <Typography variant="body2" sx={{ color: getDifficultyColor(difficultyRange[1]) }}> 
                  {getDifficultyLabel(difficultyRange[1])}
                </Typography>
              </Box>
            </Grid>

            {/* Topic Multi-select */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="topic-select-label">Topics</InputLabel>
                <Select
                  labelId="topic-select-label"
                  id="topic-select"
                  multiple
                  value={selectedTopics}
                  onChange={handleTopicChange}
                  input={<OutlinedInput label="Topics" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.length > 0 ? (
                        selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          All Topics
                        </Typography>
                      )}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 224,
                        width: 250,
                      },
                    },
                  }}
                >
                  {availableTopics.map((topic) => (
                    <MenuItem
                      key={topic}
                      value={topic}
                      sx={{
                        fontWeight: selectedTopics.includes(topic) ? 'bold' : 'regular',
                      }}
                    >
                      {topic}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button variant="outlined" onClick={resetFilters}>
                Reset
              </Button>
              <Button variant="contained" onClick={applyFilters} endIcon={<FilterAltIcon />}>
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* Selected Filters Summary */}
      {(difficultyRange[0] !== 1 || difficultyRange[1] !== 9 || selectedTopics.length > 0) && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {/* Difficulty Filter Chip */}
          {(difficultyRange[0] !== 1 || difficultyRange[1] !== 9) && (
            <Chip
              label={`Difficulty: ${getDifficultyLabel(difficultyRange[0])} - ${getDifficultyLabel(difficultyRange[1])}`}
              onDelete={() => {
                setDifficultyRange([1, 9]);
                applyFilters();
              }}
              sx={{ 
                bgcolor: getDifficultyBackgroundColor(difficultyRange[0]), // Use centralized function
                border: `1px solid ${getDifficultyColor(difficultyRange[0])}`,
                '& .MuiChip-deleteIcon': {
                  color: getDifficultyColor(difficultyRange[0]),
                }
              }}
            />
          )}

          {/* Topic Filter Chips */}
          {selectedTopics.map((topic) => (
            <Chip
              key={topic}
              label={`Topic: ${topic}`}
              onDelete={() => {
                handleRemoveTopic(topic);
                applyFilters();
              }}
            />
          ))}

          {/* Clear All Filters */}
          {(difficultyRange[0] !== 1 || difficultyRange[1] !== 9 || selectedTopics.length > 0) && (
            <Chip
              label="Clear All Filters"
              onDelete={resetFilters}
              sx={{ 
                bgcolor: theme.palette.error.light,
                color: theme.palette.error.contrastText,
                '& .MuiChip-deleteIcon': {
                  color: theme.palette.error.contrastText,
                }
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProblemFilters; 