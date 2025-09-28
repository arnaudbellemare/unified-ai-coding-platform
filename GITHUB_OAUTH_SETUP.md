# GitHub OAuth Setup Guide

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: `Unified AI Coding Platform`
   - **Homepage URL**: `https://unified-ai-coding-platform.vercel.app`
   - **Authorization callback URL**: `https://unified-ai-coding-platform.vercel.app/api/auth/github`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Vercel Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:

```
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
NEXT_PUBLIC_APP_URL=https://unified-ai-coding-platform.vercel.app
```

## Step 3: Test the OAuth Flow

Once configured, users can authenticate by visiting:
`https://unified-ai-coding-platform.vercel.app/api/auth/github`

## Current Status

✅ GitHub OAuth route is implemented at `/api/auth/github`
✅ Handles OAuth flow, token exchange, and user data
✅ Sets secure HTTP-only cookies
✅ Redirects back to app with authentication

## Environment Variables Required

- `GITHUB_CLIENT_ID` - From your GitHub OAuth app
- `GITHUB_CLIENT_SECRET` - From your GitHub OAuth app  
- `NEXT_PUBLIC_APP_URL` - Your Vercel app URL
- `OPENROUTER_API_KEY` - Already configured ✅
- `POSTGRES_URL` - Already configured ✅

## Testing Locally

For local development, you can also set up GitHub OAuth:

1. Create a separate OAuth app for localhost
2. Set callback URL to: `http://localhost:3000/api/auth/github`
3. Add to your `.env.local`:
```
GITHUB_CLIENT_ID=your_local_github_client_id
GITHUB_CLIENT_SECRET=your_local_github_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
