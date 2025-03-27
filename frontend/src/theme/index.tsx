import { createTheme, Theme } from '@mui/material';

// Define color palette
const colors = {
  primary: {
    main: '#3f51b5',
    light: '#757de8',
    dark: '#002984',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f50057',
    light: '#ff5983',
    dark: '#bb002f',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  success: {
    main: '#4caf50',
    light: '#80e27e',
    dark: '#087f23',
  },
  warning: {
    main: '#ff9800',
    light: '#ffc947',
    dark: '#c66900',
  },
  error: {
    main: '#f44336',
    light: '#ff7961',
    dark: '#ba000d',
  },
};

// Create the MOOJ theme
const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      marginBottom: '1rem',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

// Utility functions for working with theme
export const getDifficultyColor = (theme: Theme, difficulty: number): string => {
  if (difficulty <= 3) return theme.palette.success.main;
  if (difficulty <= 6) return theme.palette.warning.main;
  return theme.palette.error.main;
};

export const getDifficultyLabel = (difficulty: number): string => {
  const labels: Record<number, string> = {
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
  
  return labels[difficulty] || `Level ${difficulty}`;
};

// Animation keyframes for the custom Moo mascot
const customTheme = {
  ...theme,
  components: {
    ...theme.components,
    MuiCssBaseline: {
      styleOverrides: `
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `,
    },
  },
};

export default customTheme; 