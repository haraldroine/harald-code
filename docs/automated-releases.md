# Automated Git → NPM Release System

This document explains how to use the automated release system that publishes to npm whenever you push a Git tag.

## 🚀 Quick Release (Recommended)

Use the automated release script:

```bash
./scripts/release.sh
```

This script will:
1. ✅ Ask what type of release you want (patch/minor/major/custom)
2. ✅ Update all package.json versions automatically
3. ✅ Commit the version changes
4. ✅ Create and push a Git tag
5. ✅ Trigger GitHub Actions to publish to npm

## 📋 Manual Release Process

If you prefer to do it manually:

### 1. Update Versions

Update the version in all package.json files:
- `package.json`
- `packages/core/package.json` 
- `packages/cli/package.json`

Make sure the CLI package dependency matches the core version:
```json
"dependencies": {
  "buroventures-harald-code-core": "^X.Y.Z"
}
```

### 2. Commit Changes

```bash
git add package.json packages/*/package.json
git commit -m "chore: bump version to X.Y.Z"
```

### 3. Create and Push Tag

```bash
git tag -a "vX.Y.Z" -m "Release vX.Y.Z"
git push origin main
git push origin vX.Y.Z
```

## 🤖 What Happens Automatically

When you push a version tag (like `v1.0.0`), GitHub Actions will:

1. **🔍 Detect the tag** and extract the version
2. **🏗️ Build packages** (core first, then CLI)
3. **🧪 Run tests** to ensure everything works
4. **📦 Publish to npm**:
   - `buroventures-harald-code-core@X.Y.Z`
   - `buroventures-harald-code@X.Y.Z`
5. **🏷️ Create GitHub release** with release notes
6. **🎯 Update Git-based users** (they'll see update notifications)

## 📊 Monitoring Releases

- **GitHub Actions**: https://github.com/haraldroine/harald-code/actions
- **NPM Core Package**: https://www.npmjs.com/package/buroventures-harald-code-core
- **NPM CLI Package**: https://www.npmjs.com/package/buroventures-harald-code
- **GitHub Releases**: https://github.com/haraldroine/harald-code/releases

## 🔧 Version Types

- **Patch** (1.0.0 → 1.0.1): Bug fixes, small improvements
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes

## 🛠️ Troubleshooting

### Release Failed
1. Check GitHub Actions logs
2. Common issues:
   - Tests failing
   - NPM token expired
   - Version already exists
   - Build errors

### Manual Recovery
If automation fails, you can publish manually:

```bash
# Build packages
npm run build:packages

# Publish core first
cd packages/core && npm publish

# Then CLI
cd ../cli && npm publish
```

## 🔐 Security Notes

- NPM token is stored securely in GitHub secrets
- Only repository maintainers can trigger releases
- All releases are logged and auditable
- Dry-run mode available for testing

## 📝 Release Checklist

Before creating a release:

- [ ] All tests pass locally
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated (if you have one)
- [ ] No uncommitted changes
- [ ] On main branch (or release branch)

## 🎯 Benefits

✅ **One command releases**: `./scripts/release.sh`  
✅ **No manual npm publishing**: Automated via GitHub Actions  
✅ **Consistent versioning**: All packages stay in sync  
✅ **Git users get updates**: Automatic notifications  
✅ **NPM users get updates**: Available immediately  
✅ **Rollback capability**: Git tags provide clear history  
✅ **Audit trail**: All releases tracked in GitHub  

## 🚀 Example Workflow

```bash
# Make your changes
git add .
git commit -m "feat: add new feature"

# Create release
./scripts/release.sh
# Choose: 2 (Minor release)
# Confirm: y

# 🎉 Done! GitHub Actions handles the rest
```

Your users can now update with:
- **Git users**: `git pull` (after seeing update notification)
- **NPM users**: `npm update -g buroventures-harald-code`