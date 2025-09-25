# GitHub OAuth Setup Guide

## Problem
Getting a 500 Internal Server Error when clicking "Connect GitHub" because the GitHub OAuth environment variables are not configured.

## Solution

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: `Unified AI Coding Platform`
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

### 2. Update Environment Variables

Add these to your `.env.local` file:

```bash
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_oauth_client_id_here
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. For Production (Vercel)

When deploying to Vercel, update the GitHub OAuth App settings:

1. Go to your GitHub OAuth App settings
2. Update the **Authorization callback URL** to: `https://your-domain.vercel.app/api/auth/github`
3. Add these environment variables in Vercel:
   - `GITHUB_CLIENT_ID`: Your GitHub OAuth Client ID
   - `GITHUB_CLIENT_SECRET`: Your GitHub OAuth Client Secret
   - `NEXT_PUBLIC_APP_URL`: `https://your-domain.vercel.app`

### 4. Test the Setup

1. Restart your development server: `npm run dev`
2. Click "Connect GitHub" - it should redirect to GitHub for authorization
3. After authorization, you should be redirected back to the app

## Troubleshooting

### Common Issues:

1. **500 Error**: Missing `GITHUB_CLIENT_ID` or `GITHUB_CLIENT_SECRET`
2. **Redirect URI Mismatch**: Make sure the callback URL matches exactly
3. **CORS Issues**: Ensure `NEXT_PUBLIC_APP_URL` is set correctly

### Debug Steps:

1. Check the browser console for error messages
2. Check the server logs for detailed error information
3. Verify environment variables are loaded: `console.log(process.env.GITHUB_CLIENT_ID)`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `Iv1.8a61f9b3a7aba766` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | `your_secret_here` |
| `NEXT_PUBLIC_APP_URL` | Your app's base URL | `http://localhost:3000` |
| `GITHUB_TOKEN` | Personal access token (different from OAuth) | `ghp_...` |

## Notes

- `GITHUB_TOKEN` is for direct API access (different from OAuth)
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are for OAuth flow
- Make sure to keep your client secret secure and never commit it to version control
