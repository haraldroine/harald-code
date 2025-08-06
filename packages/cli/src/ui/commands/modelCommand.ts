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
import OpenAI from 'openai';

const COLOR_GREEN = '\u001b[32m';
const COLOR_YELLOW = '\u001b[33m';
const COLOR_RED = '\u001b[31m';
const COLOR_CYAN = '\u001b[36m';
const COLOR_GREY = '\u001b[90m';
const RESET_COLOR = '\u001b[0m';

// Fallback models if API call fails
const FALLBACK_MODELS = [
  'gpt-oss-120b',
  'llama3.1-8b',
  'llama-3.3-70b',
  'qwen-3-32b',
  'qwen-3-235b-a22b-instruct-2507',
  'llama-4-scout-17b-16e-instruct',
  'llama-4-maverick-17b-128e-instruct',
];

const DEFAULT_MODEL = 'gpt-oss-120b';

interface CerebrasModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

/**
 * Fetch available models from Cerebras API
 */
async function fetchAvailableModels(): Promise<string[]> {
  try {
    const apiKey = process.env.CEREBRAS_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return FALLBACK_MODELS;
    }

    const baseURL = process.env.CEREBRAS_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.cerebras.ai/v1';
    
    const client = new OpenAI({
      apiKey,
      baseURL,
      timeout: 5000, // 5 second timeout for model listing
    });

    const response = await client.models.list();
    const models = response.data
      .map((model: CerebrasModel) => model.id)
      .sort();

    return models.length > 0 ? models : FALLBACK_MODELS;
  } catch (error) {
    console.warn('Failed to fetch models from Cerebras API, using fallback list:', error);
    return FALLBACK_MODELS;
  }
}

/**
 * Get model details from Cerebras API
 */
async function getModelDetails(modelId: string): Promise<CerebrasModel | null> {
  try {
    const apiKey = process.env.CEREBRAS_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return null;
    }

    const baseURL = process.env.CEREBRAS_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.cerebras.ai/v1';
    
    const client = new OpenAI({
      apiKey,
      baseURL,
      timeout: 5000,
    });

    const model = await client.models.retrieve(modelId);
    return model as CerebrasModel;
  } catch (error) {
    return null;
  }
}

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
  
  // Check if we have API access and validate model
  const apiKey = process.env.CEREBRAS_API_KEY || process.env.OPENAI_API_KEY;
  if (apiKey) {
    message += `${COLOR_GREY}API Status:${RESET_COLOR} ${COLOR_GREEN}Connected${RESET_COLOR}\n`;
    
    // Show loading indicator for API call
    context.ui.addItem(
      {
        type: 'info',
        text: `${COLOR_CYAN}Verifying model with Cerebras API...${RESET_COLOR}`,
      },
      Date.now(),
    );
    
    // Try to get model details from API
    const modelDetails = await getModelDetails(currentModel);
    if (modelDetails) {
      message += `${COLOR_GREEN}✓ Model verified via Cerebras API${RESET_COLOR}\n`;
      message += `${COLOR_GREY}Owner: ${modelDetails.owned_by}${RESET_COLOR}\n`;
    } else {
      message += `${COLOR_YELLOW}⚠ Model not found in Cerebras API (may still work)${RESET_COLOR}\n`;
    }
  } else {
    message += `${COLOR_GREY}API Status:${RESET_COLOR} ${COLOR_YELLOW}No API key configured${RESET_COLOR}\n`;
    if (FALLBACK_MODELS.includes(currentModel)) {
      message += `${COLOR_GREEN}✓ Model is in fallback list${RESET_COLOR}\n`;
    } else {
      message += `${COLOR_YELLOW}⚠ Warning: '${currentModel}' is not in the fallback list${RESET_COLOR}\n`;
    }
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

  // Show loading indicator
  const apiKey = process.env.CEREBRAS_API_KEY || process.env.OPENAI_API_KEY;
  if (apiKey) {
    context.ui.addItem(
      {
        type: 'info',
        text: `${COLOR_CYAN}Loading models from Cerebras API...${RESET_COLOR}`,
      },
      Date.now(),
    );
  }

  // Fetch available models from API
  const availableModels = await fetchAvailableModels();
  
  let message = `${COLOR_GREEN}Available Cerebras Models${RESET_COLOR}`;
  
  if (apiKey) {
    message += ` ${COLOR_GREY}(via API)${RESET_COLOR}`;
  } else {
    message += ` ${COLOR_GREY}(fallback list)${RESET_COLOR}`;
  }
  
  message += `\n\n`;
  
  for (let i = 0; i < availableModels.length; i++) {
    const model = availableModels[i];
    const isCurrent = model === currentModel;
    const marker = isCurrent ? `${COLOR_GREEN}● ` : `${COLOR_GREY}○ `;
    const modelColor = isCurrent ? COLOR_GREEN : COLOR_CYAN;
    
    message += `${marker}${modelColor}${model}${RESET_COLOR}`;
    if (isCurrent) {
      message += ` ${COLOR_YELLOW}(current)${RESET_COLOR}`;
    }
    
    // Try to get description from API if available
    if (apiKey) {
      const modelDetails = await getModelDetails(model);
      if (modelDetails) {
        message += `\n    ${COLOR_GREY}Owner: ${modelDetails.owned_by}${RESET_COLOR}`;
      }
    } else {
      // Use hardcoded description for fallback models
      const description = getModelDescription(model);
      if (description) {
        message += `\n    ${COLOR_GREY}${description}${RESET_COLOR}`;
      }
    }
    
    message += '\n';
    
    if (i < availableModels.length - 1) {
      message += '\n';
    }
  }

  message += `\n\n${COLOR_CYAN}Use '/model set <model>' to change the active model.${RESET_COLOR}`;
  
  if (!apiKey) {
    message += `\n${COLOR_YELLOW}💡 Tip: Set CEREBRAS_API_KEY to see the latest available models.${RESET_COLOR}`;
  }

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

  // Show loading indicator for model validation
  const apiKey = process.env.CEREBRAS_API_KEY || process.env.OPENAI_API_KEY;
  if (apiKey) {
    context.ui.addItem(
      {
        type: 'info',
        text: `${COLOR_CYAN}Validating model with Cerebras API...${RESET_COLOR}`,
      },
      Date.now(),
    );
  }

  // Validate model name against available models
  const availableModels = await fetchAvailableModels();
  if (!availableModels.includes(modelName)) {
    return {
      type: 'message',
      messageType: 'error',
      content: `${COLOR_RED}Unknown model: '${modelName}'${RESET_COLOR}\n\n` +
        `Available models:\n${availableModels.map(m => `• ${m}`).join('\n')}\n\n` +
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

    let message = `${COLOR_GREEN}✓ Model changed successfully!${RESET_COLOR}\n\n`;
    message += `${COLOR_CYAN}New model:${RESET_COLOR} ${modelName}\n`;
    
    // Try to get model details from API
    const apiKeyForDetails = process.env.CEREBRAS_API_KEY || process.env.OPENAI_API_KEY;
    if (apiKeyForDetails) {
      context.ui.addItem(
        {
          type: 'info',
          text: `${COLOR_CYAN}Getting model details...${RESET_COLOR}`,
        },
        Date.now(),
      );
      
      const modelDetails = await getModelDetails(modelName);
      if (modelDetails) {
        message += `${COLOR_GREY}Owner: ${modelDetails.owned_by}${RESET_COLOR}\n`;
      }
    } else {
      // Use hardcoded description for fallback
      const description = getModelDescription(modelName);
      if (description) {
        message += `${COLOR_GREY}${description}${RESET_COLOR}\n`;
      }
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