# MOOJ Evaluation Pipeline

## Table of Contents

1. [Overview](#1-overview)
2. [Pipeline Components](#2-pipeline-components)
   - [Image to LaTeX Conversion](#21-image-to-latex-conversion)
   - [Error Detection](#22-error-detection)
   - [Evaluation and Scoring](#23-evaluation-and-scoring)
   - [Appeal Processing](#24-appeal-processing)
3. [Data Flow](#3-data-flow)
   - [Initial Submission Flow](#31-initial-submission-flow)
   - [Appeal Flow](#32-appeal-flow)
4. [Object Schemas](#4-object-schemas)
   - [Error Objects](#41-error-objects)
   - [Appeal Objects](#42-appeal-objects)
   - [Evaluation Results](#43-evaluation-results)
5. [Implementation Guidelines](#5-implementation-guidelines)
   - [Error Handling](#51-error-handling)
   - [Parallelization](#52-parallelization)
   - [LLM Integration](#53-llm-integration)
6. [Testing Strategy](#6-testing-strategy)

## 1. Overview

The evaluation pipeline is the core of the MOOJ platform, responsible for analyzing mathematical proofs and providing detailed feedback. It consists of several components that work together to process submissions, identify errors, generate evaluations, and handle appeals.

The pipeline is designed with a two-phase approach:
1. Initial evaluation of a user's submission
2. Separate appeal processing for contested errors

This separation ensures clear responsibility boundaries and enables users to receive immediate feedback while maintaining the ability to appeal specific errors later.

## 2. Pipeline Components

### 2.1 Image to LaTeX Conversion

**Component**: `image_to_LaTeX`

**Purpose**: Convert handwritten or image-based mathematical proofs to LaTeX format for evaluation.

**Specifications**:
- **Input**: Image file (JPG/PNG) in base64 or binary format
- **Output**: LaTeX string representation of mathematical content
- **Technology**: OCR with specialized mathematical notation recognition
- **Error Handling**: Robust handling for poor image quality, illegible text
- **Timeout**: 30 seconds maximum processing time

### 2.2 Error Detection

**Component**: `find_all_errors`

**Purpose**: Analyze LaTeX proofs to identify logical, mathematical, and syntactical errors.

**Specifications**:
- **Input**: LaTeX solution, problem statement
- **Output**: Array of error objects with detailed information
- **Error Types**: 
  - Logical: Incorrect reasoning or invalid assumptions
  - Mathematical: Incorrect application of rules or theorems
  - Syntactical: Structural or notation errors
- **Analysis Methods**: LLM-powered analysis with context-aware detection
- **Output Format**: Standardized error objects with unique identifiers

### 2.3 Evaluation and Scoring

**Component**: `evaluate_solution`

**Purpose**: Generate a numerical score and detailed feedback based on identified errors.

**Specifications**:
- **Input**: Problem statement, solution, error list, optional appeals
- **Output**: Numerical score (0-100) and structured Markdown feedback
- **Scoring Algorithm**: Error-based scoring weighted by severity
  - High severity errors: -20 points
  - Medium severity errors: -10 points
  - Low severity errors: -5 points
  - Accepted appeals: +5 points per accepted appeal
- **Feedback Generation**: Customized feedback based on error types and patterns
- **Appeal Integration**: Score adjustments for accepted appeals

### 2.4 Appeal Processing

**Component**: `process_appeals`

**Purpose**: Handle user appeals for contested errors and re-evaluate accordingly.

**Specifications**:
- **Input**: Original evaluation, error list, user justifications
- **Output**: Updated evaluation with appeal results
- **Appeal Validation**: LLM-powered assessment of user justifications
- **Error Status Updates**: Tracking of appealed errors and acceptance status
- **Limits**: Configurable maximum appeals per submission

## 3. Data Flow

### 3.1 Initial Submission Flow

1. User submits a solution (direct LaTeX input or image)
2. If image submission:
   - `image_to_LaTeX` converts the image to LaTeX format
3. `find_all_errors` analyzes the LaTeX solution and identifies errors
4. `evaluate_solution` generates a score and feedback based on errors
5. `return_evaluation` packages the complete evaluation:
   - LaTeX representation
   - Score and feedback
   - List of errors with details
   - Appealable errors
   - Appeals remaining

```
┌──────────┐      ┌───────────────┐      ┌──────────────┐      ┌─────────────────┐
│ Submission│─────▶│image_to_LaTeX │─────▶│find_all_errors│─────▶│evaluate_solution│
└──────────┘      └───────────────┘      └──────────────┘      └─────────────────┘
                                                                        │
                                                                        ▼
                                                                ┌─────────────────┐
                                                                │return_evaluation │
                                                                └─────────────────┘
                                                                        │
                                                                        ▼
                                                                ┌─────────────────┐
                                                                │   User Review   │
                                                                └─────────────────┘
```

### 3.2 Appeal Flow

1. User reviews evaluation and identifies errors to contest
2. User provides justifications for each contested error
3. System retrieves original submission and errors
4. `process_appeals` evaluates each appeal:
   - Validates user justifications against original errors
   - Updates error statuses (appealed, appeal_accepted)
   - Recalculates score based on accepted appeals
5. Updated evaluation is returned to the user
6. Process can be repeated until appeal limit is reached

```
┌──────────┐      ┌───────────────┐      ┌──────────────────┐
│  Appeals  │─────▶│Original Eval  │─────▶│  process_appeals │
└──────────┘      └───────────────┘      └──────────────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │ Updated Evaluation│
                                          └──────────────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │   User Review    │
                                          └──────────────────┘
```

## 4. Object Schemas

### 4.1 Error Objects

Errors are represented as structured objects with the following properties:

```json
{
  "id": "error-123",
  "type": "logical" | "mathematical" | "syntactical",
  "location": "Line 3, step 2",
  "description": "Invalid application of chain rule",
  "severity": "high" | "medium" | "low",
  "appealed": false,
  "appeal_accepted": null
}
```

- `id`: Unique identifier for the error
- `type`: Category of the error (logical, mathematical, syntactical)
- `location`: Reference to where the error occurs in the solution
- `description`: Detailed explanation of the error
- `severity`: Impact of the error on the solution (high/medium/low)
- `appealed`: Whether this error has been appealed by the user
- `appeal_accepted`: Result of the appeal (null if not appealed)

### 4.2 Appeal Objects

Appeals are represented as structured objects with the following properties:

```json
{
  "error_id": "error-123",
  "justification": "I believe my application of the chain rule is correct because...",
  "submission_timestamp": "2023-11-14T12:00:00Z"
}
```

- `error_id`: Reference to the specific error being appealed
- `justification`: User's explanation of why they believe the error is incorrect
- `submission_timestamp`: When the appeal was submitted

### 4.3 Evaluation Results

Initial evaluation results include:

```json
{
  "submission_id": 456,
  "latex_representation": "\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)",
  "score": 75,
  "feedback": "# Evaluation Results\n\n## Overall Assessment\n...",
  "errors": [/* Array of error objects */],
  "appealable_errors": ["error-1", "error-2"],
  "appeals_remaining": 3
}
```

Appeal processing results include:

```json
{
  "submission_id": 456,
  "latex_representation": "\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)",
  "score": 80,
  "feedback": "# Updated Evaluation\n\n...",
  "errors": [/* Array of updated error objects */],
  "appeals_processed": 2,
  "appeals_accepted": 1,
  "appeals_remaining": 1
}
```

## 5. Implementation Guidelines

### 5.1 Error Handling

- Configure timeouts for all external API calls:
  - Image processing: 30 seconds
  - LLM API calls: 15 seconds
- Implement retry mechanisms for transient failures:
  - Maximum 3 retries with exponential backoff
  - Jitter to prevent synchronized retries
- Provide graceful degradation:
  - Fallback to simpler models if advanced models fail
  - Cache common responses for faster recovery
- Comprehensive error logging:
  - Log all failures with context
  - Include user ID, submission ID, and step in pipeline
- User-facing error messages:
  - Clear, actionable error messages
  - Guidance on how to retry or resolve issues

### 5.2 Parallelization

- Process multiple images in a submission concurrently
- Analyze different parts of a proof in parallel
- Batch similar operations across submissions
- Implement worker queue system for distributing load
- Track processing time metrics for optimization

### 5.3 LLM Integration

- Use versioned prompts with clear instructions
- Include examples in prompts for consistent results
- Implement prompt templates with variable substitution
- Cache common evaluation patterns
- Use smaller models for initial screening, larger models for detailed analysis
- Validate LLM outputs against expected formats

## 6. Testing Strategy

- Unit tests for each pipeline component
- Integration tests for the complete flow
- Mock tests for LLM interactions
- Edge case handling:
  - Poor quality images
  - Extreme solutions (very long or very short)
  - Unusual mathematical notation
- Performance testing:
  - Response time under load
  - Concurrent request handling
- Appeal validation testing:
  - Valid and invalid appeal scenarios
  - Edge cases for score adjustments 