/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommandKind, SlashCommand, SlashCommandActionReturn } from './types.js';
import { getInstallationInfo } from '../../utils/installationInfo.js';
import { checkForUpdates } from '../utils/updateCheck.js';
import { handleAutoUpdate } from '../../utils/handleAutoUpdate.js';
import { MessageType } from '../types.js';
import { CommandContext } from './types.js';

const checkAction = async (context: CommandContext): Promise<SlashCommandActionReturn> => {
  context.ui.addItem(
    {
      type: MessageType.INFO,
      text: 'Checking for updates...',
    },
    Date.now(),
  );

  try {
    const updateInfo = await checkForUpdates();
    
    if (!updateInfo) {
      return {
        type: 'message',
        messageType: 'info',
        content: 'You are already using the latest version!',
      };
    }

    const installationInfo = getInstallationInfo(
      process.cwd(),
      context.services.settings.merged.disableAutoUpdate ?? false,
    );

    let message = updateInfo.message;
    if (installationInfo.updateMessage) {
      message += `\n${installationInfo.updateMessage}`;
    }

    return {
      type: 'message',
      messageType: 'info',
      content: message,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `Failed to check for updates: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

const installAction = async (context: CommandContext): Promise<SlashCommandActionReturn> => {
  const installationInfo = getInstallationInfo(
    process.cwd(),
    context.services.settings.merged.disableAutoUpdate ?? false,
  );

  if (!installationInfo.updateCommand) {
    return {
      type: 'message',
      messageType: 'error',
      content: 'Automatic updates are not available for this installation method. Please update manually.',
    };
  }

  context.ui.addItem(
    {
      type: MessageType.INFO,
      text: 'Checking for updates and installing if available...',
    },
    Date.now(),
  );

  try {
    const updateInfo = await checkForUpdates();
    
    if (!updateInfo) {
      return {
        type: 'message',
        messageType: 'info',
        content: 'You are already using the latest version!',
      };
    }

    // Use the existing auto-update mechanism
    const updateProcess = handleAutoUpdate(
      updateInfo,
      context.services.settings,
      process.cwd(),
    );

    if (updateProcess) {
      return {
        type: 'message',
        messageType: 'info',
        content: 'Update started! Please wait for the update to complete. You will see a confirmation message when it\'s done.',
      };
    } else {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Failed to start the update process.',
      };
    }
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: `Failed to install update: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

const statusAction = async (context: CommandContext): Promise<SlashCommandActionReturn> => {
  const installationInfo = getInstallationInfo(
    process.cwd(),
    context.services.settings.merged.disableAutoUpdate ?? false,
  );

  const autoUpdateStatus = context.services.settings.merged.disableAutoUpdate 
    ? 'disabled' 
    : 'enabled';
  
  const updateNagStatus = context.services.settings.merged.disableUpdateNag 
    ? 'disabled' 
    : 'enabled';

  const packageManager = installationInfo.packageManager;
  const isGlobal = installationInfo.isGlobal ? 'global' : 'local';
  const updateCommand = installationInfo.updateCommand || 'not available';

  return {
    type: 'message',
    messageType: 'info',
    content: `Update Status:
• Package Manager: ${packageManager}
• Installation Type: ${isGlobal}
• Update Command: ${updateCommand}
• Auto-update: ${autoUpdateStatus}
• Update Notifications: ${updateNagStatus}`,
  };
};

const checkCommand: SlashCommand = {
  name: 'check',
  description: 'Check for available updates',
  kind: CommandKind.BUILT_IN,
  action: checkAction,
};

const installCommand: SlashCommand = {
  name: 'install',
  altNames: ['run'],
  description: 'Check for and install available updates',
  kind: CommandKind.BUILT_IN,
  action: installAction,
};

const statusCommand: SlashCommand = {
  name: 'status',
  description: 'Show update configuration and installation info',
  kind: CommandKind.BUILT_IN,
  action: statusAction,
};

export const updateCommand: SlashCommand = {
  name: 'update',
  description: 'Manage updates for Harald Code',
  kind: CommandKind.BUILT_IN,
  action: checkAction, // Default action when no subcommand is provided
  subCommands: [checkCommand, installCommand, statusCommand],
};