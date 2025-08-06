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
} from './types.js';
import { SettingScope } from '../../config/settings.js';

const COLOR_GREEN = '\u001b[32m';
const COLOR_YELLOW = '\u001b[33m';
const COLOR_RED = '\u001b[31m';
const COLOR_CYAN = '\u001b[36m';
const COLOR_GREY = '\u001b[90m';
const RESET_COLOR = '\u001b[0m';

// Available Cerebras models
const AVAILABLE_MODELS = [
  'gpt-oss-120b',
  'llama3.1-8b',
  'llama-3.3-70b',
  'qwen-3-32b',
  'qwen-3-235b-a22b-instruct-2507',
  'llama-4-scout-17b-16e-instruct',
  'llama-4-maverick-17b-128e-instruct',
];

const DEFAULT_MODEL = 'gpt-oss-120b';

/**
 * Show current model configuration
 */
const showCurrentModel = async (context: CommandContext): Promise<SlashCommandActionReturn> => {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Config not loaded.',
    };
  }

  const settings = context.services.settings.merged;
  
  // Get current model from various sources in priority order
  const currentModel = 
    config.getModel() || 
    settings?.model || 
    process.env.CEREBRAS_MODEL || 
    process.env.OPENAI_MODEL || 
    DEFAULT_MODEL;

  const envModel = process.env.CEREBRAS_MODEL || process.env.OPENAI_MODEL;
  const settingsModel = settings?.model;

  let message = `${COLOR_GREEN}Current Model Configuration${RESET_COLOR}\n\n`;
  message += `${COLOR_CYAN}Active Model:${RESET_COLOR} ${currentModel}\n\n`;
  
  message += `${COLOR_GREY}Configuration Sources:${RESET_COLOR}\n`;
  message += `• Settings file: ${settingsModel || 'not set'}\n`;
  message += `• Environment: ${envModel || 'not set'}\n`;
  message += `• Default: ${DEFAULT_MODEL}\n\n`;
  
  if (AVAILABLE_MODELS.includes(currentModel)) {
    message += `${COLOR_GREEN}✓ Model is valid${RESET_COLOR}\n`;
  } else {
    message += `${COLOR_YELLOW}⚠ Warning: '${currentModel}' is not in the list of known Cerebras models${RESET_COLOR}\n`;
  }

  message += `\n${COLOR_CYAN}Use '/model list' to see available models or '/model set <model>' to change.${RESET_COLOR}`;

  return {
    type: 'message',
    messageType: 'info',
    content: message,
  };
};

/**
 * List all available models
 */
const listModels = async (context: CommandContext): Promise<SlashCommandActionReturn> => {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Config not loaded.',
    };
  }

  const currentModel = 
    config.getModel() || 
    context.services.settings.merged?.model || 
    process.env.CEREBRAS_MODEL || 
    process.env.OPENAI_MODEL || 
    DEFAULT_MODEL;

  let message = `${COLOR_GREEN}Available Cerebras Models${RESET_COLOR}\n\n`;
  
  AVAILABLE_MODELS.forEach((model, index) => {
    const isCurrent = model === currentModel;
    const marker = isCurrent ? `${COLOR_GREEN}● ` : `${COLOR_GREY}○ `;
    const modelColor = isCurrent ? COLOR_GREEN : COLOR_CYAN;
    const description = getModelDescription(model);
    
    message += `${marker}${modelColor}${model}${RESET_COLOR}`;
    if (isCurrent) {
      message += ` ${COLOR_YELLOW}(current)${RESET_COLOR}`;
    }
    if (description) {
      message += `\n    ${COLOR_GREY}${description}${RESET_COLOR}`;
    }
    message += '\n';
    
    if (index < AVAILABLE_MODELS.length - 1) {
      message += '\n';
    }
  });

  message += `\n\n${COLOR_CYAN}Use '/model set <model>' to change the active model.${RESET_COLOR}`;

  return {
    type: 'message',
    messageType: 'info',
    content: message,
  };
};

/**
 * Set a new model
 */
const setModel = async (context: CommandContext, args: string): Promise<SlashCommandActionReturn> => {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Config not loaded.',
    };
  }

  const modelName = args.trim();
  if (!modelName) {
    return {
      type: 'message',
      messageType: 'error',
      content: `${COLOR_RED}Please specify a model name.${RESET_COLOR}\n\n` +
        `Usage: /model set <model_name>\n` +
        `Example: /model set llama3.1-8b\n\n` +
        `Use '/model list' to see available models.`,
    };
  }

  // Validate model name
  if (!AVAILABLE_MODELS.includes(modelName)) {
    return {
      type: 'message',
      messageType: 'error',
      content: `${COLOR_RED}Unknown model: '${modelName}'${RESET_COLOR}\n\n` +
        `Available models:\n${AVAILABLE_MODELS.map(m => `• ${m}`).join('\n')}\n\n` +
        `Use '/model list' to see detailed information.`,
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

    // Update the model in settings
    context.services.settings.setValue(SettingScope.User, 'model', modelName);
    
    // Also update the config for the current session
    config.setModel(modelName);

    const description = getModelDescription(modelName);
    let message = `${COLOR_GREEN}✓ Model changed successfully!${RESET_COLOR}\n\n`;
    message += `${COLOR_CYAN}New model:${RESET_COLOR} ${modelName}\n`;
    if (description) {
      message += `${COLOR_GREY}${description}${RESET_COLOR}\n`;
    }
    message += `\n${COLOR_YELLOW}Note: The model change is now active for new conversations.${RESET_COLOR}`;

    return {
      type: 'message',
      messageType: 'info',
      content: message,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `Failed to set model: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

/**
 * Get description for a model
 */
function getModelDescription(model: string): string {
  const descriptions: Record<string, string> = {
    'gpt-oss-120b': 'Default - Best for code generation (120B parameters)',
    'llama3.1-8b': 'Fast and efficient (8B parameters)',
    'llama-3.3-70b': 'Large model with strong reasoning (70B parameters)',
    'qwen-3-32b': 'Qwen 3 model (32B parameters)',
    'qwen-3-235b-a22b-instruct-2507': 'Large Qwen 3 instruct model (235B parameters)',
    'llama-4-scout-17b-16e-instruct': 'Llama 4 Scout instruct model (17B parameters)',
    'llama-4-maverick-17b-128e-instruct': 'Llama 4 Maverick instruct model (17B parameters)',
  };
  
  return descriptions[model] || '';
}

export const modelCommand: SlashCommand = {
  name: 'model',
  altNames: ['models', 'm'],
  description: 'Manage and switch between Cerebras models',
  kind: CommandKind.BUILT_IN,
  action: showCurrentModel,
  subCommands: [
    {
      name: 'current',
      description: 'Show current model configuration',
      kind: CommandKind.BUILT_IN,
      action: showCurrentModel,
    },
    {
      name: 'list',
      description: 'List all available Cerebras models',
      kind: CommandKind.BUILT_IN,
      action: listModels,
    },
    {
      name: 'set',
      description: 'Set a new model',
      kind: CommandKind.BUILT_IN,
      action: setModel,
    },
  ],
};