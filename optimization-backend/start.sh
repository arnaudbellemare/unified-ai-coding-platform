#!/bin/bash

# FastAPI Backend Startup Script
echo "🚀 Starting AI Cost Optimization Engine (FastAPI Backend)"

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Redis is not running. Starting Redis with Docker..."
    docker run -d -p 6379:6379 --name optimization-redis redis:alpine
    sleep 3
fi

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

echo "📦 Installing dependencies..."
source venv/bin/activate
pip install -r requirements.txt

# Start Celery worker in background
echo "🔄 Starting Celery worker..."
celery -A app.celery_app worker --loglevel=info --detach

# Start FastAPI server
echo "🌟 Starting FastAPI server on http://localhost:8000"
echo "📊 API Documentation: http://localhost:8000/docs"
echo "🔌 WebSocket: ws://localhost:8000/ws"
echo ""
echo "✅ FastAPI Backend is ready!"
echo "   - Optimization API: POST /optimize"
echo "   - Analytics API: GET /analytics"
echo "   - Provider Metrics: GET /providers"
echo "   - Real-time Updates: WebSocket /ws"
echo ""

uvicorn app:app --host 0.0.0.0 --port 8000 --reload
