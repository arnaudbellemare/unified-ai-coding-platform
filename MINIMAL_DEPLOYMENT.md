# Minimal Deployment Guide

## ✅ **What You ACTUALLY Need for Deployment**

### **Required Environment Variables:**
1. **`POSTGRES_URL`** - Your Supabase database connection string
2. **`AI_GATEWAY_API_KEY`** - Your Vercel AI Gateway key (already provided)
3. **`VERCEL_TOKEN`** - Your Vercel API token (already provided)
4. **`VERCEL_TEAM_ID`** - Your Vercel team ID (already provided)
5. **`VERCEL_PROJECT_ID`** - Your Vercel project ID (already provided)
6. **`OPENAI_API_KEY`** - Your OpenAI API key (for Codex agent)

### **Optional Environment Variables:**
- **`GITHUB_TOKEN`** - Only needed for private repositories (public repos work without it)
- **`ANTHROPIC_API_KEY`** - Only needed if using Claude agent (you're using Codex by default)

## 🎯 **Minimal Working Configuration**

For the **Codex agent** (which is the default), you only need these 6 variables:

```
POSTGRES_URL=your_supabase_connection_string
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key
VERCEL_TOKEN=your_vercel_token
VERCEL_TEAM_ID=your_vercel_team_id
VERCEL_PROJECT_ID=your_vercel_project_id
OPENAI_API_KEY=your_openai_key
```

## 🚀 **Deploy Now!**

1. **Fill in the 6 required variables above**
2. **Leave the optional ones empty** (GITHUB_TOKEN, ANTHROPIC_API_KEY, CURSOR_API_KEY, NPM_TOKEN)
3. **Click "Deploy"**

The platform will work perfectly with just these 6 variables! 🎉

## 📝 **What Each Variable Does:**

- **`POSTGRES_URL`** - Stores your tasks and progress
- **`AI_GATEWAY_API_KEY`** - Powers the Codex agent and branch name generation
- **`VERCEL_TOKEN/TEAM_ID/PROJECT_ID`** - Creates sandbox environments for code execution
- **`OPENAI_API_KEY`** - Provides AI capabilities for the Codex agent

## 🔧 **If You Want More Features:**

- **Add `GITHUB_TOKEN`** - To access private repositories
- **Add `ANTHROPIC_API_KEY`** - To use Claude agent instead of Codex

But for basic functionality, you only need the 6 required variables!
