# Usage Guide

Guide for using MOOJ features after [setup](./setup.md).

## Navigation Overview

MOOJ offers a simple navigation structure with:

- **Home**: Landing page with introduction and links
- **Problems**: Browse, search, and filter mathematical problems
- **Submissions**: View submission history for all problems
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
    - Problem-specific submissions history

### Creating a New Problem

Only administrators and moderators can create new problems.

1. Navigate to the Administrator Dashboard.
2. Click on "Create Problem".
3. Fill in the required fields:
   - **Title**: A concise, descriptive title
   - **Statement**: The problem statement in LaTeX format
   - **Difficulty**: Select a float value between 1.0 and 9.0 based on the following scale:
     - **1.0 - 1.5: Easy (Green)**
       - *Description:* Requires applying a specific definition, formula, or algorithm directly.
       - *Examples:* Basic formula use, verifying definitions, first exercises on a topic.
     - **2.0 - 3.5: Intermediate (Blue)**
       - *Description:* Involves standard multi-step procedures or combining closely related concepts predictably.
       - *Examples:* Routine calculations, standard homework (Calc II, Physics I), simple proofs, AMC 10/12 level.
     - **4.0 - 6.0: Advanced (Yellow)**
       - *Description:* Needs synthesis of distinct concepts or creative adaptation of standard techniques; requires moderate insight.
       - *Examples:* Upper-division undergrad problems requiring synthesis, adapting methods for new contexts, AIME level or national olympiad qualifiers.
     - **6.5 - 8.0: Expert (Red)**
       - *Description:* Demands strategic application of advanced techniques, significant synthesis, or key insights for complex, non-obvious paths.
       - *Examples:* Difficult advanced undergrad/intro grad problems, crucial insights for complex problems, top competition range (IMO, IPhO, USACO Platinum).
     - **8.5 - 9.0: Master (Deep Red)**
       - *Description:* Requires deep insight, novel strategies, synthesis across advanced fields, or intense technicality/endurance.
       - *Examples:* Challenging graduate problems, developing bespoke techniques, simplified research questions, hardest competition problems (IMO P3/P6, Putnam A5/A6/B5/B6).
   - **Topics**: Relevant mathematical topics (e.g., "calculus", "linear algebra")
4. Toggle "Is Published" to make the problem visible to users.
5. Click "Create Problem".

For programmatic creation, use the `seed_problems.py` script (ensure the difficulty value matches the scale):

```python
problem = {
    "title": "Example Problem",
    "statement": "Prove that...",
    "difficulty": 2.5,  # Float value between 1.0 and 9.0 (Intermediate)
    "topics": ["algebra", "proof"],
    "is_published": True
}
```

### Editing a Problem

1. Navigate to the Administrator Dashboard.
2. Click on the problem you want to edit.
3. Click "Edit Problem".
4. Modify the problem details as needed.
5. Click "Save Changes".

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
    - Status (success/failure)
    - List of specific errors detected

### Viewing All Submissions

* Navigate to the **Submissions** page in the main navigation
* View a list of all submissions across all problems
* Filter submissions by:
  - Problem
  - Status (pending, completed, failed)
  - Date range
* Click on any submission to view its details

### Problem-Specific Submissions

* When viewing a problem detail page, you can see a list of submissions specific to that problem
* This provides a focused view of your attempts at solving a particular problem

### Using the Appeal System

If you believe an error was incorrectly identified:

1.  Find the specific error you want to contest
2.  Click the **Appeal** button next to that error
3.  Enter your **justification** explaining why you think the error is not valid
    - Note: Justification is required for all appeals
    - Appeals without justification will be automatically rejected
4.  Click **Submit Appeal**
5.  The error status will change to **appealed**
6.  After processing, the error will be marked as either:
    - **Resolved**: Appeal was successful
    - **Rejected**: Appeal was unsuccessful

## Reviewing Submissions and Appealing Errors

Once your submission has been processed by the Judge Worker, you can view the results on the Submission Detail page.

**Submission Statuses:**

*   **Pending / Processing**: Evaluation is underway. The page may auto-refresh.
*   **Completed**: Evaluation finished successfully. This doesn't necessarily mean your score is 100; it just means the judge completed its work. Check your score and any listed errors.
*   **Evaluation Error**: Something went wrong on the server side during evaluation. This is rare; consider resubmitting or contacting support if it persists.
*   **Appealing**: The initial evaluation found errors. You now have two options:
    *   **Accept Score**: If you agree with the assessment or don't wish to appeal, click the "Accept Score" button. The status will change to `Completed`, finalizing the result.
    *   **Submit Appeal**: If you disagree with one or more errors marked as `active`, you can initiate an appeal.

**Submitting an Appeal (Batch Process):**

1.  On the Submission Detail page for a submission in the `Appealing` state, review the list of errors.
2.  Select the checkbox next to each `active` error you wish to contest.
3.  For **every error you selected**, provide a clear and concise justification in the text box that appears.
4.  Once you have provided justifications for all selected errors, click the "Submit Appeals" button.
5.  Your appeal batch will be processed. The submission status remains `Appealing` during this time.
6.  Once processing is complete, the page will update:
    *   The status of appealed errors will change to `Resolved` (success) or `Rejected` (failure).
    *   The overall submission score will be recalculated based on the remaining active/rejected errors.
    *   The final submission status will become `Completed`.

**Appeal Limits:**

You can submit a maximum of **5** appeal batches per submission. Choose the errors you wish to contest carefully in each batch.
You cannot submit a new appeal batch while a previous one for the same submission is still being processed.

## Example Workflow

1. Browse to the Problems page
2. Find a problem matching your interests using filters
3. Open the problem detail page
4. Solve the problem on paper or digitally
5. Submit your solution using LaTeX or by uploading an image
6. Wait for the evaluation to complete
7. Review your submission results and any errors
8. If needed, appeal any errors you believe were incorrectly identified
   - Provide detailed justification for each appeal
9. Check appeal results (resolved or rejected)
10. Revise your solution based on feedback and resubmit if desired

## Frequently Asked Questions

**Q: What file formats are accepted for image uploads?**  
A: The system accepts PNG, JPEG, and PDF formats for submissions.

**Q: How is my submission evaluated?**  
A: Submissions are evaluated by analyzing the mathematical proof for logical and structural errors. The current system uses a placeholder evaluator that randomly generates errors, but future versions will use more sophisticated methods.

**Q: Can I resubmit a solution?**  
A: Yes, you can submit multiple solutions to the same problem. Each submission is evaluated independently.

**Q: What do the error severities mean?**  
A: Errors are classified as:
- **Trivial**: Minor issues that don't affect the overall correctness (formatting, notation)
- **Non-trivial**: Significant issues that affect the correctness of the solution (logical errors, incorrect steps)

**Q: How do appeals work?**  
A: You can appeal any error by providing justification. Appeals require detailed explanation of why you believe the error assessment is incorrect. Each appeal has a chance of being resolved (successful) or rejected.

**Q: Do I need to provide justification for appeals?**  
A: Yes, justification is required for all appeals. Appeals without adequate justification will be automatically rejected.

**See also:**
- [Architecture > Evaluation Pipeline](./architecture.md#data-flow--evaluation-pipeline) for technical details
- [Setup Guide](./setup.md) if you're having trouble accessing the system 