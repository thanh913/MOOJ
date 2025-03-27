import os
import json
import requests
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from datetime import datetime
from sqlalchemy.orm import Session

from app.db import User
from app.api.repositories import UserRepository

load_dotenv()

# Google OAuth config
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

# Get Google provider configuration
def get_google_provider_cfg():
    """Get Google provider configuration."""
    return requests.get(GOOGLE_DISCOVERY_URL).json()

# Exchange authorization code for tokens
def exchange_code_for_token(code: str, redirect_uri: str) -> Dict[str, Any]:
    """
    Exchange the authorization code for an access token and ID token.
    """
    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg["token_endpoint"]

    token_url, headers, data = prepare_token_request(
        token_endpoint,
        authorization_response=code,
        redirect_url=redirect_uri,
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET
    )

    token_response = requests.post(
        token_url,
        headers=headers,
        data=data,
    )

    return token_response.json()

# Prepare token request parameters
def prepare_token_request(
    token_endpoint: str,
    authorization_response: str,
    redirect_url: str,
    client_id: str,
    client_secret: str,
) -> tuple:
    """
    Prepare the token request parameters.
    """
    return (
        token_endpoint,
        {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        {
            "code": authorization_response,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_url,
            "grant_type": "authorization_code"
        }
    )

# Get user info from Google
def get_google_user_info(id_token: str) -> Dict[str, Any]:
    """
    Get user info from Google using the ID token.
    """
    google_provider_cfg = get_google_provider_cfg()
    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    
    response = requests.get(
        userinfo_endpoint,
        headers={"Authorization": f"Bearer {id_token}"}
    )
    
    return response.json()

# Find or create user from Google data
def find_or_create_user(db: Session, google_data: Dict[str, Any]) -> User:
    """
    Find an existing user by email or create a new one from Google data.
    """
    user_repository = UserRepository()
    
    # Check if user exists by email
    email = google_data.get("email")
    if not email:
        raise ValueError("Email not provided by Google")
    
    user = user_repository.get_user_by_email(db, email)
    
    if user:
        # Update user's last login
        user = user_repository.update_last_login(db, user)
        
        # If user doesn't have a google_id, add it
        if not user.google_id and google_data.get("sub"):
            user.google_id = google_data["sub"]
            db.commit()
            db.refresh(user)
            
        return user
    
    # Create new user
    username = generate_username_from_email(email)
    
    # Ensure username is unique
    while user_repository.get_user_by_username(db, username):
        username = f"{username}{datetime.now().microsecond}"
    
    new_user = User(
        email=email,
        username=username,
        google_id=google_data.get("sub"),
        is_active=True,
        # Set a null password_hash since the user will log in via Google
        password_hash=None
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

# Helper function to generate username from email
def generate_username_from_email(email: str) -> str:
    """
    Generate a username from an email address.
    """
    username = email.split('@')[0]
    # Remove any non-alphanumeric characters except underscores
    username = ''.join(c for c in username if c.isalnum() or c == '_')
    return username 