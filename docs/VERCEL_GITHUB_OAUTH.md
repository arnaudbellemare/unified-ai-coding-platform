# GitHub OAuth Setup for Vercel Deployment

## Current Issue
Getting 500 Internal Server Error when clicking "Connect GitHub" on Vercel because the GitHub OAuth environment variables are not configured.

## Step-by-Step Solution

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: `Unified AI Coding Platform`
   - **Homepage URL**: `https://unified-ai-coding-platform.vercel.app`
   - **Authorization callback URL**: `https://unified-ai-coding-platform.vercel.app/api/auth/github`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

### 2. Update Local Environment Variables

Replace the placeholder values in your `.env.local` file:

```bash
# Replace with your actual GitHub OAuth credentials
GITHUB_CLIENT_ID=your_actual_github_client_id_here
GITHUB_CLIENT_SECRET=your_actual_github_client_secret_here
NEXT_PUBLIC_APP_URL=https://unified-ai-coding-platform.vercel.app
```

### 3. Configure Vercel Environment Variables

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `unified-ai-coding-platform`
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `GITHUB_CLIENT_ID` | Your actual GitHub Client ID | Production, Preview, Development |
| `GITHUB_CLIENT_SECRET` | Your actual GitHub Client Secret | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://unified-ai-coding-platform.vercel.app` | Production, Preview, Development |

### 4. Redeploy to Vercel

After adding the environment variables:

1. **Option A**: Trigger a new deployment by pushing to your main branch:
   ```bash
   git add .
   git commit -m "Configure GitHub OAuth for production"
   git push
   ```

2. **Option B**: Redeploy from Vercel dashboard:
   - Go to your project in Vercel
   - Click "Redeploy" on the latest deployment

### 5. Test the Setup

1. Go to your Vercel deployment: `https://unified-ai-coding-platform.vercel.app`
2. Click "Connect GitHub"
3. You should be redirected to GitHub for authorization
4. After authorization, you should be redirected back to your app

## Troubleshooting

### If you still get 500 errors:

1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on the failed function to see detailed error logs

2. **Verify Environment Variables**:
   - Make sure all environment variables are set in Vercel
   - Check that they're available in the Production environment

3. **Check GitHub OAuth App Settings**:
   - Ensure the callback URL matches exactly: `https://unified-ai-coding-platform.vercel.app/api/auth/github`
   - Make sure the Client ID and Secret are correct

### Common Issues:

- **Redirect URI Mismatch**: The callback URL in GitHub must match exactly
- **Missing Environment Variables**: All three variables must be set in Vercel
- **Wrong Environment**: Make sure variables are set for "Production" environment

## Environment Variables Reference

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `Iv1.8a61f9b3a7aba766` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | `your_secret_here` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel app URL | `https://unified-ai-coding-platform.vercel.app` |

## Security Notes

- Never commit your `GITHUB_CLIENT_SECRET` to version control
- Keep your GitHub OAuth App secret secure
- Use environment variables for all sensitive configuration
