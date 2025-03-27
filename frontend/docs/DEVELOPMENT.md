# Frontend Development Guide

This document contains frontend-specific information and guidelines for MOOJ developers.

## Component Guidelines

- Use functional components with hooks
- Keep components small and focused on one responsibility
- Use the Material-UI theme for consistent styling

## State Management

We use Redux Toolkit for global state management:
- Use slices for feature-based state organization
- Prefer local state for UI-only concerns
- Use RTK Query for data fetching when possible

## Code Style

- Follow TypeScript best practices
- Use proper typing for all components and functions
- Avoid `any` types where possible

## Testing

- Write tests for all components and utilities
- Use React Testing Library for component tests
- Mock API calls in tests

## Adding New Features

1. Create new components in appropriate directories
2. Update routing in App.tsx if needed
3. Add any necessary API service methods
4. Add Redux slices if global state is needed
5. Write tests for new code

## Working with Assets

- Place images in `src/assets/images`
- Place stylesheets in `src/assets/styles`
- Use theme variables for colors and spacing

For project setup and general information, refer to the [main project README](../../README.md). 