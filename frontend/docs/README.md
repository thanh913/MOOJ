# Frontend Documentation

This directory contains documentation specific to the MOOJ frontend.

## Available Documentation

- [Development Guide](DEVELOPMENT.md) - Guidelines and best practices for frontend development
- [Troubleshooting Guide](TROUBLESHOOTING.md) - Solutions for common frontend issues
- [Solutions Reference](SOLUTIONS.md) - Code examples and implementation solutions

## Getting Started

For basic setup and running instructions, see the [main project README](../../README.md).

## Directory Structure

The frontend follows a standard React application structure:

```
frontend/
├── src/                 # Source code
│   ├── assets/          # Static assets (images, styles)
│   ├── components/      # Reusable UI components
│   ├── config/          # Configuration files
│   ├── models/          # Data models
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── store/           # State management
│   ├── theme/           # UI theming
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
```

## Technology Stack

- React 18
- TypeScript
- Material-UI v5
- Redux Toolkit
- React Router v6

# MOOJ Frontend Architecture

## Overview

The MOOJ (Mathematical Online Open Judge) frontend has been refactored to improve code organization, reusability, and maintainability while providing a modern, responsive user interface.

## Architecture

### Component Structure

1. **Shared Components**
   - `MooComponents.tsx`: Reusable mascot components for loading, empty states, success, and error states
   - `StatusIndicators.tsx`: Components for showing submission status, progress, and score displays
   - `MathRenderer.tsx`: Specialized components for rendering LaTeX content

2. **Layout Components**
   - `Header.tsx`: Main navigation bar with auth controls
   - `Footer.tsx`: Page footer with links and branding

3. **Pages**
   - `ProblemList.tsx`: Main problem browser with filtering
   - `ProblemDetail.tsx`: Problem view and submission interface
   - `SubmissionDetail.tsx`: Feedback and results view

### Theme System

The UI uses a centralized theme system (`theme/index.tsx`) that provides:
- Consistent color palette
- Typography settings
- Component default styling
- Animation definitions
- Utility functions for problem difficulty colors/labels

### Key Features

1. **Consistent Branding**
   - The Moo mascot is used throughout the UI for loading states, feedback, and empty states
   - Consistent color scheme and component styling

2. **Responsive Design**
   - Mobile-friendly layouts using Material-UI Grid system
   - Adaptive component sizing for different screen sizes

3. **Better UX**
   - Improved feedback for submission status
   - Clear difficulty indicators
   - Visual cues for loading and processing
   - Error handling with helpful messages

## Development

To run the frontend development server:

```bash
cd frontend
npm install
npm start
```

The application will be available at `http://localhost:3000`.

## Future Improvements

1. Add user authentication screens
2. Implement comprehensive state management with Redux
3. Add more animation and transitions for a more polished feel
4. Improve accessibility features
5. Add comprehensive testing suite 