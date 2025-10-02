#!/bin/bash

echo "🔧 Setting up LangStruct for GEO + ACP + AP2 integration..."

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3 and try again."
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed."
    echo "Please install pip3 and try again."
    exit 1
fi

# Install LangStruct
echo "📦 Installing LangStruct..."
pip3 install langstruct

if [ $? -eq 0 ]; then
    echo "✅ LangStruct installed successfully!"
else
    echo "❌ Failed to install LangStruct."
    echo "You may need to install it manually: pip3 install langstruct"
    exit 1
fi

# Install additional dependencies
echo "📦 Installing additional dependencies..."
pip3 install pydantic dspy-ai

if [ $? -eq 0 ]; then
    echo "✅ Additional dependencies installed successfully!"
else
    echo "⚠️  Some dependencies may not have installed correctly."
    echo "You may need to install them manually:"
    echo "  pip3 install pydantic dspy-ai"
fi

# Test the installation
echo "🧪 Testing LangStruct installation..."
python3 -c "from langstruct import LangStruct; print('✅ LangStruct is working!')"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 LangStruct setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Set your API key: export OPENAI_API_KEY='your-key'"
    echo "2. Or: export GOOGLE_API_KEY='your-key'"
    echo "3. Or: export ANTHROPIC_API_KEY='your-key'"
    echo ""
    echo "Then visit: http://localhost:3000/langstruct-demo"
else
    echo "❌ LangStruct test failed."
    echo "Please check the installation and try again."
    exit 1
fi
