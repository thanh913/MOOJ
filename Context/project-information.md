# MOOJ - Mathematical Online Open Judge - Project Information

## Project Overview

MOOJ is an online judge platform specifically designed for mathematics proofs. Unlike traditional programming online judges, MOOJ allows users to submit mathematical proofs as images, which are then converted to LaTeX and evaluated using LLM technology. The platform supports both closed-ended problems with direct solution input and open-ended problems requiring proof submissions.

### Project Mascot

MOOJ features a friendly cow mascot named "Moo" who guides users through the platform. The cow theme reflects the project name (MOOJ as a play on "moo") and provides a memorable, approachable character that can be used throughout the UI for guidance, tips, and error messages. The mascot helps make the sometimes intimidating world of mathematical proofs more accessible and engaging.

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
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **API Documentation**: OpenAPI/Swagger
- **Image Processing**: OpenCV, Tesseract

### Deployment
- **Containerization**: Docker and Docker Compose
- **Self-hosted**: Initial deployment
- **Future Cloud**: AWS/GCP (architecture designed for easy migration)

## Core Features

### User System
- Three-tier user roles: regular users, moderators, and administrators
- Authentication with email/password and Google OAuth
- Role-based access control for platform features

### Problem Management
- Problems categorized by difficulty levels (1-9) and mathematical topics
- Support for Markdown and LaTeX in problem statements
- Moderator interface for creating, editing, and managing problems

### Submission System
- Direct input for closed-ended problems
- Image upload for proof-based problems
- Conversion of image to LaTeX format (via the `image_to_LaTeX` module)
- Evaluation pipeline using LLM for proof verification

### Evaluation Logic
- `find_all_errors`: Identifies all errors in a submitted proof
- `return_evaluation`: Generates score and feedback based on identified errors
- Appeal system allowing users to contest specific errors with justifications
- Re-evaluation process considering user appeals

### User Experience
- Progress tracking with GitHub-like activity visualization
- Problem filtering and sorting by difficulty and topics
- Submission history and statistics
- Future: Comment system, blogs, and contests

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

## API Endpoints

### Authentication
- `POST /auth/register`: Create new user account
- `POST /auth/login`: User login
- `POST /auth/google`: Google OAuth login
- `GET /auth/me`: Get current user information

### Users
- `GET /users`: List users (admin only)
- `GET /users/{id}`: Get user details
- `PUT /users/{id}`: Update user
- `PATCH /users/{id}/role`: Update user role (admin only)

### Problems
- `GET /problems`: List problems with filtering
- `POST /problems`: Create new problem (moderator+)
- `GET /problems/{id}`: Get problem details
- `PUT /problems/{id}`: Update problem (moderator+)
- `DELETE /problems/{id}`: Delete problem (moderator+)

### Submissions
- `POST /problems/{id}/submit`: Submit solution
- `GET /submissions`: List user submissions
- `GET /submissions/{id}`: Get submission details
- `POST /submissions/{id}/appeal`: Appeal evaluation
- `GET /users/{id}/progress`: Get user progress data

## Evaluation Pipeline

The evaluation pipeline follows this process:

1. User submits a solution (direct input or image)
2. If image: Convert to LaTeX using `image_to_LaTeX` module
3. Process the solution through `return_evaluation`:
   ```
   return_evaluation(problem_statement, LaTeX_solution)
       # Initial evaluation
       all_errors = find_all_errors(problem_statement, LaTeX_solution)
       score, feedback = evaluate_solution(problem_statement, LaTeX_solution, all_errors, no_appeals=true)
       
       # Present initial feedback to user
       output(score, feedback)
       
       # Appeal process
       appeals = []
       while (user_chooses_to_appeal && appeals.length < max_appeals) {
           appealed_errors = collect_user_appealed_errors(all_errors)
           justifications = collect_user_justifications(appealed_errors)
           
           appeals.push({errors: appealed_errors, justifications: justifications})
           
           # Re-evaluate with appeals
           updated_score, updated_feedback = evaluate_solution(problem_statement, LaTeX_solution, all_errors, appeals)
           
           # Update displayed results
           output(updated_score, updated_feedback)
           
           # Check if all errors have been appealed or appeal limit reached
           if (all_errors_appealed(all_errors, appeals) || appeals.length >= max_appeals) {
               break
           }
       }
       
       # Return final evaluation
       return {
           score: updated_score,
           feedback: updated_feedback,
           original_errors: all_errors,
           appeals: appeals,
           final_errors: get_remaining_errors(all_errors, appeals)
       }
   ```

## Project Roadmap

1. MVP: Basic problem submission, evaluation, and user management
2. Phase 2: Enhanced problem management and filtering
3. Phase 3: Appeal system and refined evaluation
4. Phase 4: User progress tracking and statistics
5. Phase 5: Community features (comments, blogs)
6. Phase 6: Contest system and public API

## Performance Targets

- Page load time: < 2 seconds
- Submission evaluation time: < 20 seconds
- Support for up to 1000 concurrent users
- Storage for 10,000+ problems and 1,000,000+ submissions 