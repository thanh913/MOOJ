import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProblemFilters from '../../components/problems/ProblemFilters';
import { ThemeProvider, createTheme } from '@mui/material';

describe('ProblemFilters Component', () => {
  // Mock props for testing
  const mockProps = {
    difficultyRange: [1, 9] as [number, number],
    setDifficultyRange: jest.fn(),
    selectedTopics: [],
    setSelectedTopics: jest.fn(),
    applyFilters: jest.fn(),
    resetFilters: jest.fn(),
  };

  // Theme wrapper for Material-UI components
  const theme = createTheme();
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the filter section with toggle button', () => {
    renderWithTheme(<ProblemFilters {...mockProps} />);
    
    // Check for filter header
    expect(screen.getByText('Filters')).toBeInTheDocument();
    
    // Check for toggle button
    expect(screen.getByText('Show Filters')).toBeInTheDocument();
  });

  test('expands filter section when toggle button is clicked', () => {
    renderWithTheme(<ProblemFilters {...mockProps} />);
    
    // Initially filter details should be hidden
    expect(screen.queryByText('Difficulty Range')).not.toBeInTheDocument();
    
    // Click the toggle button
    fireEvent.click(screen.getByText('Show Filters'));
    
    // After clicking, filter details should be visible
    expect(screen.getByText('Difficulty Range')).toBeInTheDocument();
    expect(screen.getByText('Topics')).toBeInTheDocument();
  });

  test('displays filter chips when filters are active', () => {
    // Render with active filters
    renderWithTheme(
      <ProblemFilters
        {...mockProps}
        difficultyRange={[3, 7]}
        selectedTopics={['Algebra', 'Calculus']}
      />
    );
    
    // Check for difficulty chip
    expect(screen.getByText('Difficulty: 3-7')).toBeInTheDocument();
    
    // Check for topic chips
    expect(screen.getByText('Algebra')).toBeInTheDocument();
    expect(screen.getByText('Calculus')).toBeInTheDocument();
    
    // Check for clear all option
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  test('calls reset function when Clear All chip is clicked', () => {
    renderWithTheme(
      <ProblemFilters
        {...mockProps}
        difficultyRange={[3, 7]}
        selectedTopics={['Algebra']}
      />
    );
    
    // Click the Clear All chip
    fireEvent.click(screen.getByText('Clear All'));
    
    // Check if resetFilters was called
    expect(mockProps.resetFilters).toHaveBeenCalledTimes(1);
  });

  test('removing topic chip calls setSelectedTopics with updated list', () => {
    renderWithTheme(
      <ProblemFilters
        {...mockProps}
        selectedTopics={['Algebra', 'Calculus']}
      />
    );
    
    // Find the Algebra chip and click its delete button
    const algebraChip = screen.getByText('Algebra');
    const deleteButton = algebraChip.parentElement?.querySelector('[aria-label="cancel"]');
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }
    
    // Check if setSelectedTopics was called with just 'Calculus'
    expect(mockProps.setSelectedTopics).toHaveBeenCalledWith(['Calculus']);
  });

  test('clicking Apply Filters button calls applyFilters function', async () => {
    renderWithTheme(<ProblemFilters {...mockProps} />);
    
    // Show filters
    fireEvent.click(screen.getByText('Show Filters'));
    
    // Click Apply Filters button
    fireEvent.click(screen.getByText('Apply Filters'));
    
    // Check if applyFilters was called
    expect(mockProps.applyFilters).toHaveBeenCalledTimes(1);
  });
}); 