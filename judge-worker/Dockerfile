# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory to root
WORKDIR /

# Install system dependencies if needed
# RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy requirements to root and install
COPY ./judge-worker/requirements.txt /requirements.txt
RUN pip install --no-cache-dir -r /requirements.txt

# Copy the backend's app directory AS /app
COPY ./backend/app /app 

# Copy the worker script into the root
COPY ./judge-worker/worker.py /worker.py

# No need to modify PYTHONPATH if app is at root

# Run worker.py from the root
CMD ["python", "/worker.py"]
