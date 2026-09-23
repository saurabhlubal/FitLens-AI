# ==============================================================================
# Multi-Stage Dockerfile for Hugging Face Spaces (Port 7860)
# Stage 1: Build React 19 Frontend with Vite
# Stage 2: Serve Python FastAPI AI Movement Engine & Static Frontend
# ==============================================================================

# ---------- STAGE 1: FRONTEND BUILD ----------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ---------- STAGE 2: PYTHON FASTAPI BACKEND ----------
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PORT=7860 \
    HOST=0.0.0.0

WORKDIR /app

# Install system dependencies (curl for healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY ocr-service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python AI backend
COPY ocr-service/app ./app
COPY ocr-service/run_service.py ./run_service.py

# Copy built frontend from Stage 1 into /app/dist
COPY --from=frontend-builder /app/frontend/dist ./dist

# Create a non-root user (Hugging Face standard)
RUN useradd -m -u 1000 user && \
    chown -R user:user /app
USER user

EXPOSE 7860

# Run FastAPI app on port 7860 (Hugging Face default)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
