# Judging Flow

This document details the lifecycle of a submission, from initial processing through evaluation and the appeal process within MOOJ.

## Core Concepts

*   **Asynchronous Evaluation:** Submissions are primarily processed asynchronously by a dedicated Judge Worker service, decoupled from the main API via a message queue (RabbitMQ).
*   **Modular Evaluators:** The system uses a router (`EvaluatorRouter`) to select and utilize different evaluator implementations (`BaseEvaluator`) for analysing solutions.
*   **Defined Statuses:** Submissions and individual errors within them follow specific status lifecycles.

## Submission Status Lifecycle

1.  **`pending`**: Submission received by the API, awaiting processing.
2.  **`processing`**: Judge Worker has picked up the task and is actively evaluating (`find_errors` running).
3.  **`completed`**: Judge Worker finished evaluation successfully. This means either no significant errors were found initially, or the user accepted the score, or appeals were processed and the final state determined.
4.  **`evaluation_error`**: The Judge Worker encountered an internal system error and could not complete the evaluation.
5.  **`appealing`**: Initial evaluation found significant errors. Awaiting user action (submit appeals or accept score). Remains `appealing` during appeal batch processing.

## Error Status Lifecycle (`ErrorDetail.status`)

1.  **`active`**: Initial status for a detected error.
2.  **`appealing`**: User has included this error in a submitted appeal batch; awaiting evaluator processing.
3.  **`resolved`**: Appeal successful; error is no longer considered active.
4.  **`rejected`**: Appeal unsuccessful; error remains conceptually active but cannot be appealed again.
5.  **`overturned`**: (Potential Future Use) For distinguishing specific appeal success reasons.

## Submission Processing Flow (Initial)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant BackendAPI
    participant RabbitMQ
    participant JudgeWorker
    participant EvaluatorRouter
    participant Evaluator
    participant Database

    User->>Frontend: Submits Solution (LaTeX/Image)
    Frontend->>BackendAPI: POST /api/v1/submissions
    BackendAPI->>Database: Create Submission (status=pending)
    Database-->>BackendAPI: Return submission_id
    opt If RabbitMQ Available
        BackendAPI->>RabbitMQ: Publish Task {submission_id}
        BackendAPI-->>Frontend: Respond 202 Accepted (with submission_id)
    else Synchronous Fallback
        BackendAPI->>EvaluatorRouter: find_errors(submission_details)
        EvaluatorRouter->>Evaluator: find_errors(...)
        Evaluator-->>EvaluatorRouter: Return errors
        alt No Errors Found
             BackendAPI->>Database: Update Submission (status=completed, score=100, errors=[])
        else Errors Found
             BackendAPI->>Database: Update Submission (status=appealing, score=0, errors=[...])
        end
        BackendAPI-->>Frontend: Respond 200 OK (with full submission)
    end
    
    JudgeWorker->>RabbitMQ: Consume Task {submission_id}
    JudgeWorker->>Database: Update Submission status=processing
    JudgeWorker->>Database: Get Submission & Problem details
    JudgeWorker->>EvaluatorRouter: find_errors(submission, problem)
    EvaluatorRouter->>Evaluator: find_errors(...)
    Evaluator-->>EvaluatorRouter: Return errors
    alt No Significant Errors
        JudgeWorker->>Database: Update Submission (status=completed, score=100, errors=[])
    else Significant Errors Found
        JudgeWorker->>Database: Update Submission (status=appealing, score=0, errors=[...])
    else Worker Error
        JudgeWorker->>Database: Update Submission (status=evaluation_error)
    end
