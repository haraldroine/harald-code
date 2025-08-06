/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CommandKind,
  type CommandContext,
  type SlashCommand,
  type MessageActionReturn,
} from './types.js';
import { SettingScope } from '../../config/settings.js';

const showCurrentSettings = async (
  context: CommandContext,
): Promise<MessageActionReturn> => {
  const settings = context.services.settings;
  const currentLimit = settings.merged.sessionTokenLimit || 32000;

  return {
    type: 'message',
    messageType: 'info',
    content: `Current settings:\n  sessionTokenLimit: ${currentLimit}`,
  };
};

const setSessionTokenLimit = async (
  context: CommandContext,
  args: string,
): Promise<MessageActionReturn> => {
  const settings = context.services.settings;
  const value = args.trim();

  if (!value) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Missing value. Usage: /settings sessionTokenLimit <number>',
    };
  }

  const numValue = parseInt(value, 10);
  if (isNaN(numValue) || numValue < 0) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Invalid value. Please provide a positive number.',
    };
  }

  try {
    settings.setValue(SettingScope.User, 'sessionTokenLimit', numValue);
    return {
      type: 'message',
      messageType: 'info',
      content: `sessionTokenLimit updated to ${numValue}`,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `Error updating setting: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

const sessionTokenLimitSubCommand: SlashCommand = {
  name: 'sessionTokenLimit',
  description: 'Get or set the session token limit. Usage: /settings sessionTokenLimit [<number>]',
  kind: CommandKind.BUILT_IN,
  action: async (context: CommandContext, args: string): Promise<MessageActionReturn> => {
    const trimmedArgs = args.trim();
    
    if (!trimmedArgs) {
      // Show current value
      const currentLimit = context.services.settings.merged.sessionTokenLimit || 32000;
      return {
        type: 'message',
        messageType: 'info',
        content: `Current sessionTokenLimit: ${currentLimit}`,
      };
    }
    
    // Set new value
    return setSessionTokenLimit(context, trimmedArgs);
  },
};

export const settingsCommand: SlashCommand = {
  name: 'settings',
  description: 'View or modify configuration settings',
  kind: CommandKind.BUILT_IN,
  action: showCurrentSettings,
  subCommands: [sessionTokenLimitSubCommand],
};