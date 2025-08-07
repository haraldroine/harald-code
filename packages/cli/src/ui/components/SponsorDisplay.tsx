/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { Colors } from '../colors.js';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

interface SponsorData {
  Name: string;
  url: string;
}

interface CachedSponsorData {
  data: SponsorData;
  timestamp: number;
}

const SPONSOR_API_URL = 'https://n8n2.buroventures.com/webhook/9092e80b-f69c-4850-a83b-d38f01f1ae8a';
const CACHE_FILE = path.join(homedir(), '.qwen', 'sponsor-cache.json');
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export const SponsorSection: React.FC = () => {
  const [sponsor, setSponsor] = useState<SponsorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsor = async () => {
      try {
        // Check cache first
        if (fs.existsSync(CACHE_FILE)) {
          const cached = fs.readFileSync(CACHE_FILE, 'utf-8');
          const { data, timestamp }: CachedSponsorData = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setSponsor(data);
            setLoading(false);
            return;
          }
        }

        // Fetch from API
        const response = await fetch(SPONSOR_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Empty body for POST request
          body: JSON.stringify({}),
        });

        if (response.ok) {
          const data: SponsorData = await response.json();
          console.debug('Sponsor API response:', data);
          setSponsor(data);
          
          // Cache the response
          const cacheDir = path.dirname(CACHE_FILE);
          if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
          }
          
          const cacheData: CachedSponsorData = {
            data,
            timestamp: Date.now(),
          };
          fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData));
        } else {
          console.debug('Sponsor API failed with status:', response.status);
        }
      } catch (error) {
        // Silently fail - will show fallback message
        console.debug('Failed to fetch sponsor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsor();
  }, []);

  if (loading) {
    // Show fallback immediately instead of waiting
    return (
      <Box justifyContent="center" marginTop={1}>
        <Text color={Colors.Gray}>
          💎 Sponsor this CLI and show your name here:{' '}
        </Text>
        <Text color={Colors.AccentBlue}>
          /sponsor apply
        </Text>
      </Box>
    );
  }

  if (sponsor) {
    return (
      <Box justifyContent="space-between" marginTop={1} width="100%">
        <Box>
          <Text color={Colors.Gray}>
            💎 Sponsored by:{' '}
          </Text>
          <Text 
            color={Colors.AccentBlue}
            underline={true}
          >
            {sponsor.Name}
          </Text>
          <Text color={Colors.Gray}>
            {' '}({sponsor.url})
          </Text>
        </Box>
        <Box>
          <Text color={Colors.Gray}>
            Want to sponsor next?{' '}
          </Text>
          <Text color={Colors.AccentBlue}>
            /sponsor apply
          </Text>
        </Box>
      </Box>
    );
  }

  // Fallback message when no sponsor
  return (
    <Box justifyContent="center" marginTop={1}>
      <Text color={Colors.Gray}>
        💎 Sponsor this CLI and show your name here:{' '}
      </Text>
      <Text color={Colors.AccentBlue}>
        /sponsor apply
      </Text>
    </Box>
  );
};