#!/bin/bash

# AP2 Types Package Installation Script
# Installs Google's Agent Payments Protocol types

echo "🚀 Installing AP2 Types Package..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed"
    exit 1
fi

# Install AP2 types package
echo "📦 Installing AP2 types from GitHub..."
pip3 install git+https://github.com/google-agentic-commerce/AP2.git@main

if [ $? -eq 0 ]; then
    echo "✅ AP2 types package installed successfully"
else
    echo "❌ Failed to install AP2 types package"
    echo "💡 Try running: pip3 install --user git+https://github.com/google-agentic-commerce/AP2.git@main"
    exit 1
fi

# Install additional dependencies
echo "📦 Installing additional AP2 dependencies..."
pip3 install google-generativeai google-cloud-aiplatform

if [ $? -eq 0 ]; then
    echo "✅ Additional dependencies installed"
else
    echo "⚠️  Some dependencies may have failed to install"
fi

echo ""
echo "🎉 AP2 Types Installation Complete!"
echo "📖 You can now use AP2 types in your Python code"
echo "🧪 Test AP2 at: http://localhost:3000/ap2-demo"
echo "⚙️  Configure AP2 at: http://localhost:3000/ap2-config"
