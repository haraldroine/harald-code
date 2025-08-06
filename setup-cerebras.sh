#!/bin/bash

echo "🚀 Cerebras Code Setup"
echo "====================="
echo ""
echo "This script will help you configure Cerebras Code to use Cerebras Cloud by default."
echo ""

# Check if CEREBRAS_API_KEY is already set
if [ -n "$CEREBRAS_API_KEY" ]; then
    echo "✅ CEREBRAS_API_KEY is already set in your environment"
else
    echo "📝 To complete the setup, you need to:"
    echo "   1. Get your API key from https://cloud.cerebras.ai/"
    echo "   2. Set the CEREBRAS_API_KEY environment variable"
    echo ""
    echo "You can do this by:"
    echo "   • Adding it to your shell profile (~/.zshrc or ~/.bashrc):"
    echo "     export CEREBRAS_API_KEY=\"your_api_key_here\""
    echo ""
    echo "   • Or creating a .env file in your project directory:"
    echo "     CEREBRAS_API_KEY=your_api_key_here"
    echo ""
fi

echo "🎯 Default Configuration:"
echo "   • Model: gpt-oss-120b"
echo "   • Base URL: https://api.cerebras.ai/v1"
echo "   • Auth Type: USE_OPENAI (compatible with Cerebras)"
echo ""

# Check current settings
if [ -f ~/.qwen/settings.json ]; then
    echo "✅ User settings file exists at ~/.qwen/settings.json"
else
    echo "📁 Creating user settings directory..."
    mkdir -p ~/.qwen
    echo '{"selectedAuthType": "USE_OPENAI", "model": "gpt-oss-120b"}' > ~/.qwen/settings.json
    echo "✅ Created ~/.qwen/settings.json with Cerebras defaults"
fi

echo ""
echo "🎉 Setup complete! You can now run 'cerebras' in any directory."
echo ""
echo "💡 Pro tip: Create a .env file in each project with your CEREBRAS_API_KEY"
echo "   for project-specific configuration."