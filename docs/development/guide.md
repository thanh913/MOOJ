# MOOJ - Development Guide

## Table of Contents

1. [Development Progress](#1-development-progress)
2. [Implementation Priorities](#2-implementation-priorities)
3. [Key Documentation](#3-key-documentation)
4. [Technical Standards](#4-technical-standards)
   - [Architecture](#41-architecture)
   - [Development Workflow](#42-development-workflow)
   - [Coding Standards](#43-coding-standards)
   - [Testing Standards](#44-testing-standards)
   - [Documentation Requirements](#45-documentation-requirements)
   - [Performance Targets](#46-performance-targets)
   - [LLM Integration](#47-llm-integration)
   - [Database Design](#48-database-design)
5. [Evaluation Pipeline Implementation](#5-evaluation-pipeline-implementation)
   - [Component Overview](#51-component-overview)
   - [Implementation Priority](#52-implementation-priority)
6. [Running Tests](#6-running-tests)
   - [Backend Tests](#61-backend-tests)
   - [Frontend Tests](#62-frontend-tests)

This guide contains the development standards, workflow guidelines, and progress tracking for the MOOJ platform. It serves as the central reference for developers working on the project.

## 1. Development Progress

**Current Phase:** Phase 2 - Enhanced Features

**Completed Steps:**
- Project setup
- Core authentication 
- Minimal problem management
- Essential evaluation system
- MVP user interface
- Initial deployment
- Enhanced problem interface
- Advanced authentication (including RTK Query setup)
- Improved problem management (Backend API, CRUD, Models for problems & users)

**In Progress:**
- Frontend Integration Testing: Debugging `AuthFlow.test.tsx`.
- Improved problem management (Frontend UI, LaTeX Editor, Workflow).
- Resolving Frontend Linter Error in `store/index.ts`.

**Known Issues:**
- `frontend/src/tests/AuthFlow.test.tsx`: Integration test failing during login after logout, likely due to async state updates/rendering with RTK Query mocks.
- Frontend Linter Error: TypeScript type error in `frontend/src/store/index.ts` related to middleware configuration and RTK Query setup.

**Next Steps:**
- Resolve frontend linter error in `store/index.ts`.
- Resolve `AuthFlow.test.tsx` failures.
- Implement Problem Management Frontend (Moderator dashboard UI finalization, LaTeX editor, publishing workflow, categorization).

## 2. Implementation Priorities

When implementing features, follow these priorities:

1. **Functionality First**: Implement core functionality before UI polish
2. **Testing Required**: All features must include appropriate tests
3. **Documentation**: Update technical documentation as you implement features
4. **Performance**: Consider performance implications, especially for evaluation pipeline

## 3. Key Documentation

- **[Implementation Plan](../implementation-plan.md)**: Sequential steps for implementation with cross-references
- **[Technical Specification](../technical-specification.md)**: Technical specifications and system design
- **[Cursor Rules](../../.cursorrules)**: Core development rules for contributors

## 4. Technical Standards

### 4.1 Architecture
- **Modular Evaluation Pipeline**:
  - `image_to_LaTeX`: Image conversion module
  - `find_all_errors`: Error detection module
  - `process_evaluation`: Unified evaluation function with appeals loop

- **Backend Processing**: All mathematical processing must happen on the backend

- **API-First**: Define API contracts before implementing UI components

- **Repository Pattern**: Use repository pattern for database access

### 4.2 Development Workflow
- **Progress Tracking**: When completing an implementation step:
  - Mark it as "Done" in [Implementation Plan](../implementation-plan.md)
  - Update "Completed Steps" in this document
  - Update "Next Steps" in this document

- **Feature Branches**: Use:
  - `feature/[feature-name]` for new features
  - `fix/[issue-number]` for bug fixes
  - `refactor/[component-name]` for code refactoring

- **MVP First**: Prioritize MVP features before enhancements

### 4.3 Coding Standards
- **Frontend**:
  - Use functional components with hooks
  - Implement responsive design

- **Backend**:
  - Use async/await patterns for all I/O operations

### 4.4 Testing Standards
- **Coverage Requirements**:
  - Core evaluation logic: 80% coverage
  - LLM interactions: Mock tests with known samples
  - Authentication: Complete coverage (Note: Integration test `AuthFlow.test.tsx` currently failing)
  - Database operations: Test all repository methods
- **Frontend Integration Tests**: Currently facing challenges with asynchronous behavior in React Testing Library, particularly in complex flows like authentication (See Known Issues).

- **Database Testing**:
  - Use in-memory SQLite database for tests
  - Reset database state between tests
  - Create reusable fixtures
  - Test both success and failure cases
  - Test role-based permissions explicitly

### 4.5 Documentation Requirements
- **API Documentation**: All API endpoints must include OpenAPI documentation
- **User-Facing Text**: Store all user-facing text in centralized message files

### 4.6 Performance Targets
- **API Response**: < 1 second for non-processing requests
- **Image Processing**: < 5 seconds
- **User Content**: Sanitize and validate all uploads

### 4.7 LLM Integration
- Store prompts as versioned templates
- Implement fallback mechanisms
- Cache common evaluation results

### 4.8 Database Design
- **SQLite Compatibility**: 
  - Use JSON fields instead of array types for list data
  - Ensure all models work across database engines
- **Model Structure**:
  - Include proper foreign keys
  - Add appropriate indexes
  - Implement consistent timestamp fields

## 5. Evaluation Pipeline Implementation

The evaluation pipeline uses an iterative approach with a single unified function. See the comprehensive [Evaluation Pipeline](../evaluation-pipeline.md) document for details.

### 5.1 Component Overview

- `image_to_LaTeX`: Converts images to LaTeX
- `find_all_errors`: Identifies proof errors
- `process_evaluation`: Unified function with appeals loop

The `process_evaluation` function uses an interactive loop approach:
```
do {
    evaluate and output errors
    if user chooses not to appeal, break
} while (appeal_count < max_appeals)
```

### 5.2 Implementation Priority

When implementing the full evaluation pipeline in Phase 3, prioritize in this order:
1. Core functionality with proper error handling
2. Validation and error detection accuracy
3. Performance optimization and parallelization
4. User feedback quality and appeal processing

Refer to [Implementation Plan](../implementation-plan.md) for the sequence of evaluation pipeline tasks and [Evaluation Pipeline](../evaluation-pipeline.md) for detailed specifications.

## 6. Running Tests

### 6.1 Backend Tests

The MOOJ project uses pytest for backend testing. The tests are organized in the `backend/tests` directory with the following structure:

```