# MOOJ - Technical Specification

## Table of Contents

1. [About This Document](#about-this-document)
2. [System Overview](#system-overview)
   - [Project Mascot](#project-mascot)
3. [Technical Stack](#technical-stack)
   - [Frontend](#frontend)
   - [Backend](#backend)
   - [Deployment](#deployment)
4. [Core Feature Specifications](#core-feature-specifications)
   - [User System](#user-system)
   - [Problem Management](#problem-management)
   - [Submission System](#submission-system)
   - [Evaluation Pipeline](#evaluation-pipeline)
   - [User Interface Requirements](#user-interface-requirements)
5. [Database Schema](#database-schema)
6. [API Specification](#api-specification)
7. [Performance Requirements](#performance-requirements)
8. [Deployment Environments](#deployment-environments)
9. [Monitoring & Logging](#monitoring--logging)

## About This Document

This document provides comprehensive technical specifications and design guidelines for the MOOJ platform. It serves as the reference for:

- System architecture and components
- Feature specifications and requirements
- Database schema and API design
- Evaluation pipeline technical details

For implementation steps, refer to `implementation-plan.md`. For development standards and progress tracking, see `development-guide.md`.

## System Overview

MOOJ is an online judge platform for mathematics proofs that allows users to submit solutions as direct text input or as images of handwritten proofs. The platform converts images to LaTeX, evaluates solutions using LLM technology, and provides detailed feedback with an appeals system.

### Project Mascot

MOOJ features a friendly cow mascot named "Moo" who guides users through the platform. The mascot should be used in:
- Loading indicators and spinners
- Empty states and placeholders
- Tutorial/guidance elements
- Error messages and feedback

## Technical Stack

### Frontend
- **Framework**: React with TypeScript
- **State Management**: Redux Toolkit
- **UI Components**: Material-UI
- **Form Handling**: Formik with Yup validation
- **LaTeX Rendering**: MathJax/KaTeX
- **Markdown Support**: React-Markdown

### Backend
- **Framework**: FastAPI (Python)
- **Authentication**: JWT with Google OAuth integration
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Image Processing**: OpenCV, Tesseract

### Deployment
- **Containerization**: Docker and Docker Compose
- **Self-hosted**: Initial deployment
- **Future Cloud**: AWS/GCP (architecture designed for easy migration)

## Core Feature Specifications

### User System
- **Roles**:
  - Regular users: Solve problems, view solutions, submit appeals
  - Moderators: Create/edit problems, review submissions
  - Administrators: Manage users, system configuration
- **Authentication**:
  - Email/password (JWT-based)
  - Google OAuth integration
  - Session management with refresh tokens
  - *Note: Frontend integration testing for the authentication flow (`AuthFlow.test.tsx`) is currently facing challenges, specifically with finding elements after logout/login sequences. See Known Issues in `development/guide.md`.*
- **Access Control**:
  - Role-based permissions
  - Resource ownership validation

#### Permissions Matrix

| Permission | User | Moderator | Admin |
|------------|------|-----------|-------|
| View problems | ✅ | ✅ | ✅ |
| Submit solutions | ✅ | ✅ | ✅ |
| Appeal results | ✅ | ✅ | ✅ |
| Create problems | ❌ | ✅ | ✅ |
| Edit any problem | ❌ | ✅ | ✅ |
| Publish problems | ❌ | ✅ | ✅ |
| View analytics | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| System configuration | ❌ | ❌ | ✅ |
| Access all submissions | ❌ | ✅ | ✅ |

### Problem Management
- **Categories**:
  - Difficulty levels (1-9 scale)
  - Mathematical topics (algebra, calculus, etc.)
  - Tags for additional categorization
- **Content**:
  - Rich problem statements with Markdown/LaTeX support
  - Embedded diagrams and mathematical notations
  - Optional solution hints
- **Moderator Tools**:
  - LaTeX editor with preview
  - Publishing workflow (draft → review → published)
  - Problem statistics dashboard

### Submission System
- **Input Methods**:
  - Direct text input for closed-ended problems
  - Image upload for handwritten proofs
  - Maximum file size: 10MB per image
- **Processing**:
  - Image conversion to LaTeX format
  - Syntax validation
  - Mathematical equivalence checking

### Evaluation Pipeline

The evaluation pipeline analyzes mathematical proofs and provides feedback using a single unified function in a loop pattern. For complete details, see the [Evaluation Pipeline](evaluation-pipeline.md) document.

#### Key Components

- `image_to_LaTeX`: Converts image submissions to LaTeX
- `find_all_errors`: Identifies errors in proofs
- `process_evaluation`: Unified function that handles initial evaluation and appeals in a loop

#### Evaluation Flow

```
do {
    evaluate and output errors
    if user chooses not to appeal, break
} while (appeal_count < max_appeals)
```

This iterative approach processes appeals within the same function call until either the user is satisfied or the maximum appeal limit is reached.

### User Interface Requirements

- **Dashboard**:
  - Problem discovery with filtering and sorting
  - Progress tracking with activity visualization
  - Recent submissions and results
- **Problem Interface**:
  - Difficulty indicators and success rates
  - Topic badges and related problems
  - Submission history for current problem
- **Feedback Display**:
  - Error highlighting in submissions
  - Constructive guidance on improvements
  - Appeal interface for contested evaluations

## Database Schema

### Users
- `id`: Unique identifier
- `username`: User's display name
- `email`: User's email address
- `password_hash`: Hashed password
- `role`: User role (user, moderator, admin)
- `created_at`: Account creation timestamp
- `last_login`: Last login timestamp

### Problems
- `id`: Unique identifier
- `title`: Problem title
- `statement`: Problem statement (in Markdown/LaTeX)
- `difficulty`: Difficulty level (1-9)
- `topics`: Array of mathematical topics
- `created_by`: Reference to creator (moderator)
- `created_at`: Creation timestamp
- `is_published`: Publication status

### Submissions
- `id`: Unique identifier
- `problem_id`: Reference to problem
- `user_id`: Reference to user
- `content_type`: Type of submission (direct input or image)
- `content`: Submission content or image reference
- `latex_content`: LaTeX representation (for image submissions)
- `score`: Numerical score
- `feedback`: Feedback in Markdown format
- `submitted_at`: Submission timestamp

### Appeals
- `id`: Unique identifier
- `submission_id`: Reference to submission
- `appealed_errors`: Array of contested errors
- `justifications`: Array of justification texts or image references
- `status`: Appeal status (pending, approved, rejected)
- `created_at`: Appeal timestamp
- `resolved_at`: Resolution timestamp

## API Specification

### Endpoints

- **Authentication**: 
  - POST /auth/register
  - POST /auth/login
  - POST /auth/refresh
  - GET /auth/oauth/google
- **Users**: 
  - GET /users/{id}
  - PATCH /users/{id}
  - GET /users/{id}/submissions
- **Problems**: 
  - GET /problems
  - GET /problems/{id}
  - POST /problems
  - PUT /problems/{id}
- **Submissions**: 
  - POST /submissions
  - GET /submissions/{id}
  - POST /submissions/{id}/appeals

### Rate Limiting

| Endpoint | User | Moderator | Admin |
|----------|------|-----------|-------|
| Authentication | 10/min | 10/min | 10/min |
| Problem listing | 30/min | 60/min | Unlimited |
| Problem detail | 30/min | 60/min | Unlimited |
| Submissions | 5/min | 20/min | 30/min |
| Appeals | 3/min | 10/min | 15/min |

## Performance Requirements

- Page load time: < 2 seconds
- Submission evaluation time: < 20 seconds
- Support for up to 1000 concurrent users
- Storage for 10,000+ problems and 1,000,000+ submissions

### Caching Strategy

- **Client-side caching**: Browser caching for static assets (1 week)
- **CDN caching**: For images and static content (1 day)
- **API response caching**: Problem listings and details (5 minutes)
- **Database query caching**: Frequently accessed data (2 minutes)
- **LLM result caching**: Cache similar evaluations to reduce API calls
- **Redis implementation**: For session data and rate limiting

## Deployment Environments

### Development Environment

- **Purpose**: Local development and testing
- **Configuration**:
  - Debug mode enabled
  - Local database instance
  - Mock LLM services
  - No rate limiting
  - Full error details in responses
- **Environment Variables**:
  ```
  DEBUG=true
  DB_HOST=localhost
  MOCK_LLM=true
  LOG_LEVEL=debug
  ```

### Staging Environment

- **Purpose**: Pre-production testing and QA
- **Configuration**:
  - Production-like settings
  - Separate database instance from production
  - Actual LLM services but with lower rate limits
  - Limited user access
  - Comprehensive logging
- **Environment Variables**:
  ```
  DEBUG=false
  ENVIRONMENT=staging
  RATE_LIMIT_FACTOR=0.5
  LOG_LEVEL=info
  ```

### Production Environment

- **Purpose**: Live application serving real users
- **Configuration**:
  - Debug mode disabled
  - Full optimization enabled
  - Production database with backups
  - Rate limiting enforced
  - Minimal error details in responses
- **Environment Variables**:
  ```
  DEBUG=false
  ENVIRONMENT=production
  ENABLE_CACHE=true
  LOG_LEVEL=warning
  ```

## Monitoring & Logging

### Logging Requirements

- **Format**: Structured JSON logs with context information
- **Log Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL with appropriate usage
- **Request Logging**: HTTP requests with path, method, status code, response time
- **Error Logging**: Full stack traces with context for debugging
- **User Activity**: Login attempts, submissions, appeals (without sensitive data)
- **Performance Metrics**: Response times and resource usage

### Monitoring Requirements

- **Health Checks**: Endpoint for system status (/health)
- **Metrics Collection**: Prometheus for time-series metrics
- **Dashboards**: Grafana for visualization
- **Alerting**: Configurable thresholds for critical metrics
- **Performance Tracking**: Resource usage, response times, error rates
- **User Experience Monitoring**: Page load times, interaction metrics

### Key Metrics

- API response times
- Submission evaluation times
- Error rates by endpoint
- Database query performance
- Authentication success/failure rates
- Concurrent users
- Resource utilization (CPU, memory, disk)
- Cache hit/miss rates  