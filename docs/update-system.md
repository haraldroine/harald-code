# Update System Documentation

This document explains how the update system works for Harald Code, supporting both Git-based and npm-based distribution.

## Overview

Harald Code now supports two distribution methods:
1. **Git-based**: Users clone/download from GitHub
2. **npm-based**: Users install via npm registry

The CLI automatically detects the installation method and provides appropriate update notifications.

## Git-Based Update System

### How It Works
- Checks GitHub releases API for newer versions
- Compares current version with latest release using semantic versioning
- Shows update notifications in the CLI interface
- Provides appropriate update instructions based on installation method

### Features
- **Automatic detection**: Identifies Git-based installations
- **Release checking**: Fetches latest releases from GitHub API
- **Pre-release support**: Handles both stable and nightly releases
- **Network resilience**: Graceful fallback on network failures
- **Timeout protection**: 5-second timeout for API calls

### Configuration
Users can disable update notifications via settings:
```json
{
  "disableUpdateNag": true,        // Disables all update notifications
  "disableAutoUpdate": true        // Disables auto-updates, keeps notifications
}
```

## NPM Publishing Setup

### Package Configuration
Both packages are now configured for npm publishing:
- `@harald-code/harald-code-core`: Core functionality
- `@harald-code/harald-code`: CLI interface

### Publishing Commands
```bash
# Dry run (test without publishing)
npm run publish:dry-run

# Publish core package only
npm run publish:core

# Publish CLI package only  
npm run publish:cli

# Publish both packages
npm run publish:all
```

### Prerequisites for NPM Publishing
1. **NPM Account**: Create account at npmjs.com
2. **Organization**: Create `@harald-code` organization
3. **Authentication**: Login with `npm login`
4. **Access Token**: Generate token for GitHub Actions

## GitHub Actions Workflow

### Automated Release Process
The `.github/workflows/release.yml` workflow handles:
1. **Version management**: Automatic version bumping
2. **Testing**: Runs full test suite before release
3. **Building**: Compiles TypeScript and creates bundles
4. **Publishing**: Publishes to both npm and GitHub releases
5. **Git tagging**: Creates release tags and branches

### Triggering Releases

#### Manual Release
```bash
# Via GitHub UI or CLI
gh workflow run release.yml \
  --ref main \
  --field version=v0.0.5 \
  --field dry_run=false
```

#### Scheduled Nightly Releases
Automatically runs daily at midnight UTC for nightly builds.

### Required Secrets
Add these to your GitHub repository secrets:
- `NPM_TOKEN`: NPM access token for publishing (generate at npmjs.com/settings/tokens)
- `OPENAI_API_KEY`: For integration tests (optional)

**⚠️ Security Note**: Never commit NPM tokens or API keys to your repository. Always use GitHub secrets or environment variables.

## Installation Detection

The system automatically detects how Harald Code was installed:

### Git Clone
```
Running from a local git clone. Run "git pull" to update.
```

### NPM Global
```
Installed with npm. Run "npm update -g @harald-code/harald-code" to update.
```

### NPX/PNPX
```
Running via npx, update not applicable.
```

### Local Project
```
Locally installed. Please update via your project's package.json.
```

## Update Flow Example

1. **User starts CLI**: `harald-code "help me code"`
2. **Background check**: System checks for updates (Git API or npm registry)
3. **Version comparison**: Compares current vs latest using semver
4. **Notification display**: Shows yellow-bordered update message if newer version available
5. **Auto-update attempt**: Tries to update automatically (if enabled)
6. **User feedback**: Shows success/failure message

## Development vs Production

### Development Mode
- Set `DEV=true` environment variable
- Skips update checks entirely
- Useful for local development

### Production Mode
- Normal update checking behavior
- Respects user settings for notifications/auto-updates
- Network-resilient with proper error handling

## Troubleshooting

### Update Check Failures
- Network issues are silently ignored
- Debug mode shows detailed error messages: `DEBUG=1 harald-code`
- Timeout after 5 seconds prevents hanging

### Publishing Issues
- Ensure npm authentication: `npm whoami`
- Check package access: `npm access list packages`
- Verify organization membership: `npm org ls @harald-code`

### GitHub Actions Failures
- Check required secrets are set
- Verify repository permissions
- Review workflow logs for specific errors

## Migration Guide

### From Git-Only to Hybrid Distribution

1. **Update package.json files**: Set `private: false`
2. **Configure npm publishing**: Add proper metadata
3. **Set up GitHub Actions**: Configure release workflow
4. **Create npm organization**: Set up `@harald-code` scope
5. **Test publishing**: Use dry-run mode first

### User Migration
- **Existing Git users**: No action required, continues working
- **New npm users**: Install via `npm install -g @harald-code/harald-code`
- **Switching methods**: Uninstall old method, install via preferred method

## Best Practices

### Version Management
- Use semantic versioning (semver)
- Tag releases consistently (`v1.2.3`)
- Update changelog for each release
- Test thoroughly before publishing

### Security
- **Never commit secrets**: NPM tokens, API keys should never be in git history
- **Use GitHub secrets**: Store sensitive tokens in repository settings
- **Rotate tokens regularly**: Generate new NPM tokens periodically
- **Least-privilege access**: Use automation tokens with minimal required permissions
- **Monitor packages**: Watch for unauthorized changes to published packages
- **Enable 2FA**: Protect your npm account with two-factor authentication
- **Gitignore sensitive files**: Ensure setup scripts with tokens are excluded

### User Experience
- Clear update messages
- Respect user preferences
- Graceful failure handling
- Minimal network impact

## Automated Release System

Harald Code now features a fully automated Git → NPM release system. See [Automated Releases Guide](automated-releases.md) for complete documentation.

### Quick Release
```bash
./scripts/release.sh
```

This single command handles version updates, Git tagging, and triggers automated NPM publishing via GitHub Actions.