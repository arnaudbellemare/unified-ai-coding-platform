# Deployment Guide for Unified AI Coding Platform

## Environment Variables Required

When deploying to Vercel, you'll need to set these environment variables:

### Required Environment Variables:

1. **Database Configuration:**
   ```
   POSTGRES_URL=your_supabase_postgres_url
   POSTGRES_USER=postgres
   POSTGRES_HOST=your_supabase_host
   POSTGRES_PASSWORD=your_supabase_password
   POSTGRES_DATABASE=postgres
   POSTGRES_URL_NON_POOLING=your_supabase_non_pooling_url
   ```

2. **Supabase Configuration:**
   ```
   SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret
   ```

3. **AI Gateway Configuration:**
   ```
   AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key
   ```

4. **GitHub Integration:**
   ```
   GITHUB_TOKEN=your_github_token
   GITHUB_CLIENT_ID=your_github_oauth_client_id
   GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
   ```

5. **Vercel Configuration:**
   ```
   VERCEL_TOKEN=your_vercel_token
   VERCEL_PROJECT_ID=your_vercel_project_id
   VERCEL_TEAM_ID=your_vercel_team_id
   ```

6. **AI Provider Keys (Optional):**
   ```
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   PERPLEXITY_API_KEY=your_perplexity_key
   CURSOR_API_KEY=your_cursor_key
   ```

## Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Set all the environment variables listed above
   - Deploy!

3. **Database Setup:**
   - After deployment, run database migrations:
   ```bash
   npm run db:push
   ```

## Features Included

- ✅ Enhanced Prompt Optimizer with AI-powered cost savings
- ✅ AI-Powered Optimization Engine for Provider Switching
- ✅ AgentKit for building custom AI agents
- ✅ X402 Payment Gateway integration
- ✅ Multiple AI Providers (OpenAI, Anthropic, Perplexity, Cursor)
- ✅ Real-time Cost Optimization
- ✅ Vercel Sandbox Integration
- ✅ GitHub Repository Integration
- ✅ Advanced Analytics Dashboard

## Post-Deployment

1. **Test the platform** by creating a simple task
2. **Verify database connectivity** by checking the tasks page
3. **Test AI agents** by running different agent types
4. **Check cost optimization** by viewing the optimization dashboard

## Support

If you encounter issues:
1. Check the Vercel function logs
2. Verify all environment variables are set correctly
3. Ensure your Supabase database is accessible
4. Check that your AI Gateway is properly configured
