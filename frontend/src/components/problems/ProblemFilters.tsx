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

// Topics available for filtering
const availableTopics = [
  'Algebra',
  'Calculus',
  'Geometry',
  'Number Theory',
  'Combinatorics',
  'Logic',
  'Statistics',
  'Probability',
  'Linear Algebra',
  'Discrete Mathematics',
];

interface ProblemFiltersProps {
  difficultyRange: [number, number];
  setDifficultyRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  selectedTopics: string[];
  setSelectedTopics: React.Dispatch<React.SetStateAction<string[]>>;
  applyFilters: () => void;
  resetFilters: () => void;
}

const ProblemFilters: React.FC<ProblemFiltersProps> = ({
  difficultyRange,
  setDifficultyRange,
  selectedTopics,
  setSelectedTopics,
  applyFilters,
  resetFilters,
}) => {
  const theme = useTheme();
  const [showFilters, setShowFilters] = useState(false);

  // Handle difficulty slider change
  const handleDifficultyChange = (event: Event, newValue: number | number[]) => {
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
    return difficultyLabels[value as keyof typeof difficultyLabels];
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
                  value={difficultyRange}
                  onChange={handleDifficultyChange}
                  valueLabelDisplay="auto"
                  valueLabelFormat={valueLabelFormat}
                  min={1}
                  max={9}
                  step={1}
                  marks={Object.entries(difficultyLabels).map(([level, label]) => ({
                    value: parseInt(level),
                    label: parseInt(level) % 2 === 1 ? level : '',
                  }))}
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
                  {difficultyLabels[difficultyRange[0] as keyof typeof difficultyLabels]}
                </Typography>
                <Typography variant="body2" sx={{ color: getDifficultyColor(difficultyRange[1]) }}>
                  {difficultyLabels[difficultyRange[1] as keyof typeof difficultyLabels]}
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
      {(difficultyRange[0] > 1 || difficultyRange[1] < 9 || selectedTopics.length > 0) && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {/* Show difficulty range chip if not default */}
          {(difficultyRange[0] > 1 || difficultyRange[1] < 9) && (
            <Chip
              icon={<TuneIcon />}
              label={`Difficulty: ${difficultyRange[0]}-${difficultyRange[1]}`}
              onDelete={() => setDifficultyRange([1, 9])}
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
          {(difficultyRange[0] > 1 || difficultyRange[1] < 9 || selectedTopics.length > 0) && (
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