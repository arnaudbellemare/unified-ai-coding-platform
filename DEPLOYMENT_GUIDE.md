# 🚀 Deployment Guide for Your Forked Repository

When you deploy your forked repository to Vercel, you'll need to configure environment variables for the application to work properly.

## ⚠️ **Environment Variables: Depends on What You're Building**

The environment variables you need depend on which AI agents and features you want to use:

### **🤖 Agent-Specific Requirements:**

#### **Claude Agent** (Code generation & analysis)
```
ANTHROPIC_API_KEY=your_anthropic_key
```
**Optional:** `POSTGRES_URL`, `GITHUB_TOKEN`

#### **Codex Agent** (OpenAI via AI Gateway)
```
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key
OPENAI_API_KEY=your_openai_key
```
**Optional:** `POSTGRES_URL`, `GITHUB_TOKEN`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID`

#### **Perplexity Agent** (Real-time web search)
```
PERPLEXITY_API_KEY=your_perplexity_key
```
**Optional:** `POSTGRES_URL`, `GITHUB_TOKEN`

#### **Cursor Agent** (Code completion)
```
CURSOR_API_KEY=your_cursor_key
```
**Optional:** `POSTGRES_URL`, `GITHUB_TOKEN`

#### **OpenCode Agent** (Open source, no API keys needed)
```
# No required environment variables!
```
**Optional:** `POSTGRES_URL`, `GITHUB_TOKEN`

### **🔧 Feature-Specific Requirements:**

#### **Database Features** (Task storage & persistence)
```
POSTGRES_URL=your_postgres_connection_string
```

#### **GitHub Integration** (Repository forking & access)
```
GITHUB_TOKEN=your_github_token
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

#### **Vercel Sandbox** (Code execution environment)
```
VERCEL_TOKEN=your_vercel_token
VERCEL_TEAM_ID=your_vercel_team_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

## 🔧 **How to Set Environment Variables in Vercel:**

1. **Go to your Vercel Dashboard**
2. **Select your deployed project**
3. **Go to Settings → Environment Variables**
4. **Add each variable** with the corresponding value
5. **Redeploy your application**

## 🆓 **Free Database Options:**

If you don't have a database, you can use these free options:

### **Option 1: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Go to Settings → Database
5. Copy the connection string
6. Use it as your `POSTGRES_URL`

### **Option 2: Railway**
1. Go to [railway.app](https://railway.app)
2. Create a free account
3. Create a new PostgreSQL database
4. Copy the connection string
5. Use it as your `POSTGRES_URL`

### **Option 3: Neon**
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new database
4. Copy the connection string
5. Use it as your `POSTGRES_URL`

## 💰 **Cost Optimization Considerations:**

The environment variables you choose directly impact your costs:

### **Lowest Cost Setup** (Free tier friendly):
```
# Use OpenCode agent (no API costs)
# No required environment variables!
# Optional: POSTGRES_URL for task persistence
```

### **Medium Cost Setup** (Cost-optimized):
```
# Use Perplexity agent (lower cost than GPT-4)
PERPLEXITY_API_KEY=your_perplexity_key
# Optional: POSTGRES_URL for task persistence
```

### **Premium Setup** (Full features):
```
# Use Codex agent with AI Gateway (optimized routing)
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key
OPENAI_API_KEY=your_openai_key
POSTGRES_URL=your_database_url
GITHUB_TOKEN=your_github_token
```

### **Enterprise Setup** (All agents + sandbox):
```
# All agents available
ANTHROPIC_API_KEY=your_anthropic_key
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key
OPENAI_API_KEY=your_openai_key
PERPLEXITY_API_KEY=your_perplexity_key
CURSOR_API_KEY=your_cursor_key
POSTGRES_URL=your_database_url
GITHUB_TOKEN=your_github_token
VERCEL_TOKEN=your_vercel_token
VERCEL_TEAM_ID=your_vercel_team_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

## 🎯 **Quick Start Configurations:**

### **For Testing/Development:**
```
# Minimal setup - just add one agent
PERPLEXITY_API_KEY=your_perplexity_key
```

### **For Production:**
```
# Recommended production setup
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key
OPENAI_API_KEY=your_openai_key
POSTGRES_URL=your_database_url
GITHUB_TOKEN=your_github_token
```

## 🔍 **Troubleshooting:**

### **"POSTGRES_URL environment variable is required"**
- You need to set up a PostgreSQL database
- Follow the free database options above
- Add the `POSTGRES_URL` environment variable in Vercel

### **"Build error occurred"**
- Check that all required environment variables are set
- Make sure your database is accessible
- Redeploy after adding missing variables

### **"Database features disabled"**
- The app will work in fallback mode without a database
- Some features like task persistence won't work
- Add `POSTGRES_URL` to enable full functionality

## 📞 **Need Help?**

If you need help setting up your environment variables or getting API keys, contact us and we can provide:
- Shared database access
- API key guidance
- Step-by-step setup assistance

## 🎉 **Once Configured:**

After setting up your environment variables, your deployed application will have:
- ✅ Full AI coding agent functionality
- ✅ Task creation and management
- ✅ Repository forking and deployment
- ✅ Cost optimization features
- ✅ Multi-agent support (Claude, Codex, Cursor, Perplexity)

Your platform will be fully functional and ready to help users build and deploy AI-powered applications! 🚀
