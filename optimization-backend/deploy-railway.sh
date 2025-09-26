#!/bin/bash

# FastAPI Backend Deployment Script for Railway
echo "🚀 Deploying FastAPI Backend to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    curl -fsSL https://railway.app/install.sh | sh
    export PATH="$HOME/.railway/bin:$PATH"
fi

# Login to Railway (if not already logged in)
echo "🔐 Logging into Railway..."
railway login

# Create new project (if it doesn't exist)
echo "📦 Creating Railway project..."
railway link

# Deploy the application
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🔗 Your FastAPI backend should be available at the URL provided by Railway"
echo "📋 Don't forget to:"
echo "   1. Copy the Railway deployment URL"
echo "   2. Add NEXT_PUBLIC_FASTAPI_URL to your Vercel environment variables"
echo "   3. Test the integration in your Vercel app"
