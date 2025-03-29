// Mirrored from backend/app/schemas/token.py
export interface Token {
    access_token: string;
    token_type: string;
}

export interface TokenData {
    id?: string | null;
    role?: string | null;
} 