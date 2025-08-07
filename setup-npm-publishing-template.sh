#!/bin/bash

# Setup script template for npm publishing
# This script helps configure Harald Code for npm publishing

set -e

echo "🚀 Setting up Harald Code for npm publishing..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if user is logged into npm
if ! npm whoami &> /dev/null; then
    echo "❌ You're not logged into npm. Please run 'npm login' first."
    exit 1
fi

echo "✅ npm is available and you're logged in as: $(npm whoami)"

# Check if @harald-code organization exists
echo "🔍 Checking npm organization..."
if npm org ls @harald-code &> /dev/null; then
    echo "✅ @harald-code organization exists"
else
    echo "❌ @harald-code organization doesn't exist or you don't have access"
    echo "   Please create the organization at: https://www.npmjs.com/org/create"
    echo "   Or ask for access to the existing organization"
    exit 1
fi

# Build packages
echo "🔨 Building packages..."
npm run build:packages

# Test publishing with dry-run
echo "🧪 Testing publishing (dry-run)..."
npm run publish:dry-run

echo ""
echo "✅ Setup complete! You're ready to publish to npm."
echo ""
echo "Next steps:"
echo "1. Test the Git-based update system:"
echo "   npm start"
echo ""
echo "2. Publish to npm (when ready):"
echo "   npm run publish:all"
echo ""
echo "3. Set up GitHub Actions secrets:"
echo "   - NPM_TOKEN: Generate at https://www.npmjs.com/settings/tokens"
echo "   - Add to: https://github.com/haraldroine/harald-code/settings/secrets/actions"
echo "   - Secret name: NPM_TOKEN"
echo "   - Secret value: [YOUR_NPM_TOKEN_HERE]"
echo ""
echo "4. Trigger a release:"
echo "   gh workflow run release.yml --ref main --field version=v0.0.5 --field dry_run=false"
echo ""
echo "📖 For more details, see: docs/update-system.md"