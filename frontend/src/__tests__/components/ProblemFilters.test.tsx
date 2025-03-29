import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import ProblemFilters from '../../components/problems/ProblemFilters';
import { ThemeProvider, createTheme } from '@mui/material';

// Mock props for testing - use plain strings for topics
const mockProps = {
  // Mocking allTopics based on the component's internal 'availableTopics'
  // Note: The component doesn't actually take 'allTopics' as a prop,
  // but we might keep this structure if we refactor later.
  // For now, we just need the selected topics as strings.
  selectedTopics: ['Algebra', 'Geometry'], 
  difficultyRange: [1, 9] as [number, number],
  applyFilters: jest.fn(),
  resetFilters: jest.fn(),
  setSelectedTopics: jest.fn(),
  setDifficultyRange: jest.fn(),
};

describe('ProblemFilters Component', () => {
  // Theme wrapper for Material-UI components
  const theme = createTheme();
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the filter section correctly', () => {
    render(<ProblemFilters {...mockProps} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Show Filters/i })).toBeInTheDocument();
    // Filter details should be initially hidden
    expect(screen.queryByText('Difficulty Range')).not.toBeVisible();
    expect(screen.queryByLabelText('Topics')).not.toBeVisible();
  });

  test('should expand and collapse the filter section', async () => {
    render(<ProblemFilters {...mockProps} />);

    const showButton = screen.getByRole('button', { name: /Show Filters/i });
    // Find the Paper element first
    const filterPaper = screen.getByText('Difficulty Range').closest('.MuiPaper-root');
    // Correctly traverse up to the MuiCollapse-root element
    const collapseContainer = filterPaper?.parentElement?.parentElement?.parentElement; 

    // Ensure collapse container exists
    expect(collapseContainer).toBeInTheDocument();
    // Initially collapsed - Check the root element's class
    expect(collapseContainer).not.toHaveClass('MuiCollapse-entered');
    expect(screen.getByText('Difficulty Range')).not.toBeVisible(); // Check text is not visible initially

    // Expand
    await act(async () => {
      await userEvent.click(showButton);
    });

    // Check if expanded using class and visibility of content
    await waitFor(() => {
        // Check the root element's class again
        expect(collapseContainer).toHaveClass('MuiCollapse-entered');
        expect(screen.getByText('Difficulty Range')).toBeVisible();
    });
    expect(screen.getByRole('button', { name: /Hide Filters/i })).toBeInTheDocument();

    // Collapse
    const hideButton = screen.getByRole('button', { name: /Hide Filters/i });
    await act(async () => {
        await userEvent.click(hideButton);
    });

    // Check if collapsed using class and visibility of content
    await waitFor(() => {
        // Check the root element's class one more time
        expect(collapseContainer).not.toHaveClass('MuiCollapse-entered');
        // Use queryByText and .not.toBeVisible() for collapsed state check
        expect(screen.queryByText('Difficulty Range')).not.toBeVisible();
    });
    expect(screen.getByRole('button', { name: /Show Filters/i })).toBeInTheDocument();
  });

  test('displays selected topic chips initially', async () => {
    render(<ProblemFilters {...mockProps} />);
    const showButton = screen.getByRole('button', { name: /Show Filters/i });

    // Expand filters first
    await act(async () => {
        await userEvent.click(showButton);
    });

    // Wait for the section to expand (e.g., wait for Difficulty Range to be visible)
    await waitFor(() => { 
        expect(screen.getByText('Difficulty Range')).toBeVisible();
    });

    // Now query for the combobox
    const selectDisplay = screen.getByRole('combobox', { name: 'Topics' });
    // Use strings for checking topics
    expect(within(selectDisplay).getByText('Algebra')).toBeInTheDocument();
    expect(within(selectDisplay).getByText('Geometry')).toBeInTheDocument();
  });

  test('calls resetFilters when reset button is clicked', async () => {
    render(<ProblemFilters {...mockProps} />);
    const showButton = screen.getByRole('button', { name: /Show Filters/i });

    // Expand filters first
    await act(async () => {
        await userEvent.click(showButton);
    });
    await waitFor(() => { expect(screen.getByText('Difficulty Range')).toBeVisible()});

    const resetButton = screen.getByRole('button', { name: /Reset/i });
    await act(async () => {
        await userEvent.click(resetButton);
    });

    expect(mockProps.resetFilters).toHaveBeenCalledTimes(1);
  });

  test('should call setSelectedTopics when a topic is deselected', async () => {
    render(<ProblemFilters {...mockProps} />); 
    const showButton = screen.getByRole('button', { name: /Show Filters/i });

    // Expand filters first
    await act(async () => {
        await userEvent.click(showButton);
    });

    // Wait for the section to expand 
    await waitFor(() => { 
        expect(screen.getByText('Difficulty Range')).toBeVisible();
    });

    // Now query for the combobox
    const selectTrigger = screen.getByRole('combobox', { name: /Topics/i });

    // Open the dropdown
    await act(async () => {
      await userEvent.click(selectTrigger);
    });

    // Find the listbox and the option to deselect (Algebra)
    const listbox = await screen.findByRole('listbox');
    const algebraOption = within(listbox).getByRole('option', { name: 'Algebra' }); 

    // Click the option to deselect it
    await act(async () => {
      await userEvent.click(algebraOption);
    });

    // Check if setSelectedTopics was called with the remaining topic
    expect(mockProps.setSelectedTopics).toHaveBeenCalledTimes(1);
    expect(mockProps.setSelectedTopics).toHaveBeenCalledWith(['Geometry']); 

    // Close the dropdown (optional, good practice)
    await act(async () => {
      await userEvent.keyboard('{escape}');
    });
  });

  test('calls applyFilters when Apply Filters button is clicked', async () => {
    render(<ProblemFilters {...mockProps} />);
    const showButton = screen.getByRole('button', { name: /Show Filters/i });

    // Expand filters first
    await act(async () => {
        await userEvent.click(showButton);
    });
    await waitFor(() => { expect(screen.getByText('Difficulty Range')).toBeVisible()});

    // Click Apply Filters button
    const applyButton = screen.getByRole('button', { name: /Apply Filters/i });
    await act(async () => {
        await userEvent.click(applyButton);
    });
    
    // Check if applyFilters was called
    expect(mockProps.applyFilters).toHaveBeenCalledTimes(1);
  });

  // Add tests for difficulty slider change if needed
}); 