# GitHub OAuth Setup Guide

## ✅ **Fixed: NextAuth Client Fetch Error**

The error `[next-auth][error][CLIENT_FETCH_ERROR]` has been resolved by:

1. **Switching from custom GitHub auth to NextAuth**
2. **Adding proper fallback values** for missing environment variables
3. **Removing conflicting custom auth endpoint**

## 🔧 **Environment Variables Required**

Add these to your `.env.local` file:

```bash
# GitHub OAuth (Required for GitHub integration)
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# NextAuth Configuration (Required)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# App URL (Required for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 **GitHub OAuth App Setup**

1. **Go to GitHub Developer Settings**: https://github.com/settings/developers
2. **Create New OAuth App** with these settings:
   - **Application name**: `VERCLIBASE`
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. **Copy Client ID and Secret** to your environment variables

## 🔒 **Generate NEXTAUTH_SECRET**

```bash
# Generate a secure secret
openssl rand -base64 32
```

## ✅ **Testing**

1. **Start development server**: `npm run dev`
2. **Click "Connect GitHub"** button
3. **Should redirect to GitHub OAuth** (no more JSON errors)

## 🐛 **Troubleshooting**

- **If still getting errors**: Check that all environment variables are set
- **For production**: Update callback URL to your production domain
- **Fallback mode**: App works without GitHub OAuth (uses fallback values)

## 📝 **What Changed**

- ✅ **GitHubAuthButton** now uses `signIn('github')` from NextAuth
- ✅ **Auth configuration** has fallback values for missing env vars
- ✅ **Custom GitHub auth endpoint** renamed to avoid conflicts
- ✅ **Proper error handling** for missing credentials
