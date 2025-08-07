#!/bin/bash

# Harald Code Release Script
# This script helps you create a new release that automatically triggers npm publishing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository!"
    exit 1
fi

# Check if we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    print_warning "You're not on the main branch (current: $current_branch)"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_error "You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Get current version from package.json
current_version=$(node -p "require('./package.json').version")
print_status "Current version: $current_version"

# Ask for new version
echo
echo "What type of release would you like to create?"
echo "1) Patch (${current_version} → $(echo $current_version | awk -F. '{print $1"."$2"."$3+1}'))"
echo "2) Minor (${current_version} → $(echo $current_version | awk -F. '{print $1"."$2+1".0"}'))"
echo "3) Major (${current_version} → $(echo $current_version | awk -F. '{print $1+1".0.0"}'))"
echo "4) Custom version"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        new_version=$(echo $current_version | awk -F. '{print $1"."$2"."$3+1}')
        ;;
    2)
        new_version=$(echo $current_version | awk -F. '{print $1"."$2+1".0"}')
        ;;
    3)
        new_version=$(echo $current_version | awk -F. '{print $1+1".0.0"}')
        ;;
    4)
        read -p "Enter custom version (without 'v' prefix): " new_version
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Validate version format
if ! [[ $new_version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    print_error "Invalid version format. Use X.Y.Z format."
    exit 1
fi

tag_name="v$new_version"

print_status "New version will be: $new_version"
print_status "Git tag will be: $tag_name"

# Confirm release
echo
print_warning "This will:"
echo "  1. Update package.json versions to $new_version"
echo "  2. Commit the changes"
echo "  3. Create and push git tag $tag_name"
echo "  4. Trigger GitHub Actions to publish to npm"
echo

read -p "Do you want to proceed? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Release cancelled."
    exit 0
fi

# Update versions in package.json files
print_status "Updating package versions..."

# Update root package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '$new_version';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Update core package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('packages/core/package.json', 'utf8'));
pkg.version = '$new_version';
fs.writeFileSync('packages/core/package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Update CLI package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('packages/cli/package.json', 'utf8'));
pkg.version = '$new_version';
pkg.dependencies['buroventures-harald-code-core'] = '^$new_version';
fs.writeFileSync('packages/cli/package.json', JSON.stringify(pkg, null, 2) + '\n');
"

print_success "Package versions updated!"

# Commit changes
print_status "Committing version changes..."
git add package.json packages/core/package.json packages/cli/package.json
git commit -m "chore: bump version to $new_version"

# Create and push tag
print_status "Creating git tag $tag_name..."
git tag -a "$tag_name" -m "Release $tag_name"

print_status "Pushing changes and tag to origin..."
git push origin main
git push origin "$tag_name"

print_success "Release $tag_name created successfully!"
print_status "GitHub Actions will now automatically:"
print_status "  ✓ Build the packages"
print_status "  ✓ Run tests"
print_status "  ✓ Publish to npm"
print_status "  ✓ Create GitHub release"

echo
print_status "You can monitor the progress at:"
print_status "https://github.com/haraldroine/harald-code/actions"

echo
print_success "🎉 Release process initiated! Your packages will be available on npm shortly."