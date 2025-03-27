# MOOJ - Project Rules

## Architecture Rules

1. **Modular Evaluation Pipeline**:
   - `image_to_LaTeX`: Image conversion module
   - `find_all_errors`: Error detection module
   - `return_evaluation`: Evaluation and feedback generation

2. **Backend Processing**: All mathematical processing must happen on the backend.

3. **API-First**: Define API contracts before implementing UI components.

4. **Repository Pattern**: Use repository pattern for database access.

## Development Standards

1. **MVP First**: Prioritize MVP features before enhancements.

2. **Testing Coverage**:
   - Core evaluation logic: 80% coverage
   - LLM interactions: Mock tests with known samples

3. **Frontend**:
   - Isolate LaTeX rendering in dedicated components

4. **Backend**:
   - Implement specific error types
   - Use dependency injection

5. **LLM Integration**:
   - Store prompts as versioned templates
   - Implement fallback mechanisms
   - Cache common evaluation results

## Security & Performance

1. **User Content**: Sanitize and validate all uploads.

2. **Authorization**: Enforce role checks at API level.

3. **Performance Targets**:
   - Image processing: < 5 seconds
   - API response: < 1 second for non-processing requests

## Branding

1. **Mascot Usage**: Use Moo cow for:
   - Loading indicators
   - Empty states
   - Messages and tutorials

2. **Color Palette**: Use established project colors consistently.

## Development Workflow

1. **Development Context**: Always read `llm-readme.md` at the start of any development session to understand current progress, completed steps, and next priorities.

2. **Progress Tracking**: When completing an implementation step:
   - Mark it as "Done" in implementation-plan.md with a brief summary
   - Move it from "In Progress" to "Completed Steps" in llm-readme.md
   - Update "Next Steps" in llm-readme.md accordingly

3. **MVP First**: Prioritize MVP features before enhancements.

4. **Feature Branches**: Use the following branch naming conventions:
   - `feature/[feature-name]` for new features
   - `fix/[issue-number]` for bug fixes
   - `refactor/[component-name]` for code refactoring

## Coding Standards

1. **Frontend**:
   - Use functional components with hooks
   - Implement responsive design for all UI components

2. **Backend**:
   - Use async/await patterns for all I/O operations

## Documentation Requirements

1. **API Documentation**: All API endpoints must include OpenAPI documentation.

2. **User-Facing Text**: Store all user-facing text in centralized message files for easy editing and localization.

## Configuration Management

1. **Environment Variables**: Use environment variables for all configuration that changes between environments.

2. **Feature Flags**: Implement feature flags for gradual rollout of new functionality. 