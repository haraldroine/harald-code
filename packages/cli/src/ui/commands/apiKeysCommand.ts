/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SlashCommand,
  SlashCommandActionReturn,
  CommandContext,
  CommandKind,
  MessageActionReturn,
} from './types.js';
import { ApiKeyRotationManager } from '@harald-code/harald-code-core';
import { SettingScope } from '../../config/settings.js';

const COLOR_GREEN = '\u001b[32m';
const COLOR_YELLOW = '\u001b[33m';
const COLOR_RED = '\u001b[31m';
const COLOR_CYAN = '\u001b[36m';
const COLOR_GREY = '\u001b[90m';
const RESET_COLOR = '\u001b[0m';

/**
 * Show current API key rotation status
 */
const showApiKeyStatus = async (context: CommandContext): Promise<SlashCommandActionReturn> => {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Config not loaded.',
    };
  }

  const settings = context.services.settings.merged;
  const rotationSettings = settings?.apiKeyRotation;
  
  // Get environment API key as fallback
  const envApiKey = process.env.CEREBRAS_API_KEY || process.env.OPENAI_API_KEY;

  if ((!rotationSettings || !rotationSettings.apiKeys || rotationSettings.apiKeys.length === 0) && !envApiKey) {
    return {
      type: 'message',
      messageType: 'info',
      content: `${COLOR_YELLOW}No API keys configured for rotation.${RESET_COLOR}\n\n` +
        'To add API keys for rotation:\n' +
        '• Use `/api-keys add <your-api-key>` to add keys\n' +
        '• Or edit your settings.json file manually\n\n' +
        `${COLOR_CYAN}API key rotation helps avoid rate limits by automatically switching between multiple Cerebras API keys.${RESET_COLOR}`,
    };
  }

  // Create a temporary rotation manager to get status
  const rotationManager = new ApiKeyRotationManager({
    settings: rotationSettings || { apiKeys: [], currentKeyIndex: 0, autoRotateOnRateLimit: true },
  }, envApiKey);

  const status = rotationManager.getRotationStatus();
  
  let message = `${COLOR_GREEN}API Key Rotation Status${RESET_COLOR}\n\n`;
  message += `• Total keys: ${status.totalKeys}\n`;
  message += `• Current key: ${status.currentKeyPreview} (index ${status.currentKeyIndex})\n`;
  message += `• Auto-rotation: ${status.autoRotateEnabled ? COLOR_GREEN + 'Enabled' : COLOR_YELLOW + 'Disabled'}${RESET_COLOR}\n\n`;

  if (Object.keys(status.dailyUsage).length > 0) {
    message += `${COLOR_CYAN}Daily Usage:${RESET_COLOR}\n`;
    for (const [keyHash, usage] of Object.entries(status.dailyUsage)) {
      const usageData = usage as { date: string; requests: number };
      message += `• Key ...${keyHash}: ${usageData.requests} requests (${usageData.date})\n`;
    }
    message += '\n';
  }

  message += `${COLOR_GREY}Available commands:${RESET_COLOR}\n`;
  message += '• `/api-keys add <key>` - Add new API key\n';
  message += '• `/api-keys remove <key-preview>` - Remove API key\n';
  message += '• `/api-keys rotate` - Manually rotate to next key\n';
  message += '• `/api-keys test` - Test all keys for rate limits\n';
  message += '• `/api-keys toggle` - Enable/disable auto-rotation\n';

  return {
    type: 'message',
    messageType: 'info',
    content: message,
  };
};

/**
 * Add a new API key to rotation
 */
