# FastAPI Backend Deployment Guide

## Overview
This guide shows how to deploy the FastAPI backend for advanced ML optimization to production, making it available for the Vercel-deployed frontend.

## Deployment Options

### Option 1: Railway (Recommended)
Railway is excellent for Python/FastAPI deployments with automatic scaling.

#### Steps:
1. **Create Railway Account**
   - Go to [Railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `unified-ai-coding-platform` repository
   - Choose the `optimization-backend` folder as the root directory

3. **Configure Environment Variables**
   - In Railway dashboard, go to your project → Variables
   - Add these variables:
     ```
     PORT=8000
     REDIS_URL=redis://localhost:6379  # Optional, for caching
     ```

4. **Deploy**
   - Railway will automatically build and deploy
   - Get your deployment URL (e.g., `https://your-app.railway.app`)

### Option 2: Render
Alternative platform for Python deployments.

#### Steps:
1. **Create Render Account**
   - Go to [Render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Root Directory**: `optimization-backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`

3. **Deploy**
   - Render will build and deploy automatically
   - Get your deployment URL

### Option 3: Fly.io
Great for global deployment with edge locations.

#### Steps:
1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create Fly App**
   ```bash
   cd optimization-backend
   fly launch
   ```

3. **Deploy**
   ```bash
   fly deploy
   ```

## Update Frontend Configuration

After deploying the FastAPI backend, update the frontend to use the production URL:

### 1. Update Environment Variables
In your Vercel project settings, add:
```
NEXT_PUBLIC_FASTAPI_URL=https://your-fastapi-app.railway.app
```

### 2. Update FastAPI Integration
The `lib/fastapi-integration.ts` will automatically use the production URL when `NEXT_PUBLIC_FASTAPI_URL` is set.

### 3. Test the Connection
- Go to your Vercel deployment
- Navigate to the FastAPI optimization section
- You should see "FastAPI Connected" instead of "Production Mode"

## Verification

### Check Backend Health
Visit your FastAPI backend URL + `/docs` to see the API documentation:
```
https://your-fastapi-app.railway.app/docs
```

### Test Optimization
1. Go to your Vercel app
2. Navigate to "Economy Engine" → "FastAPI ML Optimization"
3. Enter a prompt and click "Optimize with FastAPI"
4. You should see real ML optimization results

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure your Vercel domain is in the `allowed_origins` list in `app.py`
   - Check the CORS middleware configuration

2. **Redis/Celery Errors**
   - These are optional features that will fallback gracefully
   - The app will work without them

3. **Build Failures**
   - Check that all dependencies in `requirements.txt` are compatible
   - Ensure Python version is 3.8+

### Environment Variables Reference:
```bash
# Required
PORT=8000

# Optional (for enhanced features)
REDIS_URL=redis://your-redis-url:6379
CELERY_BROKER_URL=redis://your-redis-url:6379

# For external API integrations
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
PERPLEXITY_API_KEY=your-perplexity-key
```

## Cost Considerations

- **Railway**: Free tier available, pay-as-you-scale
- **Render**: Free tier available, $7/month for always-on
- **Fly.io**: Generous free tier, pay-per-use

## Production Features

Once deployed, your FastAPI backend will provide:

✅ **Advanced ML Optimization** with scikit-learn
✅ **Real-time Analytics** and performance metrics  
✅ **WebSocket Support** for live updates
✅ **Token Analysis** and cost prediction
✅ **Provider Performance** monitoring
✅ **Automatic Scaling** based on demand

## Next Steps

1. Deploy using one of the options above
2. Update your Vercel environment variables
3. Test the integration
4. Monitor performance and costs
5. Scale as needed

The FastAPI backend will significantly enhance your platform's optimization capabilities with real ML algorithms instead of simulated results!
