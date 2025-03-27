import React from 'react';
import {
  Box,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';

interface EnhancedPaginationProps {
  count: number; // Total number of items
  page: number; // Current page
  pageSize: number; // Items per page
  loading?: boolean; // Whether data is loading
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const pageSizeOptions = [8, 16, 24, 48];

// Component for showing the Moo mascot when loading
const MooLoading: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
      <span role="img" aria-label="cow" style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>
        🐄
      </span>
      <CircularProgress size={16} />
    </Box>
  );
};

const EnhancedPagination: React.FC<EnhancedPaginationProps> = ({
  count,
  page,
  pageSize,
  loading = false,
  onPageChange,
  onPageSizeChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Calculate total pages
  const totalPages = Math.ceil(count / pageSize);
  
  // Start and end item indices
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, count);
  
  // Handle page size change
  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    onPageSizeChange(event.target.value as number);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        mt: 4,
        gap: isMobile ? 2 : 0,
      }}
    >
      {/* Page size selector */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Show
        </Typography>
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value={pageSize}
            onChange={handlePageSizeChange}
            displayEmpty
            variant="outlined"
            sx={{ 
              '& .MuiSelect-select': { 
                py: 0.5, 
                px: 1.5 
              } 
            }}
          >
            {pageSizeOptions.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          per page
        </Typography>
        
        {/* Loading indicator */}
        {loading && <MooLoading />}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* Pagination info */}
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
          {count > 0 ? `${startItem}-${endItem} of ${count}` : 'No items'}
        </Typography>
        
        {/* Pagination controls */}
        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={onPageChange} 
          color="primary"
          size={isMobile ? "small" : "medium"}
          showFirstButton
          showLastButton
          disabled={loading || count === 0}
          sx={{
            '& .MuiPaginationItem-root': {
              fontWeight: 500,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default EnhancedPagination; 