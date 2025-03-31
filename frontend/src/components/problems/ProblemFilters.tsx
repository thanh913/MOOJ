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

// Map of difficulty levels to labels
const difficultyLabels = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Somewhat Easy',
  4: 'Medium-Easy',
  5: 'Medium',
  6: 'Medium-Hard',
  7: 'Somewhat Hard',
  8: 'Hard',
  9: 'Very Hard',
};

const difficultyColors = [
  '#4caf50', // Easy (1-3)
  '#ff9800', // Medium (4-6)
  '#f44336', // Hard (7-9)
];

// Get difficulty color based on level
const getDifficultyColor = (level: number) => {
  if (level <= 3) return difficultyColors[0];
  if (level <= 6) return difficultyColors[1];
  return difficultyColors[2];
};

// Get background color with reduced opacity
const getBackgroundColor = (level: number) => {
  const color = getDifficultyColor(level);
  return `${color}33`; // Add 33 for 20% opacity in hex
};

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
    // Scale the visual slider value (1-9) to the state value (10-90, or 1-100 for range ends)
    const scaledValue = Array.isArray(newValue) 
      ? [newValue[0] * 10, newValue[1] * 10]
      : newValue * 10;
    // Clamp the range ends to 1 and 100 if necessary (though scaling 1-9 handles this)
    // const clampedValue = Array.isArray(scaledValue) 
    //  ? [Math.max(1, scaledValue[0]), Math.min(100, scaledValue[1])]
    //  : scaledValue; // No clamping needed for single value?
      
    setDifficultyRange(scaledValue as [number, number]); // Update state with 10-100 range
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
    // Round to nearest integer for label lookup
    const roundedValue = Math.round(value);
    return difficultyLabels[roundedValue as keyof typeof difficultyLabels] ?? value.toString();
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
                  value={Array.isArray(difficultyRange) ? [difficultyRange[0] / 10, difficultyRange[1] / 10] : difficultyRange / 10} // Scale state value (10-100) down to visual (1-9)
                  onChange={handleDifficultyChange}
                  valueLabelDisplay="auto"
                  valueLabelFormat={valueLabelFormat}
                  min={1}
                  max={9}
                  step={0.5} // Change step to 0.5
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
                  ]} // Show integer marks 1-9
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
                <Typography variant="body2" sx={{ color: getDifficultyColor(difficultyRange[0] / 10) }}> {/* Scale down for label lookup */}
                  {difficultyLabels[Math.round(difficultyRange[0] / 10) as keyof typeof difficultyLabels] ?? 'Unknown'} {/* Cast index */}
                </Typography>
                <Typography variant="body2" sx={{ color: getDifficultyColor(difficultyRange[1] / 10) }}> {/* Scale down for label lookup */}
                  {difficultyLabels[Math.round(difficultyRange[1] / 10) as keyof typeof difficultyLabels] ?? 'Unknown'} {/* Cast index */}
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
              <Button 
                variant="contained" 
                startIcon={<FilterAltIcon />}
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* Active Filter Chips */}
      {(difficultyRange[0] > 10 || difficultyRange[1] < 90) && ( // Adjust chip condition for 10-90 range (allow 1 and 100)
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {/* Show difficulty range chip if not default */}
          {(difficultyRange[0] > 10 || difficultyRange[1] < 90) && (
            <Chip
              icon={<TuneIcon />}
              // Display the visual range (1-9)
              label={`Difficulty: ${(difficultyRange[0] / 10).toFixed(1)}-${(difficultyRange[1] / 10).toFixed(1)}`}
              onDelete={() => setDifficultyRange([1, 100])} // Reset state to 1-100
              color="primary"
              variant="outlined"
            />
          )}

          {/* Topic filter chips */}
          {selectedTopics.map((topic) => (
            <Chip
              key={topic}
              label={topic}
              onDelete={() => handleRemoveTopic(topic)}
              sx={{
                backgroundColor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: theme.palette.primary.main,
              }}
            />
          ))}

          {/* Clear all filters button */}
          {(difficultyRange[0] > 10 || difficultyRange[1] < 90 || selectedTopics.length > 0) && ( // Adjust chip condition
            <Chip
              label="Clear All"
              onClick={resetFilters}
              color="secondary"
              variant="outlined"
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProblemFilters; 