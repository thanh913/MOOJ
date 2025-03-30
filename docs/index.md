# MOOJ Documentation

Welcome to the documentation for MOOJ (Mathematical Online Open Judge), an online platform for evaluating mathematics proofs using automated feedback.

## Quick Navigation by Task

- **Setting up the project**: [Setup & Installation](./setup.md)
- **Implementing judge workflow changes**: [Architecture > Evaluation Pipeline](./architecture.md#data-flow--evaluation-pipeline) → [Development > Backend > Evaluation Pipeline](./development.md#evaluation-pipeline)
- **Adding new problems**: [Usage Guide > Problem Management](./usage.md)
- **Making frontend changes**: [Development > Frontend Details](./development.md#frontend-details-react)
- **Adding backend features**: [Development > Backend Details](./development.md#backend-details-fastapi)
- **Running/writing tests**: [Development > Testing](./development.md#testing-backend---pytest)

## Documentation Sections

*   **[Setup & Installation](./setup.md)**: Running MOOJ locally using Docker.
*   **[Usage Guide](./usage.md)**: Using the MOOJ platform features.
*   **[System Architecture](./architecture.md)**: Overview of components, data flow, and technical design.
*   **[Development Guide](./development.md)**: Information for contributors (code style, practices, structure).

All documentation including backend-specific details is now consolidated into these main sections. Backend development information is included in the Development Guide, backend architecture details are in the System Architecture document, and backend setup instructions are part of the Setup & Installation guide.

## Current Status

MOOJ is currently an MVP (Minimum Viable Product) demonstrating core functionality. Key features include problem browsing/filtering, solution submission (LaTeX/image), mock evaluation feedback, and an appeal system.

## Development Focus

The current development efforts are focused on:

1.  **Decoupling Judge**: Implementing a separate judge worker service using RabbitMQ for asynchronous evaluation.
2.  **Integration Testing**: Adding comprehensive backend tests for submission, evaluation, and appeal workflows.

## Frequently Asked Questions

**Q: How does the judging workflow function?**  
A: The judging workflow is an asynchronous process that starts when a user submits a solution, which is then evaluated by a worker service. See the [Evaluation Pipeline](./architecture.md#data-flow--evaluation-pipeline) for a detailed explanation.

**Q: Where is the code for the evaluation pipeline?**  
A: The evaluation pipeline code is in `backend/app/evaluation/`. Implementation details are in the [Development Guide](./development.md#evaluation-pipeline).

**Q: How do I modify the feedback generation?**  
A: Feedback generation is handled in the `evaluate_solution` component of the evaluation pipeline. See [Development > Evaluation Pipeline](./development.md#evaluation-pipeline). 