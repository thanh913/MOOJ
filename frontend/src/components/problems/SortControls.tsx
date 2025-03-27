import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// Sort options available
export type SortField = 'difficulty' | 'created_at' | 'attempts';
export type SortDirection = 'asc' | 'desc';

interface SortOption {
  value: SortField;
  label: string;
}

const sortOptions: SortOption[] = [
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'created_at', label: 'Date Added' },
  { value: 'attempts', label: 'Number of Attempts' },
];

interface SortControlsProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionChange: () => void;
}

const SortControls: React.FC<SortControlsProps> = ({
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
}) => {
  const handleSortChange = (event: SelectChangeEvent) => {
    onSortFieldChange(event.target.value as SortField);
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 1, 
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        <SortIcon sx={{ color: 'text.secondary', mr: 1 }} />
        <FormControl 
          variant="standard" 
          size="small" 
          sx={{ 
            minWidth: 120,
            '.MuiInput-underline:before': { borderBottomColor: 'transparent' },
            '.MuiInput-underline:hover:before': { borderBottomColor: 'transparent' },
            '.MuiInput-underline:after': { borderBottomColor: 'transparent' },
          }}
        >
          <Select
            value={sortField}
            onChange={handleSortChange}
            displayEmpty
            disableUnderline
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Tooltip title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}>
        <IconButton 
          size="small" 
          onClick={onSortDirectionChange}
          sx={{ ml: 1 }}
        >
          {sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

export default SortControls; 