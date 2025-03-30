# MOOJ Documentation

Welcome to the documentation for MOOJ (Mathematical Online Open Judge), an online platform for evaluating mathematics proofs using automated feedback.

## Documentation Sections

*   **[Setup & Installation](./setup.md)**: Running MOOJ locally using Docker.
*   **[Usage Guide](./usage.md)**: Using the MOOJ platform features.
*   **[System Architecture](./architecture.md)**: Overview of components, data flow, and technical design.
*   **[Development Guide](./development.md)**: Information for contributors (code style, practices, structure).

## Current Status

MOOJ is currently an MVP (Minimum Viable Product) demonstrating core functionality. Key features include problem browsing/filtering, solution submission (LaTeX/image), mock evaluation feedback, and an appeal system.

## Development Focus

The current development efforts are focused on:

1.  **Decoupling Judge**: Implementing a separate judge worker service using RabbitMQ for asynchronous evaluation.
2.  **Integration Testing**: Adding comprehensive backend tests for submission, evaluation, and appeal workflows. 