#!/usr/bin/env python3
"""
Connectivity test script for checking that all services are up and running.
Tests connection to frontend, backend, and database services.
"""
import requests
import sys
import psycopg2
import time
import os

MAX_RETRIES = 5
RETRY_DELAY = 2  # seconds

def test_backend_connection():
    """Test connection to backend API."""
    url = "http://localhost:8000/health"
    print(f"Testing backend connection: {url}")
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print("✅ Backend connection successful")
                return True
            print(f"❌ Backend health check failed (attempt {attempt + 1}/{MAX_RETRIES}): {response.status_code}")
        except requests.RequestException as e:
            print(f"❌ Backend connection failed (attempt {attempt + 1}/{MAX_RETRIES}): {str(e)}")
        
        if attempt < MAX_RETRIES - 1:
            print(f"Retrying in {RETRY_DELAY} seconds...")
            time.sleep(RETRY_DELAY)
    
    print("❌ Backend connection failed after all attempts")
    return False

def test_frontend_connection():
    """Test connection to frontend service."""
    url = "http://localhost:3000"
    print(f"Testing frontend connection: {url}")
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print("✅ Frontend connection successful")
                return True
            print(f"❌ Frontend check failed (attempt {attempt + 1}/{MAX_RETRIES}): {response.status_code}")
        except requests.RequestException as e:
            print(f"❌ Frontend connection failed (attempt {attempt + 1}/{MAX_RETRIES}): {str(e)}")
        
        if attempt < MAX_RETRIES - 1:
            print(f"Retrying in {RETRY_DELAY} seconds...")
            time.sleep(RETRY_DELAY)
    
    print("❌ Frontend connection failed after all attempts")
    return False

def test_database_connection():
    """Test connection to PostgreSQL database."""
    # Get connection parameters from environment or use defaults
    dbname = os.environ.get("POSTGRES_DB", "mooj")
    user = os.environ.get("POSTGRES_USER", "postgres")
    password = os.environ.get("POSTGRES_PASSWORD", "password")
    host = os.environ.get("POSTGRES_HOST", "localhost")
    port = os.environ.get("POSTGRES_PORT", "5432")
    
    print(f"Testing database connection: {host}:{port}/{dbname}")
    
    for attempt in range(MAX_RETRIES):
        try:
            conn = psycopg2.connect(
                dbname=dbname,
                user=user,
                password=password,
                host=host,
                port=port
            )
            conn.close()
            print("✅ Database connection successful")
            return True
        except psycopg2.OperationalError as e:
            print(f"❌ Database connection failed (attempt {attempt + 1}/{MAX_RETRIES}): {str(e)}")
        
        if attempt < MAX_RETRIES - 1:
            print(f"Retrying in {RETRY_DELAY} seconds...")
            time.sleep(RETRY_DELAY)
    
    print("❌ Database connection failed after all attempts")
    return False

if __name__ == "__main__":
    print("Starting connectivity tests...")
    
    backend_ok = test_backend_connection()
    frontend_ok = test_frontend_connection()
    database_ok = test_database_connection()
    
    print("\nConnectivity Test Results:")
    print(f"Backend: {'✅ PASS' if backend_ok else '❌ FAIL'}")
    print(f"Frontend: {'✅ PASS' if frontend_ok else '❌ FAIL'}")
    print(f"Database: {'✅ PASS' if database_ok else '❌ FAIL'}")
    
    if backend_ok and frontend_ok and database_ok:
        print("\n✅ All connectivity tests passed!")
        sys.exit(0)
    else:
        print("\n❌ Some connectivity tests failed!")
        sys.exit(1) 