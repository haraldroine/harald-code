/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SlashCommand,
  SlashCommandActionReturn,
  CommandKind,
} from './types.js';

const COLOR_GREEN = '\u001b[32m';
const COLOR_YELLOW = '\u001b[33m';
const COLOR_CYAN = '\u001b[36m';
const COLOR_GREY = '\u001b[90m';
const RESET_COLOR = '\u001b[0m';

/**
 * Show sponsor application information
 */
const showSponsorApplication = async (): Promise<SlashCommandActionReturn> => {
  return {
    type: 'message',
    messageType: 'info',
    content:
      `${COLOR_GREEN}Apply for Sponsor Placement${RESET_COLOR}\n\n` +
      `${COLOR_CYAN}Interested in sponsoring the CLI?${RESET_COLOR}\n\n` +
      'Benefits of sponsoring:\n' +
      '• Your brand displayed in the CLI footer\n' +
      '• Support open-source development\n' +
      '• Reach developers using this tool\n' +
      '• Customizable placement and branding\n\n' +
      `${COLOR_YELLOW}Contact us at:${RESET_COLOR}\n` +
      'Email: harald@buroventures.com\n' +
      'Subject: Harald Code Sponsor Application\n\n' +
      `${COLOR_GREY}Please include your company name, website, and sponsorship goals.${RESET_COLOR}`,
  };
};

export const sponsorCommand: SlashCommand = {
  name: 'sponsor',
  altNames: ['sponsors'],
  description: 'Show sponsor application information',
  kind: CommandKind.BUILT_IN,
  action: showSponsorApplication,
  subCommands: [
    {
      name: 'apply',
      description: 'Show sponsor application information',
      kind: CommandKind.BUILT_IN,
      action: showSponsorApplication,
    },
  ],
};