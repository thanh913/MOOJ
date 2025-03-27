# MOOJ - LLM README

## Key Documentation

- **implementation-plan.md**: Sequential steps for implementation
- **project-information.md**: Technical specifications and system design
- **project-rules.md**: Development standards and architectural decisions

Update these documents when implementing features.

## Development Progress

This section tracks the current implementation state of MOOJ. Update this when completing steps from the implementation plan.

**Current Phase:** Phase 1 - MVP Development

**Completed Steps:**
- None yet

**In Progress:**
- Project setup

**Next Steps:**
- Complete project setup
- Implement core authentication

## Project Purpose

MOOJ is an online judge for mathematics proofs where users submit solutions directly or as images of handwritten proofs.

### Project Mascot

The cow mascot "Moo" represents the brand throughout the UI, providing guidance, showing loading states, and delivering feedback.

## Core Components

1. **Image-to-LaTeX Conversion**: Converts proof images to LaTeX format

2. **Evaluation Pipeline**:
   - `find_all_errors`: Identifies errors in LaTeX proofs
   - `return_evaluation`: Generates scores and feedback
   - Appeal system: Allows contesting specific errors

3. **User Roles**: Regular users, moderators, and administrators

4. **Problem Management**: Problems with difficulty levels (1-9) and topics

## Technical Stack

- **Frontend**: React/TypeScript, Material-UI, MathJax/KaTeX
- **Backend**: FastAPI, PostgreSQL/SQLAlchemy
- **Authentication**: JWT with Google OAuth
- **Deployment**: Docker, initially self-hosted

## Implementation Focus

1. **Modularity**: Create independent, testable components

2. **Performance**:
   - Optimize image processing
   - Balance LLM accuracy with speed
   - Efficient database queries

3. **Security**:
   - Proper authentication/authorization
   - Secure upload handling

## Special Considerations

1. **LLM Integration**: Create robust prompts and handle edge cases

2. **Mathematical Notation**: Support complex notation in problems and solutions

3. **Evaluation Accuracy**: Implement reliable appeal system

4. **User Experience**: Design intuitive interfaces for solving and appeals 