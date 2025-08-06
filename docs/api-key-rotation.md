# API Key Rotation Guide

Harald Code supports automatic API key rotation to help you avoid rate limits by switching between multiple Cerebras API keys. This is particularly useful since Cerebras offers 1 million tokens per day for free, and with multiple keys, you can effectively multiply your daily limit.

## Overview

API key rotation automatically switches between configured API keys when rate limits are detected. This allows you to:

- **Avoid downtime**: Continue working even when one API key hits its daily limit
- **Maximize free usage**: Use multiple free Cerebras accounts to get more daily tokens
- **Seamless experience**: Automatic switching happens transparently in the background

## Quick Setup

### 1. Add Multiple API Keys

You can add API keys using the CLI command:

```bash
# Add your first API key
cerebras
> /api-keys add csk-your-first-api-key-here

# Add additional API keys
> /api-keys add csk-your-second-api-key-here
> /api-keys add csk-your-third-api-key-here
```

### 2. Check Status

View your current rotation configuration:

```bash
> /api-keys status
```

This shows:
- Total number of keys
- Currently active key (last 4 characters)
- Auto-rotation status
- Daily usage statistics

### 3. Manual Configuration

Alternatively, you can configure API keys directly in your settings file at `~/.qwen/settings.json`:

```json
{
  "apiKeyRotation": {
    "apiKeys": [
      "csk-your-first-api-key-here",
      "csk-your-second-api-key-here",
      "csk-your-third-api-key-here"
    ],
    "autoRotateOnRateLimit": true,
    "resetRotationDaily": true,
    "currentKeyIndex": 0
  }
}
```

## Configuration Options

### Settings Structure

```json
{
  "apiKeyRotation": {
    "apiKeys": ["key1", "key2", "key3"],           // Array of API keys
    "currentKeyIndex": 0,                          // Currently active key index
    "autoRotateOnRateLimit": true,                 // Enable automatic rotation
    "resetRotationDaily": true,                    // Reset to first key daily
    "dailyUsageTracking": {                        // Usage tracking per key
      "abc123": { "date": "2025-01-09", "requests": 45 }
    }
  }
}
```

### Configuration Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `apiKeys` | string[] | `[]` | List of API keys to rotate between |
| `currentKeyIndex` | number | `0` | Index of currently active key |
| `autoRotateOnRateLimit` | boolean | `true` | Automatically switch keys on rate limits |
| `resetRotationDaily` | boolean | `true` | Reset to first key each day |
| `dailyUsageTracking` | object | `{}` | Track requests per key per day |

## CLI Commands

### `/api-keys` - Main Command

Shows current rotation status and available commands.

```bash
> /api-keys
```

### `/api-keys status` - View Status

Display detailed information about your API key rotation:

```bash
> /api-keys status
```

**Output includes:**
- Total keys configured
- Current active key (preview)
- Auto-rotation enabled/disabled
- Daily usage statistics
- Available commands

### `/api-keys add <key>` - Add API Key

Add a new API key to the rotation:

```bash
> /api-keys add csk-your-new-api-key-here
```

**Validation:**
- Keys must be at least 20 characters
- Must start with `csk-` (Cerebras), `sk-` (OpenAI), or `api-`
- Duplicates are automatically detected

### `/api-keys remove <key-preview>` - Remove API Key

Remove an API key using its preview (last 4 characters):

```bash
> /api-keys remove 1234
```

Use `/api-keys status` to see available key previews.

### `/api-keys rotate` - Manual Rotation

Manually switch to the next API key:

```bash
> /api-keys rotate
```

Useful for testing or when you want to switch keys manually.

### `/api-keys toggle` - Toggle Auto-Rotation

Enable or disable automatic rotation on rate limits:

```bash
> /api-keys toggle
```

When disabled, you'll need to manually rotate keys using `/api-keys rotate`.

## How It Works

### Automatic Detection

The system automatically detects rate limit errors by monitoring for:
- HTTP 429 (Too Many Requests) responses
- Error messages containing "rate limit", "quota exceeded", or "daily limit"
- Cerebras-specific rate limiting messages

### Rotation Process

When a rate limit is detected:

1. **Detection**: System identifies rate limit error
2. **Logging**: Records the failed request for current key
3. **Rotation**: Switches to the next available API key
4. **Retry**: Automatically retries the request with new key
5. **Tracking**: Updates usage statistics

