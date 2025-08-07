# Security Setup Guide

## 🔒 NPM Publishing Security

### Setting Up Your NPM Token

1. **Generate NPM Token**:
   - Go to https://www.npmjs.com/settings/tokens
   - Click "Generate New Token"
   - Choose "Automation" type for GitHub Actions
   - Copy the token (starts with `npm_`)

2. **Add to GitHub Secrets**:
   - Go to https://github.com/haraldroine/harald-code/settings/secrets/actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token
   - Click "Add secret"

3. **Local Setup Script**:
   ```bash
   # Copy the template
   cp setup-npm-publishing-template.sh setup-npm-publishing.sh
   
   # Edit and add your token (this file is gitignored)
   # Replace [YOUR_NPM_TOKEN_HERE] with your actual token
   ```

### 🚨 Security Best Practices

- ✅ **Never commit tokens to git**
- ✅ **Use GitHub secrets for automation**
- ✅ **Rotate tokens regularly**
- ✅ **Enable 2FA on npm account**
- ✅ **Use least-privilege tokens**
- ✅ **Monitor package changes**

### Files That Should Never Be Committed

- `setup-npm-publishing.sh` (contains actual token)
- `.env` files with API keys
- Any file with actual secrets/tokens

### Files Safe to Commit

- `setup-npm-publishing-template.sh` (template without secrets)
- Documentation files
- Configuration templates

## 🔧 Quick Start

1. Run the template script to test your setup:
   ```bash
   ./setup-npm-publishing-template.sh
   ```

2. When ready to publish:
   ```bash
   npm run publish:all
   ```

3. For automated releases, ensure GitHub secrets are configured and use:
   ```bash
   gh workflow run release.yml --ref main --field version=v0.0.5 --field dry_run=false
   ```