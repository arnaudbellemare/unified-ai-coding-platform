"""
FastAPI Backend for Advanced AI Cost Optimization
Enhanced with ML capabilities and real-time analytics
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import tiktoken
from pydantic import BaseModel, Field
import httpx
import redis
from celery import Celery
import plotly.graph_objects as go
import plotly.express as px
from scipy import stats
import seaborn as sns
import matplotlib.pyplot as plt

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Cost Optimization Engine",
    description="Advanced ML-powered cost optimization with real-time analytics",
    version="2.0.0"
)

# CORS middleware
allowed_origins = [
    "http://localhost:3000", 
    "http://localhost:3001",
    "https://unified-ai-coding-platform.vercel.app",  # Production Vercel app
    "https://unified-ai-coding-platform-git-main-arnaudbellemare.vercel.app",  # Preview deployments
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis for caching and real-time data (with fallback for production)
import os
try:
    redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
    redis_client = redis.from_url(redis_url, decode_responses=True)
    redis_client.ping()  # Test connection
    logger.info("Redis connected successfully")
except Exception as e:
    logger.warning(f"Redis not available: {e}")
    redis_client = None

# Celery for background tasks (with fallback for production)
try:
    celery_broker = os.getenv('REDIS_URL', 'redis://localhost:6379')
    celery_app = Celery('optimization', broker=celery_broker)
    logger.info("Celery configured successfully")
except Exception as e:
    logger.warning(f"Celery not available: {e}")
    celery_app = None

# Global variables for WebSocket connections
active_connections: List[WebSocket] = []

# Pydantic models
class OptimizationRequest(BaseModel):
    prompt: str = Field(..., description="The prompt to optimize")
    context: str = Field(default="general", description="Context type (coding, analysis, etc.)")
    budget: float = Field(default=0.05, description="Maximum budget in USD")
    quality_threshold: float = Field(default=0.95, description="Minimum quality threshold")
    optimization_strategy: str = Field(default="auto", description="Optimization strategy to use")

class OptimizationResult(BaseModel):
    original_prompt: str
    optimized_prompt: str
    cost_reduction: float
    quality_score: float
    optimization_strategies: List[str]
    confidence: float
    estimated_savings: float
    token_analysis: Dict[str, Any]
    ml_insights: Dict[str, Any]

class ProviderPerformance(BaseModel):
    provider_id: str
    cost_per_token: float
    quality_score: float
    response_time: float
    reliability: float
    recommendation_score: float

class AnalyticsRequest(BaseModel):
    time_range: str = Field(default="7d", description="Time range for analytics")
    metrics: List[str] = Field(default=["cost", "quality", "performance"])

# Advanced ML Optimization Engine
class MLOptimizationEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.cost_predictor = RandomForestRegressor(n_estimators=100, random_state=42)
        self.quality_predictor = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.historical_data = pd.DataFrame()
        self.is_trained = False
        
    def prepare_training_data(self):
        """Prepare synthetic training data for ML models"""
        # Generate synthetic optimization data
        prompts = [
            "Create a React component for user authentication",
            "Build a REST API with Node.js and Express",
            "Implement a machine learning model for classification",
            "Design a responsive dashboard with real-time data",
            "Create a mobile app with React Native",
            "Build a microservices architecture",
            "Implement OAuth2 authentication flow",
            "Create a data visualization component",
            "Build a real-time chat application",
            "Implement a recommendation system"
        ]
        
        # Generate synthetic features and targets
        data = []
        for prompt in prompts:
            for _ in range(50):  # 50 variations per prompt
                features = {
                    'prompt_length': len(prompt) + np.random.randint(-20, 20),
                    'word_count': len(prompt.split()) + np.random.randint(-5, 5),
                    'complexity_score': np.random.uniform(0.1, 1.0),
                    'context_type': np.random.choice(['coding', 'analysis', 'general']),
                    'budget': np.random.uniform(0.01, 0.1),
                    'quality_threshold': np.random.uniform(0.8, 1.0)
                }
                
                # Calculate synthetic targets
                cost_reduction = np.random.uniform(0.05, 0.35)
                quality_score = np.random.uniform(0.85, 0.99)
                
                data.append({
                    **features,
                    'cost_reduction': cost_reduction,
                    'quality_score': quality_score,
                    'original_prompt': prompt,
                    'optimized_prompt': prompt.replace('Create', 'Build').replace('Implement', 'Code')
                })
        
        self.historical_data = pd.DataFrame(data)
        return self.historical_data
    
    def train_models(self):
        """Train ML models on historical data"""
        if self.historical_data.empty:
            self.prepare_training_data()
        
        # Prepare features
        feature_columns = ['prompt_length', 'word_count', 'complexity_score', 'budget', 'quality_threshold']
        X = self.historical_data[feature_columns]
        
        # Train cost predictor
        y_cost = self.historical_data['cost_reduction']
        self.cost_predictor.fit(X, y_cost)
        
        # Train quality predictor
        y_quality = self.historical_data['quality_score']
        self.quality_predictor.fit(X, y_quality)
        
        # Fit scaler
        self.scaler.fit(X)
        
        self.is_trained = True
        logger.info("ML models trained successfully")
    
    def predict_optimization(self, prompt: str, context: str, budget: float, quality_threshold: float) -> Dict[str, Any]:
        """Predict optimization results using ML models"""
        if not self.is_trained:
            self.train_models()
        
        # Extract features
        features = np.array([[
            len(prompt),
            len(prompt.split()),
            self._calculate_complexity(prompt),
            budget,
            quality_threshold
        ]])
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Make predictions
        predicted_cost_reduction = self.cost_predictor.predict(features_scaled)[0]
        predicted_quality = self.quality_predictor.predict(features_scaled)[0]
        
        # Calculate confidence based on model variance
        cost_variance = np.var(self.cost_predictor.estimators_, axis=0).mean()
        confidence = max(0.5, 1.0 - cost_variance)
        
        return {
            'predicted_cost_reduction': float(predicted_cost_reduction),
            'predicted_quality': float(predicted_quality),
            'confidence': float(confidence),
            'complexity_score': float(self._calculate_complexity(prompt))
        }
    
    def _calculate_complexity(self, prompt: str) -> float:
        """Calculate prompt complexity score"""
        complexity_indicators = [
            'machine learning', 'neural network', 'deep learning', 'algorithm',
            'optimization', 'performance', 'scalability', 'microservices',
            'real-time', 'asynchronous', 'concurrent', 'distributed'
        ]
        
        prompt_lower = prompt.lower()
        complexity_score = sum(1 for indicator in complexity_indicators if indicator in prompt_lower)
        
        # Normalize to 0-1 scale
        return min(1.0, complexity_score / 5.0)

# Initialize ML engine
ml_engine = MLOptimizationEngine()

# Advanced Optimization Strategies
class AdvancedOptimizationStrategies:
    def __init__(self):
        self.strategies = {
            'entropy_optimization': self._entropy_optimization,
            'semantic_compression': self._semantic_compression,
            'context_aware_trimming': self._context_aware_trimming,
            'ml_guided_optimization': self._ml_guided_optimization,
            'adaptive_compression': self._adaptive_compression
        }
    
    def _entropy_optimization(self, prompt: str) -> str:
        """Optimize based on information entropy"""
        words = prompt.split()
        word_freq = {}
        for word in words:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # Remove low-entropy words
        total_words = len(words)
        optimized_words = []
        for word in words:
            if word_freq[word] / total_words > 0.1:  # Keep frequent words
                optimized_words.append(word)
            elif len(word) > 6:  # Keep longer words (likely important)
                optimized_words.append(word)
        
        return ' '.join(optimized_words)
    
    def _semantic_compression(self, prompt: str) -> str:
        """Compress based on semantic similarity"""
        # Simple semantic compression (in production, use sentence transformers)
        replacements = {
            'create a': 'build',
            'implement a': 'code',
            'develop a': 'make',
            'construct a': 'build',
            'generate a': 'create',
            'produce a': 'make',
            'design a': 'build',
            'establish a': 'create'
        }
        
        optimized = prompt.lower()
        for old, new in replacements.items():
            optimized = optimized.replace(old, new)
        
        return optimized
    
    def _context_aware_trimming(self, prompt: str) -> str:
        """Trim based on context importance"""
        # Remove redundant phrases
        redundant_phrases = [
            'please', 'kindly', 'i would like to', 'i need to',
            'could you', 'would you', 'i want to'
        ]
        
        optimized = prompt
        for phrase in redundant_phrases:
            optimized = optimized.replace(phrase, '')
        
        return ' '.join(optimized.split())
    
    def _ml_guided_optimization(self, prompt: str, ml_insights: Dict[str, Any]) -> str:
        """Use ML insights to guide optimization"""
        complexity = ml_insights.get('complexity_score', 0.5)
        
        if complexity > 0.7:  # High complexity
            return self._entropy_optimization(prompt)
        elif complexity > 0.4:  # Medium complexity
            return self._semantic_compression(prompt)
        else:  # Low complexity
            return self._context_aware_trimming(prompt)
    
    def _adaptive_compression(self, prompt: str) -> str:
        """Adaptive compression based on prompt characteristics"""
        # Combine multiple strategies based on prompt analysis
        optimized = prompt
        
        # Apply entropy optimization
        optimized = self._entropy_optimization(optimized)
        
        # Apply semantic compression
        optimized = self._semantic_compression(optimized)
        
        # Apply context trimming
        optimized = self._context_aware_trimming(optimized)
        
        return optimized

# Initialize optimization strategies
opt_strategies = AdvancedOptimizationStrategies()

# Real-time Analytics Engine
class RealTimeAnalytics:
    def __init__(self):
        self.metrics_history = []
        self.provider_performance = {}
        
    def update_metrics(self, optimization_result: Dict[str, Any]):
        """Update real-time metrics"""
        self.metrics_history.append({
            'timestamp': datetime.now().isoformat(),
            **optimization_result
        })
        
        # Keep only last 1000 entries
        if len(self.metrics_history) > 1000:
            self.metrics_history = self.metrics_history[-1000:]
    
    def get_real_time_analytics(self) -> Dict[str, Any]:
        """Get real-time analytics"""
        if not self.metrics_history:
            return {
                'total_optimizations': 0,
                'average_savings': 0,
                'total_savings': 0,
                'success_rate': 0
            }
        
        df = pd.DataFrame(self.metrics_history)
        
        return {
            'total_optimizations': len(df),
            'average_savings': df['cost_reduction'].mean(),
            'total_savings': df['cost_reduction'].sum(),
            'success_rate': (df['quality_score'] > 0.9).mean(),
            'recent_trend': df['cost_reduction'].tail(10).mean(),
            'top_strategies': df['optimization_strategies'].explode().value_counts().head(5).to_dict()
        }
    
    def generate_performance_charts(self) -> Dict[str, str]:
        """Generate performance charts using Plotly"""
        if not self.metrics_history:
            return {}
        
        df = pd.DataFrame(self.metrics_history)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Cost reduction over time
        fig_cost = px.line(df, x='timestamp', y='cost_reduction', 
                          title='Cost Reduction Over Time')
        cost_chart = fig_cost.to_html(include_plotlyjs=False, div_id="cost-chart")
        
        # Quality scores distribution
        fig_quality = px.histogram(df, x='quality_score', 
                                  title='Quality Score Distribution')
        quality_chart = fig_quality.to_html(include_plotlyjs=False, div_id="quality-chart")
        
        return {
            'cost_chart': cost_chart,
            'quality_chart': quality_chart
        }

# Initialize analytics engine
analytics_engine = RealTimeAnalytics()

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove dead connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

# API Endpoints
@app.get("/")
async def root():
    return {"message": "AI Cost Optimization Engine API", "version": "2.0.0"}

@app.post("/optimize", response_model=OptimizationResult)
async def optimize_prompt(request: OptimizationRequest):
    """Advanced ML-powered prompt optimization"""
    try:
        # Get ML predictions
        ml_insights = ml_engine.predict_optimization(
            request.prompt, 
            request.context, 
            request.budget, 
            request.quality_threshold
        )
        
        # Select optimization strategy
        if request.optimization_strategy == "auto":
            if ml_insights['complexity_score'] > 0.7:
                strategy = 'ml_guided_optimization'
            elif ml_insights['complexity_score'] > 0.4:
                strategy = 'adaptive_compression'
            else:
                strategy = 'semantic_compression'
        else:
            strategy = request.optimization_strategy
        
        # Apply optimization
        if strategy == 'ml_guided_optimization':
            optimized_prompt = opt_strategies.strategies[strategy](request.prompt, ml_insights)
        else:
            optimized_prompt = opt_strategies.strategies[strategy](request.prompt)
        
        # Calculate token usage
        encoding = tiktoken.get_encoding("cl100k_base")
        original_tokens = len(encoding.encode(request.prompt))
        optimized_tokens = len(encoding.encode(optimized_prompt))
        
        # Calculate cost reduction
        cost_reduction = ml_insights['predicted_cost_reduction']
        estimated_savings = cost_reduction * 0.05  # Assuming $0.05 base cost
        
        result = OptimizationResult(
            original_prompt=request.prompt,
            optimized_prompt=optimized_prompt,
            cost_reduction=cost_reduction,
            quality_score=ml_insights['predicted_quality'],
            optimization_strategies=[strategy],
            confidence=ml_insights['confidence'],
            estimated_savings=estimated_savings,
            token_analysis={
                'original_tokens': original_tokens,
                'optimized_tokens': optimized_tokens,
                'token_reduction': original_tokens - optimized_tokens,
                'reduction_percentage': (original_tokens - optimized_tokens) / original_tokens * 100
            },
            ml_insights=ml_insights
        )
        
        # Update analytics
        analytics_engine.update_metrics(result.dict())
        
        # Broadcast to WebSocket clients
        await manager.broadcast(json.dumps({
            'type': 'optimization_completed',
            'data': result.dict()
        }))
        
        return result
        
    except Exception as e:
        logger.error(f"Optimization error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics")
async def get_analytics(request: AnalyticsRequest = None):
    """Get real-time analytics and performance metrics"""
    try:
        analytics = analytics_engine.get_real_time_analytics()
        charts = analytics_engine.generate_performance_charts()
        
        return {
            'analytics': analytics,
            'charts': charts,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/providers")
async def get_provider_performance():
    """Get AI provider performance metrics"""
    try:
        # Mock provider data (in production, fetch from database)
        providers = [
            ProviderPerformance(
                provider_id="openai-gpt4",
                cost_per_token=0.03,
                quality_score=0.95,
                response_time=1.2,
                reliability=0.99,
                recommendation_score=0.92
            ),
            ProviderPerformance(
                provider_id="openai-gpt35",
                cost_per_token=0.002,
                quality_score=0.88,
                response_time=0.8,
                reliability=0.98,
                recommendation_score=0.89
            ),
            ProviderPerformance(
                provider_id="anthropic-claude",
                cost_per_token=0.032,
                quality_score=0.97,
                response_time=1.5,
                reliability=0.97,
                recommendation_score=0.91
            ),
            ProviderPerformance(
                provider_id="perplexity-sonar",
                cost_per_token=0.005,
                quality_score=0.90,
                response_time=2.1,
                reliability=0.96,
                recommendation_score=0.87
            )
        ]
        
        return {
            'providers': [provider.dict() for provider in providers],
            'recommendations': sorted(providers, key=lambda x: x.recommendation_score, reverse=True)
        }
    except Exception as e:
        logger.error(f"Provider performance error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Send periodic updates
            await asyncio.sleep(5)
            analytics = analytics_engine.get_real_time_analytics()
            await manager.send_personal_message(
                json.dumps({
                    'type': 'analytics_update',
                    'data': analytics
                }),
                websocket
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Background tasks
@celery_app.task
def train_ml_models():
    """Background task to retrain ML models"""
    try:
        ml_engine.train_models()
        logger.info("ML models retrained successfully")
    except Exception as e:
        logger.error(f"ML model training error: {str(e)}")

@celery_app.task
def update_provider_metrics():
    """Background task to update provider metrics"""
    try:
        # In production, fetch real provider metrics
        logger.info("Provider metrics updated")
    except Exception as e:
        logger.error(f"Provider metrics update error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
