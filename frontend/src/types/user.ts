// Mirrored from backend/app/db/models/user.py
export enum UserRole {
    User = "user",
    Moderator = "moderator",
    Admin = "admin",
}

// Mirrored from backend/app/schemas/user.py -> User schema
export interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    created_at: string; // Represent datetimes as strings for simplicity in TS/JSON
    last_login?: string | null;
}

// Optional: Add types for UserCreate, UserUpdate if needed for frontend forms 