const addApiKey = async (context: CommandContext, args: string): Promise<SlashCommandActionReturn> => {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Config not loaded.',
    };
  }

  const apiKey = args.trim();
  if (!apiKey) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Please provide an API key: `/api-keys add <your-api-key>`',
    };
  }

  // Validate API key format
  if (!ApiKeyRotationManager.validateApiKey(apiKey)) {
    return {
      type: 'message',
      messageType: 'error',
      content: `${COLOR_RED}Invalid API key format.${RESET_COLOR}\n\n` +
        'API keys should:\n' +
        '• Be at least 20 characters long\n' +
        '• Start with "csk-" (Cerebras), "sk-" (OpenAI), or "api-"\n',
    };
  }

  try {
    const settings = context.services.settings.merged;
    if (!settings) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Unable to access settings.',
      };
    }

    // Initialize rotation settings if they don't exist
    if (!settings.apiKeyRotation) {
      settings.apiKeyRotation = {
        apiKeys: [],
        currentKeyIndex: 0,
        autoRotateOnRateLimit: true,
        resetRotationDaily: true,
        dailyUsageTracking: {},
      };
    }

    if (!settings.apiKeyRotation.apiKeys) {
      settings.apiKeyRotation.apiKeys = [];
    }

    // Check if key already exists
    if (settings.apiKeyRotation.apiKeys.includes(apiKey)) {
      return {
        type: 'message',
        messageType: 'info',
        content: `${COLOR_YELLOW}API key already exists in rotation.${RESET_COLOR}`,
      };
    }

    // Add the key
    settings.apiKeyRotation.apiKeys.push(apiKey);
    
    // Save settings to disk using the settings system
    context.services.settings.setValue(SettingScope.User, 'apiKeyRotation', settings.apiKeyRotation);
    
    return {
      type: 'message',
      messageType: 'info',
      content: `${COLOR_GREEN}✓ API key added successfully!${RESET_COLOR}\n\n` +
        `Total keys in rotation: ${settings.apiKeyRotation.apiKeys.length}\n` +
        `Key preview: ...${apiKey.slice(-4)}\n\n` +
        `${COLOR_CYAN}Settings saved. Restart the CLI for changes to take effect.${RESET_COLOR}`,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `Failed to add API key: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

/**
 * Remove an API key from rotation
 */
const removeApiKey = async (context: CommandContext, args: string): Promise<SlashCommandActionReturn> => {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Config not loaded.',
    };
  }

  const keyPreview = args.trim();
  if (!keyPreview) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Please provide a key preview: `/api-keys remove <key-preview>`\n' +
        'Use `/api-keys status` to see available key previews.',
    };
  }

  try {
    const settings = context.services.settings.merged;
    if (!settings?.apiKeyRotation?.apiKeys) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'No API keys configured for rotation.',
      };
    }

    // Find key by preview (last 4 characters)
    const keyToRemove = settings.apiKeyRotation.apiKeys.find((key: string) => 
      key.slice(-4) === keyPreview || key.endsWith(keyPreview)
    );

    if (!keyToRemove) {
      return {
        type: 'message',
        messageType: 'error',
        content: `${COLOR_RED}API key with preview "${keyPreview}" not found.${RESET_COLOR}\n\n` +
          'Use `/api-keys status` to see available keys.',
      };
    }

    // Remove the key
    const index = settings.apiKeyRotation.apiKeys.indexOf(keyToRemove);
    settings.apiKeyRotation.apiKeys.splice(index, 1);

    // Adjust current index if needed
    if (settings.apiKeyRotation.currentKeyIndex && settings.apiKeyRotation.currentKeyIndex >= index) {
      settings.apiKeyRotation.currentKeyIndex = Math.max(0, settings.apiKeyRotation.currentKeyIndex - 1);
    }

    // Save settings to disk
    context.services.settings.setValue(SettingScope.User, 'apiKeyRotation', settings.apiKeyRotation);

    return {
      type: 'message',
      messageType: 'info',
      content: `${COLOR_GREEN}✓ API key removed successfully!${RESET_COLOR}\n\n` +
        `Removed key: ...${keyToRemove.slice(-4)}\n` +
        `Remaining keys: ${settings.apiKeyRotation.apiKeys.length}\n\n` +
        `${COLOR_CYAN}Settings saved. Restart the CLI for changes to take effect.${RESET_COLOR}`,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `Failed to remove API key: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

/**
 * Manually rotate to the next API key
 */
const rotateApiKey = async (context: CommandContext): Promise<SlashCommandActionReturn> => {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Config not loaded.',
    };
  }

  try {
    const settings = context.services.settings.merged;
    const envApiKey = process.env.CEREBRAS_API_KEY || process.env.OPENAI_API_KEY;
    
    // Create rotation manager to get total available keys (including env key)
    const rotationManager = new ApiKeyRotationManager({
      settings: settings?.apiKeyRotation || { apiKeys: [], currentKeyIndex: 0, autoRotateOnRateLimit: true },
      onSettingsUpdate: async (newSettings: any) => {
        if (settings) {
          settings.apiKeyRotation = newSettings;
          context.services.settings.setValue(SettingScope.User, 'apiKeyRotation', settings.apiKeyRotation);
        }
      }
    }, envApiKey);

    const totalKeys = rotationManager.getAvailableKeys().length;
    if (totalKeys <= 1) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Need at least 2 API keys to rotate. Add more keys with `/api-keys add <key>`.',
      };
    }

    const newKey = await rotationManager.rotateToNextKey();
    const status = rotationManager.getRotationStatus();

    return {
      type: 'message',
      messageType: 'info',
      content: `${COLOR_GREEN}✓ Rotated to next API key!${RESET_COLOR}\n\n` +
        `Current key: ${status.currentKeyPreview} (${status.currentKeyIndex + 1} of ${status.totalKeys})\n\n` +
        `${COLOR_CYAN}Note: New requests will use the rotated key.${RESET_COLOR}`,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `Failed to rotate API key: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

/**
 * Test all API keys with a simple request
 */
const testApiKeys = async (context: CommandContext): Promise<SlashCommandActionReturn> => {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Config not loaded.',
    };
  }

  const settings = context.services.settings.merged;
  const rotationSettings = settings?.apiKeyRotation;
  const envApiKey = process.env.CEREBRAS_API_KEY || process.env.OPENAI_API_KEY;

  // Create rotation manager to get all keys
  const rotationManager = new ApiKeyRotationManager({
    settings: rotationSettings || { apiKeys: [], currentKeyIndex: 0, autoRotateOnRateLimit: true },
  }, envApiKey);

  const allKeys = rotationManager.getAvailableKeys();

  if (allKeys.length === 0) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'No API keys available to test.',
    };
  }

  let message = `${COLOR_CYAN}Testing API Keys...${RESET_COLOR}\n\n`;

  // Test each key
  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];
    const keyPreview = `...${key.slice(-4)}`;
    const isEnvKey = key === envApiKey;
    const keyLabel = isEnvKey ? `${keyPreview} (env)` : keyPreview;

    message += `${COLOR_YELLOW}Testing key ${i + 1}/${allKeys.length}: ${keyLabel}${RESET_COLOR}\n`;

    try {
      // Create a simple OpenAI client to test the key
      const OpenAI = (await import('openai')).default;
      const baseURL = process.env.CEREBRAS_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.cerebras.ai/v1';
      
      const testClient = new OpenAI({
        apiKey: key,
        baseURL,
        timeout: 5000, // 5 second timeout for faster testing
        maxRetries: 0, // No retries for testing
      });

      // Simple test request
      const response = await testClient.chat.completions.create({
        model: 'gpt-oss-120b',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
        temperature: 0,
      });

      if (response.choices && response.choices.length > 0) {
        message += `  ${COLOR_GREEN}✓ Working${RESET_COLOR} - Response: "${response.choices[0].message.content?.trim() || 'OK'}"\n`;
      } else {
        message += `  ${COLOR_YELLOW}⚠ Unexpected response format${RESET_COLOR}\n`;
      }

    } catch (error: any) {
      const errorMsg = error.message || String(error);
      
      if (errorMsg.includes('429') || errorMsg.includes('rate limit') || errorMsg.includes('quota')) {
        message += `  ${COLOR_RED}✗ Rate limited${RESET_COLOR} - ${errorMsg.split('\n')[0]}\n`;
      } else if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || errorMsg.includes('authentication')) {
        message += `  ${COLOR_RED}✗ Invalid key${RESET_COLOR} - Authentication failed\n`;
      } else if (errorMsg.includes('timeout')) {
        message += `  ${COLOR_YELLOW}⚠ Timeout${RESET_COLOR} - Request timed out\n`;
      } else {
        message += `  ${COLOR_RED}✗ Error${RESET_COLOR} - ${errorMsg.split('\n')[0].substring(0, 60)}...\n`;
      }
    }

    message += '\n';
  }

  // Add rotation suggestion
  const workingKeyIndex = allKeys.findIndex(async (key) => {
    // This is a simplified check - in practice we'd need to test each key
    return true; // We already tested above
  });

  message += `${COLOR_GREY}Commands:${RESET_COLOR}\n`;
  message += '• `/api-keys rotate` - Switch to next key\n';
  message += '• `/api-keys status` - View current rotation status\n';

  return {
    type: 'message',
    messageType: 'info',
    content: message,
  };
};

/**
 * Toggle auto-rotation on/off
 */
const toggleAutoRotation = async (context: CommandContext): Promise<SlashCommandActionReturn> => {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Config not loaded.',
    };
  }

  try {
    const settings = context.services.settings.merged;
    if (!settings) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Unable to access settings.',
      };
    }

    // Initialize rotation settings if they don't exist
    if (!settings.apiKeyRotation) {
      settings.apiKeyRotation = {
        apiKeys: [],
        currentKeyIndex: 0,
        autoRotateOnRateLimit: true,
        resetRotationDaily: true,
        dailyUsageTracking: {},
      };
    }

    // Toggle the setting
    const currentState = settings.apiKeyRotation.autoRotateOnRateLimit ?? true;
    settings.apiKeyRotation.autoRotateOnRateLimit = !currentState;

    const newState = settings.apiKeyRotation.autoRotateOnRateLimit;
    
    // Save settings to disk
    context.services.settings.setValue(SettingScope.User, 'apiKeyRotation', settings.apiKeyRotation);
    
    return {
      type: 'message',
      messageType: 'info',
      content: `${COLOR_GREEN}✓ Auto-rotation ${newState ? 'enabled' : 'disabled'}!${RESET_COLOR}\n\n` +
        `Auto-rotation is now: ${newState ? COLOR_GREEN + 'ON' : COLOR_YELLOW + 'OFF'}${RESET_COLOR}\n\n` +
        `${COLOR_CYAN}${newState ? 
          'The system will automatically switch API keys when rate limits are detected.' :
          'You will need to manually rotate keys using `/api-keys rotate`.'
        }${RESET_COLOR}`,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `Failed to toggle auto-rotation: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

export const apiKeysCommand: SlashCommand = {
  name: 'api-keys',
  altNames: ['keys', 'rotation'],
  description: 'Manage API key rotation for rate limit handling',
  kind: CommandKind.BUILT_IN,
  action: showApiKeyStatus,
  subCommands: [
    {
      name: 'status',
      description: 'Show current API key rotation status',
      kind: CommandKind.BUILT_IN,
      action: showApiKeyStatus,
    },
    {
      name: 'add',
      description: 'Add a new API key to rotation',
      kind: CommandKind.BUILT_IN,
      action: addApiKey,
    },
    {
      name: 'remove',
      description: 'Remove an API key from rotation',
      kind: CommandKind.BUILT_IN,
      action: removeApiKey,
    },
    {
      name: 'rotate',
      description: 'Manually rotate to the next API key',
      kind: CommandKind.BUILT_IN,
      action: rotateApiKey,
    },
    {
      name: 'test',
      description: 'Test all API keys with a simple request',
      kind: CommandKind.BUILT_IN,
      action: testApiKeys,
    },
    {
      name: 'toggle',
      description: 'Enable/disable automatic rotation on rate limits',
      kind: CommandKind.BUILT_IN,
      action: toggleAutoRotation,
    },
  ],
};