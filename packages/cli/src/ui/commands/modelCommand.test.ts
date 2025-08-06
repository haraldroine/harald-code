/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { modelCommand } from './modelCommand.js';
import { CommandContext, CommandKind } from './types.js';
import { createMockCommandContext } from '../../test-utils/mockCommandContext.js';

describe('modelCommand', () => {
  let context: CommandContext;

  beforeEach(() => {
    context = createMockCommandContext({
      services: {
        config: {
          getModel: vi.fn().mockReturnValue('gpt-oss-120b'),
          setModel: vi.fn(),
        },
        settings: {
          merged: {
            model: 'gpt-oss-120b',
          },
          setValue: vi.fn(),
        },
      },
    } as unknown as CommandContext);
    vi.clearAllMocks();
  });

  it('should have correct command metadata', () => {
    expect(modelCommand.name).toBe('model');
    expect(modelCommand.altNames).toEqual(['models', 'm']);
    expect(modelCommand.description).toBe('Manage and switch between Cerebras models');
    expect(modelCommand.kind).toBe(CommandKind.BUILT_IN);
    expect(modelCommand.subCommands).toHaveLength(3);
  });

  it('should have correct subcommands', () => {
    const subCommandNames = modelCommand.subCommands!.map(cmd => cmd.name);
    expect(subCommandNames).toEqual(['current', 'list', 'set']);
  });

  describe('current subcommand', () => {
    it('should show current model configuration', async () => {
      const currentSubCommand = modelCommand.subCommands!.find(cmd => cmd.name === 'current');
      expect(currentSubCommand).toBeDefined();
      
      if (!currentSubCommand?.action) {
        throw new Error('Current subcommand action not defined');
      }

      const result = await currentSubCommand.action(context, '');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining('Current Model Configuration'),
      });
    });
  });

  describe('list subcommand', () => {
    it('should list available models', async () => {
      const listSubCommand = modelCommand.subCommands!.find(cmd => cmd.name === 'list');
      expect(listSubCommand).toBeDefined();
      
      if (!listSubCommand?.action) {
        throw new Error('List subcommand action not defined');
      }

      const result = await listSubCommand.action(context, '');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining('Available Cerebras Models'),
      });
    });
  });

  describe('set subcommand', () => {
    it('should set a valid model', async () => {
      const setSubCommand = modelCommand.subCommands!.find(cmd => cmd.name === 'set');
      expect(setSubCommand).toBeDefined();
      
      if (!setSubCommand?.action) {
        throw new Error('Set subcommand action not defined');
      }

      const result = await setSubCommand.action(context, 'llama3.1-8b');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining('Model changed successfully'),
      });
    });

    it('should reject invalid model', async () => {
      const setSubCommand = modelCommand.subCommands!.find(cmd => cmd.name === 'set');
      expect(setSubCommand).toBeDefined();
      
      if (!setSubCommand?.action) {
        throw new Error('Set subcommand action not defined');
      }

      const result = await setSubCommand.action(context, 'invalid-model');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: expect.stringContaining('Unknown model'),
      });
    });

    it('should require model name argument', async () => {
      const setSubCommand = modelCommand.subCommands!.find(cmd => cmd.name === 'set');
      expect(setSubCommand).toBeDefined();
      
      if (!setSubCommand?.action) {
        throw new Error('Set subcommand action not defined');
      }

      const result = await setSubCommand.action(context, '');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: expect.stringContaining('Please specify a model name'),
      });
    });
  });

  describe('default action', () => {
    it('should show current model when no subcommand is provided', async () => {
      if (!modelCommand.action) {
        throw new Error('Default action not defined');
      }

      const result = await modelCommand.action(context, '');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining('Current Model Configuration'),
      });
    });
  });
});