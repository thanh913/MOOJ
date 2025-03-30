import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Alert,
  useTheme,
  useMediaQuery,
  Divider,
  Container,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useGetProblemsQuery } from '../store/apis/problemsApi';
import ProblemFilters from '../components/problems/ProblemFilters';
import SortControls, { SortDirection, SortField } from '../components/problems/SortControls';
import ProblemCard from '../components/problems/ProblemCard';
import EnhancedPagination from '../components/problems/EnhancedPagination';
import { Problem } from '../types/problem';
import { MooLoading, MooEmpty } from '../components/shared/MooComponents';

const ProblemList: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Use the RTK Query hook to fetch problems
  const {
    data: problems = [], // Default to empty array if data is undefined
    error: fetchError, 
    isLoading,
  } = useGetProblemsQuery({}); // Pass empty object for default query params
  
  // State for filtering/sorting options
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyRange, setDifficultyRange] = useState<[number, number]>([1, 100]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('difficulty');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // State for pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  
  // Apply filters and sorting
  useEffect(() => {
    if (!problems) return; // Guard against initial undefined state

    let result: Problem[] = [...problems];
    
    // Apply difficulty range filter
    result = result.filter(problem => 
      problem.difficulty >= difficultyRange[0] && problem.difficulty <= difficultyRange[1]
    );
    
    // Apply topic filter
    if (selectedTopics.length > 0) {
      result = result.filter(problem => 
        selectedTopics.some(topic => problem.topics?.includes(topic)) // Add optional chaining for safety
      );
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(problem => 
        problem.title.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'difficulty') {
        comparison = a.difficulty - b.difficulty;
      } else if (sortField === 'created_at') {
        // Make sure created_at exists and is valid date string before comparing
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        comparison = dateA - dateB;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredProblems(result);
    setPage(1); // Reset to first page when filters/source data change
  }, [difficultyRange, selectedTopics, searchQuery, sortField, sortDirection, problems]);
  
  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  // Handle navigation to problem detail
  const handleProblemClick = (id: number) => {
    navigate(`/problems/${id}`);
  };
  
  // Handle sort direction toggle
  const handleSortDirectionChange = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  // Handle filter reset
  const handleResetFilters = () => {
    setDifficultyRange([1, 100]);
    setSelectedTopics([]);
    setSearchQuery('');
  };

  // Calculate current page items
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentProblems = filteredProblems.slice(startIndex, endIndex);
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Math Problems
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Browse through our collection of mathematical problems and test your skills.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Search and Sort Controls */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: 2,
          mb: 3
        }}>
          <TextField
            placeholder="Search problems..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: isMobile ? '100%' : 400 }}
          />
          
          <SortControls
            sortField={sortField}
            sortDirection={sortDirection}
            onSortFieldChange={setSortField}
            onSortDirectionChange={handleSortDirectionChange}
          />
        </Box>
        
        {/* Filters */}
        <ProblemFilters
          difficultyRange={difficultyRange}
          setDifficultyRange={setDifficultyRange}
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
          applyFilters={() => {}} // No-op since filters are applied automatically in useEffect
          resetFilters={handleResetFilters}
        />
        
        {/* Loading State */}
        {isLoading && <MooLoading />}
        
        {/* Error Display */}
        {fetchError && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {`Failed to load problems. ${('status' in fetchError ? fetchError.status : '')} `}
          </Alert>
        )}
        
        {/* Empty State */}
        {!isLoading && !fetchError && currentProblems.length === 0 && (
          <MooEmpty />
        )}
        
        {/* Problem List */}
        {!isLoading && !fetchError && currentProblems.length > 0 && (
          <Box>
            <Grid container spacing={3} sx={{ mb: 3 }} data-testid="problem-list-container">
              {currentProblems.map((problem) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={problem.id}>
                  <ProblemCard
                    problem={problem}
                    onClick={() => handleProblemClick(problem.id)}
                  />
                </Grid>
              ))}
            </Grid>
            
            {/* Pagination */}
            <EnhancedPagination
              count={filteredProblems.length}
              page={page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={setPageSize}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ProblemList; 