# Usage Guide

Guide for using MOOJ features after [setup](./setup.md).

## Navigation Overview

MOOJ offers a simple navigation structure with:

- **Home**: Landing page with introduction and links
- **Problems**: Browse, search, and filter mathematical problems
- **My Submissions**: View your submission history and status
- **User Profile**: (Planned feature)

## Problem Management

### Browsing Problems

*   Navigate to **Problems** (`/problems`)
*   View problem list displayed as cards with:
    - Title
    - Difficulty rating
    - Topic tags
    - Brief description
*   Use the toolbar with:
    - **Search** by problem title or keywords
    - **Filter** by difficulty (Easy/Medium/Hard)
    - **Filter** by topic
    - **Sort** by newest/difficulty

### Viewing Problem Details

*   Click any problem card to open its detail page (`/problems/:id`)
*   The problem page shows:
    - Complete problem statement with mathematical notation
    - Submission box
    - Problem metadata (difficulty, topics)

## Submission Workflow

### Creating a Submission

1.  On a problem detail page, locate the **Submit Solution** section
2.  Choose your input method:
    - **Type LaTeX**: Enter mathematical notation directly
    - **Upload Image**: Upload a photo/scan of your handwritten solution
3.  Click **Submit**
4.  System will redirect to the submission status page

### Tracking Submission Status

*   After submitting, you'll be redirected to the submission page (`/submissions/:id`)
*   The submission starts with status **pending/processing**
*   Refresh or wait for automatic update to **completed/failed**
*   View:
    - Your original submission
    - Score (0-100)
    - Detailed feedback
    - List of specific errors detected

### Using the Appeal System

If you believe an error was incorrectly identified:

1.  Find the specific error you want to contest
2.  Click the **Appeal** button next to that error
3.  Enter your **justification** explaining why you think the error is not valid
4.  Click **Submit Appeal**
5.  The error status will change to **appealed**
6.  (In full implementation, an instructor would review the appeal)

## Example Workflow

1. Browse to the Problems page
2. Find a problem matching your interests using filters
3. Open the problem detail page
4. Solve the problem on paper or digitally
5. Submit your solution using LaTeX or by uploading an image
6. Wait for the evaluation to complete
7. Review your score and feedback
8. If needed, appeal any errors you believe were incorrectly identified
9. Revise your solution based on feedback and resubmit if desired

## Frequently Asked Questions

**Q: What file formats are accepted for image uploads?**  
A: The system accepts PNG, JPEG, and PDF formats for submissions.

**Q: How is my submission evaluated?**  
A: Submissions are evaluated by analyzing the mathematical proof for logical and structural errors. The system checks for completeness, correctness, and clarity of explanation.

**Q: Can I resubmit a solution?**  
A: Yes, you can submit multiple solutions to the same problem. Each submission is evaluated independently.

**Q: What do the error types mean?**  
A: Common error types include:
- Logical fallacies
- Incomplete proofs
- Incorrect application of theorems
- Notation errors
- Missing steps

**Q: How long does evaluation take?**  
A: In the current implementation, evaluation typically takes a few seconds. This will vary based on system load in a production environment.

**See also:**
- [Architecture > Evaluation Pipeline](./architecture.md#data-flow--evaluation-pipeline) for technical details
- [Setup Guide](./setup.md) if you're having trouble accessing the system 