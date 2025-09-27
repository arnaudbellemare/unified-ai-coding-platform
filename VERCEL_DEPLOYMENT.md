# 🚀 Vercel Deployment Guide

This guide helps you deploy the Unified AI Coding Platform to Vercel with real functionality.

## 📋 Prerequisites

- Vercel account
- GitHub repository connected to Vercel
- API keys and database credentials ready

## 🔧 Environment Variables Setup

### Required Environment Variables

Add these environment variables in your Vercel dashboard:

#### Database Configuration
```bash
POSTGRES_URL=postgresql://username:password@host:port/database
```

#### Authentication
```bash
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app.vercel.app
```

#### AI Providers (At least one required)
```bash
# OpenAI
OPENAI_API_KEY=your_openai_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key

# Perplexity
PERPLEXITY_API_KEY=your_perplexity_key

# Cursor
CURSOR_API_KEY=your_cursor_key
```

#### Optional Integrations
```bash
# Privy Wallet Integration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# GitHub Integration
GITHUB_TOKEN=your_github_token

# x402 Payment Protocol
BASE_PRIVATE_KEY=your_base_private_key
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
COINBASE_CDP_API_KEY_ID=your_coinbase_cdp_key_id
COINBASE_CDP_API_KEY_SECRET=your_coinbase_cdp_key_secret

# AI Gateway
AI_GATEWAY_API_KEY=your_ai_gateway_key
```

## 🎯 How It Works

### Local Development
- **Development Mode**: Mock data, no API calls
- **Environment**: `NEXT_PUBLIC_DEV_MODE=true` + `NODE_ENV=development`
- **Purpose**: Fast testing without API costs

### Vercel Production
- **Real Mode**: Actual API calls, real database, real authentication
- **Environment**: `VERCEL=1` + `NODE_ENV=production`
- **Purpose**: Full production functionality

### Automatic Detection
The application automatically detects the environment:

```typescript
// Development mode only for local development
isDevMode = NEXT_PUBLIC_DEV_MODE === 'true' && 
           VERCEL !== '1' && 
           NODE_ENV === 'development'
```

## 🚀 Deployment Steps

### 1. Connect Repository
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Click "New Project"
- Import your GitHub repository

### 2. Configure Environment Variables
- In project settings, go to "Environment Variables"
- Add all required variables listed above
- Make sure to set them for "Production" environment

### 3. Deploy
- Click "Deploy"
- Vercel will automatically build and deploy

### 4. Verify Deployment
- Visit your deployed URL
- Test authentication with GitHub
- Test optimization features with real AI providers
- Verify database connectivity

## 🔍 Testing After Deployment

### Authentication Test
1. Click "Sign in with GitHub"
2. Verify GitHub OAuth flow works
3. Check user data is stored in database

### Optimization Test
1. Go to "Research Optimization" tab
2. Enter a test prompt
3. Verify real AI optimization results
4. Check cost calculations are accurate

### Database Test
1. Create a new task
2. Verify it's stored in PostgreSQL
3. Check task persistence across sessions

## 🛠️ Troubleshooting

### Common Issues

#### "Database not available"
- Check `POSTGRES_URL` is correct
- Verify database is accessible from Vercel
- Check connection limits

#### "Authentication required"
- Verify GitHub OAuth is configured
- Check `NEXTAUTH_SECRET` is set
- Ensure `NEXTAUTH_URL` matches your domain

#### "No AI provider available"
- Add at least one AI provider API key
- Check API key permissions and billing
- Verify API key format is correct

### Debug Mode
Add this environment variable for detailed logs:
```bash
DEBUG=*
```

## 📊 Production Features

Once deployed, you'll have access to:

- ✅ **Real AI Optimization** (GEPA, Research, Cloudflare Code Mode)
- ✅ **Actual Database Storage** (PostgreSQL)
- ✅ **GitHub Authentication** (OAuth)
- ✅ **Cost Optimization** (Real token counting and pricing)
- ✅ **Task Management** (Persistent storage)
- ✅ **Multi-Agent Support** (Claude, GPT-4, Perplexity, etc.)

## 🔒 Security Notes

- Never commit API keys to Git
- Use Vercel's environment variable system
- Enable branch protection on main branch
- Monitor API usage and costs
- Set up proper CORS policies if needed

## 📈 Monitoring

After deployment, monitor:
- API usage and costs
- Database performance
- Authentication success rates
- Optimization effectiveness
- User engagement metrics

---

**Ready to deploy?** Just add your environment variables and deploy! 🚀
