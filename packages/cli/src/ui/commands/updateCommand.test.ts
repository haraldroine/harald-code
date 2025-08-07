/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { updateCommand } from './updateCommand.js';
import { type CommandContext } from './types.js';
import { createMockCommandContext } from '../../test-utils/mockCommandContext.js';
import * as updateCheck from '../utils/updateCheck.js';
import * as installationInfo from '../../utils/installationInfo.js';
import * as handleAutoUpdate from '../../utils/handleAutoUpdate.js';
import { PackageManager } from '../../utils/installationInfo.js';
import { MessageType } from '../types.js';

vi.mock('../utils/updateCheck.js', () => ({
  checkForUpdates: vi.fn(),
}));

vi.mock('../../utils/installationInfo.js', () => ({
  getInstallationInfo: vi.fn(),
  PackageManager: {
    NPM: 'npm',
    YARN: 'yarn',
    PNPM: 'pnpm',
    BUN: 'bun',
    UNKNOWN: 'unknown',
  },
}));

vi.mock('../../utils/handleAutoUpdate.js', () => ({
  handleAutoUpdate: vi.fn(),
}));

describe('updateCommand', () => {
  let mockContext: CommandContext;

  beforeEach(() => {
    mockContext = createMockCommandContext({
      services: {
        settings: {
          merged: {
            disableAutoUpdate: false,
            disableUpdateNag: false,
          },
        },
      },
      ui: {
        addItem: vi.fn(),
      },
    } as unknown as CommandContext);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('main command (check action)', () => {
    it('should report no updates available', async () => {
      vi.mocked(updateCheck.checkForUpdates).mockResolvedValue(null);

      const result = await updateCommand.action!(mockContext, '');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: 'You are already using the latest version!',
      });
      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        {
          type: MessageType.INFO,
          text: 'Checking for updates...',
        },
        expect.any(Number),
      );
    });

    it('should report available update with installation info', async () => {
      const mockUpdate = {
        message: 'New version available: v1.2.3',
        update: {
          current: '1.2.2',
          latest: '1.2.3',
          type: 'minor' as const,
          name: '@harald-code/harald-code',
        },
      };

      const mockInstallInfo = {
        packageManager: PackageManager.NPM,
        isGlobal: true,
        updateCommand: 'npm install -g @harald-code/harald-code@latest',
        updateMessage: 'Please run npm install -g @harald-code/harald-code@latest to update',
      };

      vi.mocked(updateCheck.checkForUpdates).mockResolvedValue(mockUpdate);
      vi.mocked(installationInfo.getInstallationInfo).mockReturnValue(mockInstallInfo);

      const result = await updateCommand.action!(mockContext, '');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: 'New version available: v1.2.3\nPlease run npm install -g @harald-code/harald-code@latest to update',
      });
    });

    it('should handle update check errors', async () => {
      vi.mocked(updateCheck.checkForUpdates).mockRejectedValue(new Error('Network error'));

      const result = await updateCommand.action!(mockContext, '');

      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: 'Failed to check for updates: Network error',
      });
    });
  });

  describe('install subcommand', () => {
    const installCommand = updateCommand.subCommands?.find(cmd => cmd.name === 'install');

    it('should report no updates available for install', async () => {
      vi.mocked(updateCheck.checkForUpdates).mockResolvedValue(null);
      vi.mocked(installationInfo.getInstallationInfo).mockReturnValue({
        packageManager: PackageManager.NPM,
        isGlobal: true,
        updateCommand: 'npm install -g @harald-code/harald-code@latest',
      });

      const result = await installCommand!.action!(mockContext, '');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: 'You are already using the latest version!',
      });
    });

    it('should start update process when update is available', async () => {
      const mockUpdate = {
        message: 'New version available: v1.2.3',
        update: {
          current: '1.2.2',
          latest: '1.2.3',
          type: 'minor' as const,
          name: '@harald-code/harald-code',
        },
      };

      const mockInstallInfo = {
        packageManager: PackageManager.NPM,
        isGlobal: true,
        updateCommand: 'npm install -g @harald-code/harald-code@latest',
      };

      const mockProcess = { pid: 12345 };

      vi.mocked(updateCheck.checkForUpdates).mockResolvedValue(mockUpdate);
      vi.mocked(installationInfo.getInstallationInfo).mockReturnValue(mockInstallInfo);
      vi.mocked(handleAutoUpdate.handleAutoUpdate).mockReturnValue(mockProcess as any);

      const result = await installCommand!.action!(mockContext, '');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: 'Update started! Please wait for the update to complete. You will see a confirmation message when it\'s done.',
      });
      expect(handleAutoUpdate.handleAutoUpdate).toHaveBeenCalledWith(
        mockUpdate,
        mockContext.services.settings,
        process.cwd(),
      );
    });

    it('should report error when no update command available', async () => {
      const mockInstallInfo = {
        packageManager: PackageManager.UNKNOWN,
        isGlobal: false,
        updateCommand: undefined,
      };

      vi.mocked(installationInfo.getInstallationInfo).mockReturnValue(mockInstallInfo);

      const result = await installCommand!.action!(mockContext, '');

      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: 'Automatic updates are not available for this installation method. Please update manually.',
      });
    });
  });

  describe('status subcommand', () => {
    const statusCommand = updateCommand.subCommands?.find(cmd => cmd.name === 'status');

    it('should show installation and update status', async () => {
      const mockInstallInfo = {
        packageManager: PackageManager.NPM,
        isGlobal: true,
        updateCommand: 'npm install -g @harald-code/harald-code@latest',
      };

      vi.mocked(installationInfo.getInstallationInfo).mockReturnValue(mockInstallInfo);

      const result = await statusCommand!.action!(mockContext, '');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: `Update Status:
• Package Manager: npm
• Installation Type: global
• Update Command: npm install -g @harald-code/harald-code@latest
• Auto-update: enabled
• Update Notifications: enabled`,
      });
    });

    it('should show disabled status when auto-update is disabled', async () => {
      mockContext.services.settings.merged.disableAutoUpdate = true;
      mockContext.services.settings.merged.disableUpdateNag = true;

      const mockInstallInfo = {
        packageManager: PackageManager.YARN,
        isGlobal: false,
        updateCommand: undefined,
      };

      vi.mocked(installationInfo.getInstallationInfo).mockReturnValue(mockInstallInfo);

      const result = await statusCommand!.action!(mockContext, '');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: `Update Status:
• Package Manager: yarn
• Installation Type: local
• Update Command: not available
• Auto-update: disabled
• Update Notifications: disabled`,
      });
    });
  });

  describe('command structure', () => {
    it('should have correct command properties', () => {
      expect(updateCommand.name).toBe('update');
      expect(updateCommand.description).toBe('Manage updates for Harald Code');
      expect(updateCommand.kind).toBe('built-in');
      expect(updateCommand.subCommands).toHaveLength(3);
      
      const subCommandNames = updateCommand.subCommands!.map(cmd => cmd.name);
      expect(subCommandNames).toEqual(['check', 'install', 'status']);
    });

    it('should have install command with altNames', () => {
      const installCommand = updateCommand.subCommands?.find(cmd => cmd.name === 'install');
      expect(installCommand?.altNames).toEqual(['run']);
    });
  });
});