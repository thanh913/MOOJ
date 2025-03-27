from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core import create_access_token, get_current_active_user, get_current_admin
from app.core.oauth import exchange_code_for_token, get_google_user_info, find_or_create_user
from app.db import get_db, User
from app.api.schemas import UserCreate, UserLogin, UserResponse, TokenResponse, GoogleAuthRequest
from app.api.repositories import UserRepository

router = APIRouter()
user_repository = UserRepository()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    if user_repository.get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Check if username already exists
    if user_repository.get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )
    
    user = user_repository.create_user(db, user_data)
    return user

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login a user and return a JWT token."""
    user = user_repository.authenticate_user(db, user_data.email, user_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login time
    user_repository.update_last_login(db, user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=30),
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/google", response_model=TokenResponse)
async def google_login(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Login or register a user via Google OAuth."""
    try:
        # Exchange the code for tokens
        token_data = exchange_code_for_token(data.code, data.redirect_uri)
        if "error" in token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google OAuth error: {token_data['error']}",
            )
        
        # Get Google user info using the access token
        id_token = token_data.get("access_token")
        if not id_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No access token received from Google",
            )
        
        google_user = get_google_user_info(id_token)
        
        # Find or create user from Google data
        user = find_or_create_user(db, google_user)
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=30),
        )
        
        return {"access_token": access_token, "token_type": "bearer", "user": user}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to authenticate with Google: {str(e)}",
        )

@router.get("/me", response_model=UserResponse)
async def get_user_me(current_user: User = Depends(get_current_active_user)):
    """Get the current authenticated user."""
    return current_user

@router.put("/role/{user_id}", response_model=UserResponse)
async def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Update a user's role (admin only)."""
    if role not in ["user", "moderator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {role}",
        )
    
    user = user_repository.update_user_role(db, user_id, role)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found",
        )
    
    return user 