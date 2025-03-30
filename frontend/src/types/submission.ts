import { Problem } from './problem'; // Import if needed for nested data later

// Matches backend schema enum
export enum SubmissionStatus {
    Pending = "pending",
    Processing = "processing",
    Completed = "completed",
    Failed = "failed",
}

// Matches backend ErrorDetail schema
export interface ErrorDetail {
    id: string;
    type: string;
    location?: string;
    description: string;
    severity?: string;
    status?: 'active' | 'appealed' | 'overturned' | 'rejected';
}

// Interface for Submission data returned from API (matches backend response schema)
export interface Submission {
    id: number;
    problem_id: number;
    solution_text: string;
    submitted_at: string; // Represent dates as strings from JSON
    status: SubmissionStatus;
    score?: number;
    feedback?: string;
    errors?: ErrorDetail[];
    // problem?: Problem; // Optional: Include if API response nests problem data
}

// Interface for data needed to create a submission (matches backend create schema)
export interface SubmissionCreate {
    problem_id: number;
    solution_text: string;
}

// Optional: Interface for appeal payload (Add later)
// export interface AppealPayload {
//     submissionId: number;
//     errorId: string;
//     justification: string;
// } 