/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, Text } from 'ink';
import { Colors } from '../colors.js';

export const SponsorSection: React.FC = () => {
  return (
    <Box justifyContent="center" marginTop={1}>
      <Text color={Colors.Gray}>
        💎 Sponsor this CLI:{' '}
      </Text>
      <Text color={Colors.AccentBlue}>
        /sponsor apply
      </Text>
      <Text color={Colors.Gray}>
        {' '}for details
      </Text>
    </Box>
  );
};