### Daily Reset

If `resetRotationDaily` is enabled (default):
- Rotation resets to the first key each day
- Usage tracking starts fresh
- Maximizes the use of daily free limits

## Best Practices

### 1. Use Multiple Free Accounts

Create multiple Cerebras accounts to get multiple free API keys:
- Each account gets 1M tokens/day free
- With 3 keys = 3M tokens/day effective limit
- Sign up with different email addresses

### 2. Monitor Usage

Regularly check your rotation status:
```bash
> /api-keys status
```

This helps you understand usage patterns and optimize your setup.

### 3. Keep Backup Keys

Always configure at least 2-3 API keys to ensure continuous operation.

### 4. Environment Variables

You can still use environment variables as fallback:
```bash
export CEREBRAS_API_KEY="your-fallback-key"
```

This key will be used if rotation is not configured.

## Troubleshooting

### Common Issues

**1. Keys Not Rotating**
- Check if auto-rotation is enabled: `/api-keys toggle`
- Verify you have multiple keys configured: `/api-keys status`
- Restart the CLI after adding new keys

**2. Invalid API Key Format**
- Keys must start with `csk-`, `sk-`, or `api-`
- Must be at least 20 characters long
- Check for typos when adding keys

**3. Rate Limits Still Hit**
- Ensure all your API keys are valid and active
- Check if you've exceeded limits on all keys
- Consider adding more keys or waiting for daily reset

**4. Settings Not Persisting**
- Check file permissions on `~/.qwen/settings.json`
- Restart CLI after manual configuration changes
- Verify JSON syntax is correct

### Debug Information

To see detailed rotation information, look for console messages:
```
Rate limit detected, attempting API key rotation...
Rotated to API key 2 of 3
Successfully rotated to new API key
```

### Manual Settings Reset

If you need to reset rotation settings:

```bash
# Remove the entire apiKeyRotation section from ~/.qwen/settings.json
# Or set it to an empty object:
{
  "apiKeyRotation": {}
}
```

## Examples

### Basic 2-Key Setup

```json
{
  "apiKeyRotation": {
    "apiKeys": [
      "csk-primary-key-here",
      "csk-backup-key-here"
    ],
    "autoRotateOnRateLimit": true
  }
}
```

### Advanced 5-Key Setup with Custom Settings

```json
{
  "apiKeyRotation": {
    "apiKeys": [
      "csk-account1-key",
      "csk-account2-key", 
      "csk-account3-key",
      "csk-account4-key",
      "csk-account5-key"
    ],
    "autoRotateOnRateLimit": true,
    "resetRotationDaily": true,
    "currentKeyIndex": 0
  }
}
```

### Manual Rotation Only

```json
{
  "apiKeyRotation": {
    "apiKeys": [
      "csk-key1",
      "csk-key2"
    ],
    "autoRotateOnRateLimit": false
  }
}
```

## Security Considerations

### Key Storage

- API keys are stored in your local `~/.qwen/settings.json` file
- File permissions should be restricted (600 or similar)
- Never commit settings files with API keys to version control

### Key Privacy

- Only the last 4 characters of keys are shown in status displays
- Full keys are never logged or displayed
- Usage tracking uses hashed key identifiers

### Best Practices

1. **Use separate accounts**: Don't share API keys between different projects
2. **Regular rotation**: Periodically regenerate your API keys
3. **Monitor usage**: Keep track of which keys are being used
4. **Secure storage**: Ensure your settings file has proper permissions

## Migration Guide

### From Single Key Setup

If you're currently using a single API key via environment variables:

1. **Keep your existing setup** - it will work as a fallback
2. **Add rotation keys** using `/api-keys add <key>`
3. **Test the setup** with `/api-keys status`
4. **Optional**: Remove environment variable once rotation is working

### From Manual Key Switching

If you've been manually switching API keys:

1. **Add all your keys** to rotation configuration
2. **Enable auto-rotation** with `/api-keys toggle`
3. **Remove manual switching logic** from your workflow

## Support

For issues or questions about API key rotation:

1. Check the troubleshooting section above
2. Use `/api-keys status` to diagnose configuration issues
3. Review console output for rotation messages
4. File issues on the project repository

The API key rotation system is designed to be transparent and automatic, allowing you to focus on your work while it handles rate limit management behind the scenes.