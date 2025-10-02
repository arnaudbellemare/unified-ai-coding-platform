# AP2 Production Setup Guide

## Option 1: Google API Key (Current - Development)
✅ Already configured with your API key

## Option 2: Vertex AI (Recommended for Production)

### 1. Configure Environment Variables
Add to your .env.local:
```
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=your-actual-project-id
GOOGLE_CLOUD_LOCATION=global
```

### 2. Authenticate with Google Cloud
Choose one method:

#### Method A: gcloud CLI
```bash
gcloud auth application-default login
```

#### Method B: Service Account
```bash
export GOOGLE_APPLICATION_CREDENTIALS='/path/to/your/service-account-key.json'
```

### 3. Install AP2 Types Package
```bash
uv pip install git+https://github.com/google-agentic-commerce/AP2.git@main
```

### 4. Run AP2 Scenarios
```bash
cd AP2
bash samples/python/scenarios/your-scenario-name/run.sh
```

## Current Status
- ✅ Google API Key configured
- ✅ AP2 service implemented
- ✅ Demo page available at /ap2-demo
- ⏳ Vertex AI configuration pending
- ⏳ AP2 types package installation pending
