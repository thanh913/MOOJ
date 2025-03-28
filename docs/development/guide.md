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
- Advanced authentication

**In Progress:**
- None

**Next Steps:**
- Improved problem management
  - Priority: Moderator dashboard for problem creation and management
  - Focus on LaTeX editor integration for math formulas
  - Implement publishing workflow with draft/published states

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
  - `return_evaluation`: Evaluation and feedback generation

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
  - Authentication: Complete coverage
  - Database operations: Test all repository methods

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

The evaluation pipeline is implemented as a modular system with separate components for image conversion, error detection, evaluation, and appeal processing. For comprehensive details including function specifications, data flow, schemas, and implementation guidelines, refer to the dedicated [Evaluation Pipeline](../evaluation-pipeline.md) document.

The current implementation uses placeholder functions that will be replaced with full LLM-powered implementation in Phase 3. When implementing the complete pipeline, follow the specifications, error handling, and parallelization guidelines in the Evaluation Pipeline document.

### 5.1 Component Overview

- `image_to_LaTeX`: Converts image submissions to LaTeX format
- `find_all_errors`: Identifies errors in a submitted proof
- `evaluate_solution`: Assigns score and generates feedback based on errors
- `return_evaluation`: Orchestrates the initial evaluation process
- `process_appeals`: Handles appeal processing in a separate step

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
backend/tests/
├── api/          # API endpoint tests
├── core/         # Core functionality tests
├── crud/         # CRUD operation tests
├── db/           # Database tests
├── evaluation/   # Evaluation pipeline tests
├── utils/        # Test utilities
└── conftest.py   # Test fixtures and configuration
```

To run the backend tests:

1. Using the test script:

   **Windows (PowerShell)**:
   ```powershell
   .\scripts\run_backend_tests.ps1
   ```

   **Unix (Bash)**:
   ```bash
   ./scripts/run_backend_tests.sh
   ```

2. Manually from the backend directory:

   ```bash
   cd backend
   python -m pytest
   ```

3. To run specific tests or test modules:

   ```bash
   # Run a specific test module
   .\scripts\run_backend_tests.ps1 tests/api/test_ping.py

   # Run tests with specific markers
   .\scripts\run_backend_tests.ps1 -m "api"

   # Run tests with specific name pattern
   .\scripts\run_backend_tests.ps1 -k "test_ping"
   ```

4. To generate a coverage report:

   ```bash
   .\scripts\run_backend_tests.ps1 --cov=app tests/ --cov-report=html
   ```

### 6.2 Frontend Tests

// ... existing code ... 