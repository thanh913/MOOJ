import { User } from './user'; // Import the User type

// Base properties shared by create/update/read
interface ProblemBase {
    title: string;
    statement: string;
    difficulty: number;
    topics?: string[] | null;
    is_published: boolean;
}

// Type for creating a problem (matches ProblemCreate schema)
export interface ProblemCreate extends ProblemBase {}

// Type for updating a problem (matches ProblemUpdate schema)
export interface ProblemUpdate {
    title?: string;
    statement?: string;
    difficulty?: number;
    topics?: string[] | null;
    is_published?: boolean;
}

// Type for reading a problem (matches Problem schema)
export interface Problem extends ProblemBase {
    id: number;
    created_by_id: number;
    created_at: string; // Represent datetimes as strings
    creator: User; // Nested creator details
} 