```

**Steps:**

1.  **Submission**: User submits via Frontend.
2.  **API Request**: Frontend `POST`s to Backend API.
3.  **DB Create**: Backend creates `Submission` record (status `pending`).
4.  **Publish/Fallback**: Backend attempts to publish task to RabbitMQ. If successful, returns `202 Accepted`. If MQ fails, performs synchronous evaluation (Steps 7-9 equivalent) and returns `200 OK` with results.
5.  **Consume Task**: Judge Worker picks up task from RabbitMQ.
6.  **Set Processing**: Worker updates submission status to `processing` in DB.
7.  **Fetch Details**: Worker retrieves full submission and associated problem data from DB.
8.  **Find Errors**: Worker uses `EvaluatorRouter` to call the appropriate `Evaluator.find_errors` method.
9.  **Determine Status**: Based on the errors returned:
    *   No significant errors: Update status to `completed`, set score (e.g., 100), store empty/trivial errors.
    *   Significant errors found: Update status to `appealing`, set score (e.g., 0), store error list.
    *   Internal worker error: Update status to `evaluation_error`.

## Appeal and Re-evaluation Flow

This flow begins when a submission is in the `appealing` state.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant BackendAPI
    participant EvaluatorRouter
    participant Evaluator
    participant Database

    User->>Frontend: Views submission (status=appealing)
    alt Option 1: Accept Score
        User->>Frontend: Clicks "Accept Score"
        Frontend->>BackendAPI: POST /api/v1/submissions/{id}/accept
        BackendAPI->>Database: Update Submission status=completed
        Database-->>BackendAPI: Confirm update
        BackendAPI-->>Frontend: Return updated Submission
        Frontend->>User: Show final state (score accepted)
    else Option 2: Submit Appeal Batch
        User->>Frontend: Selects active errors (e.g., err1, err3)
        User->>Frontend: Provides justification for err1
        User->>Frontend: Provides justification for err3
        Frontend->>BackendAPI: POST /api/v1/submissions/{id}/appeals (body: List[{error_id, justification}])
        BackendAPI->>Database: Check status=appealing, check appeal_attempts < limit (5)
        opt If Checks Pass
            BackendAPI->>Database: Increment appeal_attempts
            BackendAPI->>Database: Update status of err1, err3 in Submission.errors to 'appealing'
            BackendAPI->>Database: Fetch full Submission and Problem objects
            BackendAPI->>EvaluatorRouter: process_appeal(appeals_batch, submission, problem)
            Note over EvaluatorRouter,Evaluator: process_appeal iterates batch,
            updates error statuses (resolved/rejected)
            in the submission object's errors list.
            EvaluatorRouter->>Database: Persist updated Submission.errors
            BackendAPI->>EvaluatorRouter: evaluate(current_errors, submission, problem)
            EvaluatorRouter->>Evaluator: evaluate(...)
            Evaluator-->>EvaluatorRouter: Return final score
            BackendAPI->>Database: Update Submission score and status=completed
            Database-->>BackendAPI: Confirm update
            BackendAPI-->>Frontend: Return updated Submission
            Frontend->>User: Show appeal results and final state
        else Checks Fail (Wrong Status or Limit Reached)
            BackendAPI-->>Frontend: Respond Error (e.g., 409 Conflict or 403 Forbidden)
        end
    end
```

**Steps:**

1.  **View Appealing Submission**: User opens a submission currently in the `appealing` state.
2.  **User Choice**: User decides to either accept the current score or appeal errors.
3.  **Accept Score Path**: 
    *   User clicks "Accept Score".
    *   Frontend calls a dedicated endpoint (e.g., `POST /submissions/{id}/accept`).
    *   Backend API verifies status is `appealing`, then updates status to `completed`.
    *   UI updates to reflect the finalized state.
4.  **Appeal Path**: 
    *   User selects one or more `active` errors.
    *   User provides justification for each selected error.
    *   Frontend submits a *single* `POST /submissions/{id}/appeals` request with a list of `(error_id, justification)` pairs.
5.  **Backend Pre-checks**: API checks if submission is `appealing` and if `appeal_attempts` (max 5) is not exceeded. Rejects if checks fail.
6.  **Prepare Appeal**: API increments `appeal_attempts`, updates the status of appealed errors in the database `Submission.errors` list to `appealing`, and fetches necessary `Submission` and `Problem` data.
7.  **Process Appeals Batch**: API calls `EvaluatorRouter.process_appeal`, passing the list of appeals and the context objects. The evaluator implementation iterates the batch, determines outcomes (`resolved`/`rejected`), and updates the error statuses directly or returns the updated list.
8.  **Persist Appeal Results**: API persists the updated error statuses (now `resolved` or `rejected`) in the database.
9.  **Re-evaluate**: API calls `EvaluatorRouter.evaluate`, passing the *current* state of submission errors (considering `active` and `rejected` ones, ignoring `resolved`).
10. **Final Update**: API updates the `Submission.score` based on the `evaluate` result and sets the `Submission.status` to `completed` (as judging finished).
11. **Respond & Update UI**: API returns the final submission state; UI updates.
