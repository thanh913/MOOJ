FROM python:3.9-slim

WORKDIR /app

# Install Tesseract OCR and other dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1-mesa-glx && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Add healthcheck
RUN pip install requests
COPY healthcheck.py /healthcheck.py
RUN chmod +x /healthcheck.py
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD python /healthcheck.py

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
