FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Add healthcheck
RUN pip install requests
COPY healthcheck.py /healthcheck.py
RUN chmod +x /healthcheck.py
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD python /healthcheck.py

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
