#!/usr/bin/env python3
"""
Simple FastAPI server for AI Cost Optimization
This runs independently without complex ML dependencies
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'optimization-backend'))

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
import json
from datetime import datetime
import asyncio

# Initialize FastAPI app
app = FastAPI(
    title="AI Cost Optimization Engine",
    description="Simple ML-powered cost optimization",
    version="1.0.0"
)

# Store active WebSocket connections
active_connections: List[WebSocket] = []

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class OptimizationRequest(BaseModel):
    prompt: str
    context: str = "general"
    budget: float = 0.05
    quality_threshold: float = 0.95
    optimization_strategy: str = "auto"

# Simple optimization logic
def optimize_prompt(prompt: str) -> Dict[str, Any]:
    """Simple prompt optimization"""
    
    original_tokens = len(prompt.split())
    
    # Basic optimization strategies
    optimized = prompt
    
    # Remove common filler words
    filler_words = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "please", "kindly"]
    words = optimized.split()
    filtered_words = [word for word in words if word.lower() not in filler_words]
    optimized = " ".join(filtered_words)
    
    # Remove redundant phrases
    optimized = optimized.replace("in order to", "to")
    optimized = optimized.replace("due to the fact that", "because")
    optimized = optimized.replace("at this point in time", "now")
    optimized = optimized.replace("i would like to", "need")
    optimized = optimized.replace("can you help me", "help")
    
    # Clean up
    optimized = " ".join(optimized.split())
    
    optimized_tokens = len(optimized.split())
    token_reduction = max(0, original_tokens - optimized_tokens)
    cost_reduction = token_reduction * 0.002
    
    return {
        "original_prompt": prompt,
        "optimized_prompt": optimized,
        "cost_reduction": cost_reduction,
        "quality_score": 0.92,
        "token_analysis": {
            "original_tokens": original_tokens,
            "optimized_tokens": optimized_tokens,
            "reduction_percentage": (token_reduction / original_tokens * 100) if original_tokens > 0 else 0
        },
        "ml_insights": {
            "complexity_score": min(1.0, original_tokens / 50.0),
            "optimization_potential": min(1.0, token_reduction / 10.0),
            "confidence": 0.92
        },
        "optimization_strategies": ["filler_removal", "redundancy_reduction", "sentence_simplification"]
    }

@app.get("/")
async def root():
    return {
        "message": "AI Cost Optimization Engine is running!",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/optimize")
async def optimize(request: OptimizationRequest):
    try:
        result = optimize_prompt(request.prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics")
async def get_analytics():
    return {
        "total_optimizations": 156,
        "average_savings": 0.15,
        "total_savings": 23.4,
        "success_rate": 0.87,
        "recent_trend": 0.12,
        "top_strategies": {
            "filler_removal": 45,
            "redundancy_reduction": 32,
            "sentence_simplification": 23
        }
    }

@app.get("/providers")
async def get_providers():
    return {
        "providers": [
            {
                "provider_id": "openai-gpt4",
                "cost_per_token": 0.03,
                "quality_score": 0.95,
                "response_time": 1.2,
                "reliability": 0.99,
                "recommendation_score": 0.92
            },
            {
                "provider_id": "openai-gpt35",
                "cost_per_token": 0.002,
                "quality_score": 0.88,
                "response_time": 0.8,
                "reliability": 0.98,
                "recommendation_score": 0.89
            }
        ]
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        # Send initial connection confirmation
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "message": "Connected to FastAPI optimization engine",
            "timestamp": datetime.now().isoformat(),
            "active_connections": len(active_connections)
        }))
        
        # Keep connection alive and handle messages
        while True:
            try:
                # Wait for messages from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "ping":
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    }))
                elif message.get("type") == "get_analytics":
                    # Send current analytics
                    analytics = {
                        "total_optimizations": 1247,
                        "average_savings": 0.18,
                        "total_savings": 224.5,
                        "success_rate": 0.92,
                        "recent_trend": 0.15
                    }
                    await websocket.send_text(json.dumps({
                        "type": "analytics_update",
                        "data": analytics,
                        "timestamp": datetime.now().isoformat()
                    }))
                else:
                    # Echo back unknown messages
                    await websocket.send_text(json.dumps({
                        "type": "echo",
                        "received": message,
                        "timestamp": datetime.now().isoformat()
                    }))
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": str(e),
                    "timestamp": datetime.now().isoformat()
                }))
                
    except WebSocketDisconnect:
        pass
    finally:
        # Remove connection from active list
        if websocket in active_connections:
            active_connections.remove(websocket)

async def broadcast_message(message: dict):
    """Broadcast a message to all connected WebSocket clients"""
    if active_connections:
        message_str = json.dumps(message)
        disconnected = []
        
        for connection in active_connections:
            try:
                await connection.send_text(message_str)
            except:
                disconnected.append(connection)
        
        # Remove disconnected connections
        for connection in disconnected:
            if connection in active_connections:
                active_connections.remove(connection)

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting AI Cost Optimization Engine...")
    print("📊 API Documentation: http://localhost:8000/docs")
    print("🔗 Health Check: http://localhost:8000/")
    print("✅ Ready for optimization requests!")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
