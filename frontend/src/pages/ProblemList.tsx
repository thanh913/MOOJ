import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Divider,
  Container,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { fetchProblems } from '../services/api';
import ProblemFilters from '../components/problems/ProblemFilters';
import SortControls, { SortDirection, SortField } from '../components/problems/SortControls';
import ProblemCard from '../components/problems/ProblemCard';
import EnhancedPagination from '../components/problems/EnhancedPagination';
import { Problem } from '../models/types';

// Component for showing the Moo mascot when loading
const MooLoading: React.FC<{ message?: string }> = ({ message = 'Loading problems...' }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
      <span role="img" aria-label="cow" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        🐄
      </span>
      <CircularProgress size={24} sx={{ mb: 2 }} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

// Component for showing the Moo mascot when there are no problems
const MooEmpty: React.FC<{ message?: string }> = ({ message = 'No problems found. Try different filters!' }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
      <span role="img" aria-label="sad cow" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        🐄
      </span>
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

const ProblemList: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for problem data
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering/sorting options
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyRange, setDifficultyRange] = useState<[number, number]>([1, 9]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('difficulty');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // State for pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  
  // Load problems on component mount
  useEffect(() => {
    const loadProblems = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProblems();
        if (data && Array.isArray(data)) {
          setProblems(data);
          setFilteredProblems(data);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (err) {
        setError('Failed to load problems. Please try again later.');
        console.error('Error fetching problems:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProblems();
  }, []);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...problems];
    
    // Apply difficulty range filter
    result = result.filter(problem => 
      problem.difficulty >= difficultyRange[0] && problem.difficulty <= difficultyRange[1]
    );
    
    // Apply topic filter
    if (selectedTopics.length > 0) {
      result = result.filter(problem => 
        selectedTopics.some(topic => problem.topics.includes(topic))
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
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'attempts') {
        // Mock sorting by attempts (replace with actual data)
        const aAttempts = Math.floor(Math.random() * 1000);
        const bAttempts = Math.floor(Math.random() * 1000);
        comparison = aAttempts - bAttempts;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredProblems(result);
    setPage(1); // Reset to first page when filters change
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
    setDifficultyRange([1, 9]);
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
        
        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
        {/* Loading State */}
        {loading ? (
          <MooLoading />
        ) : filteredProblems.length === 0 ? (
          <MooEmpty />
        ) : (
          <>
            {/* Problem Cards */}
            <Grid container spacing={3}>
              {currentProblems.map((problem) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={problem.id}>
                  <ProblemCard
                    problem={problem}
                    onClick={handleProblemClick}
                  />
                </Grid>
              ))}
            </Grid>
            
            {/* Pagination */}
            <EnhancedPagination
              count={filteredProblems.length}
              page={page}
              pageSize={pageSize}
              loading={loading}
              onPageChange={handlePageChange}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </Box>
    </Container>
  );
};

export default ProblemList; 