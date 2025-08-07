/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import semver from 'semver';
import { getPackageJson } from '../../utils/package.js';

export const FETCH_TIMEOUT_MS = 5000;

export interface GitUpdateObject {
  message: string;
  update: {
    current: string;
    latest: string;
    type: string;
  };
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
}

/**
 * Check for updates by comparing current version with latest GitHub release
 */
export async function checkForGitUpdates(): Promise<GitUpdateObject | null> {
  try {
    // Skip update check when running from source (development mode)
    if (process.env.DEV === 'true') {
      return null;
    }

    const packageJson = await getPackageJson();
    if (!packageJson || !packageJson.version) {
      return null;
    }

    const currentVersion = packageJson.version;
    const repository = packageJson.repository;
    
    if (!repository) {
      return null;
    }
    
    const repoUrl = typeof repository === 'string' ? repository : repository.url;
    
    if (!repoUrl) {
      return null;
    }

    // Extract owner/repo from git URL
    const repoMatch = repoUrl.match(/github\.com[\/:]([^\/]+)\/([^\/\.]+)/);
    if (!repoMatch) {
      return null;
    }

    const [, owner, repo] = repoMatch;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases`;

    // Fetch releases with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Harald-Code-CLI'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const releases: GitHubRelease[] = await response.json();
      
      // Filter out drafts and find the latest release
      const validReleases = releases.filter(release => !release.draft);
      
      if (validReleases.length === 0) {
        return null;
      }

      // Determine if current version is a nightly/pre-release
      const isCurrentNightly = currentVersion.includes('nightly') || currentVersion.includes('alpha') || currentVersion.includes('beta');
      
      let latestRelease: GitHubRelease;
      
      if (isCurrentNightly) {
        // For nightly versions, consider all releases including pre-releases
        latestRelease = validReleases[0];
      } else {
        // For stable versions, only consider stable releases
        const stableReleases = validReleases.filter(release => !release.prerelease);
        if (stableReleases.length === 0) {
          return null;
        }
        latestRelease = stableReleases[0];
      }

      const latestVersion = latestRelease.tag_name.replace(/^v/, ''); // Remove 'v' prefix if present

      // Compare versions using semver
      if (semver.valid(currentVersion) && semver.valid(latestVersion) && semver.gt(latestVersion, currentVersion)) {
        const releaseType = latestRelease.prerelease ? 'pre-release' : 'stable';
        const message = `Harald Code update available! ${currentVersion} → ${latestVersion} (${releaseType})`;
        
        return {
          message,
          update: {
            current: currentVersion,
            latest: latestVersion,
            type: releaseType
          }
        };
      }

      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    // Silently fail for network issues, but log in debug mode
    if (process.env.DEBUG) {
      console.warn('Failed to check for Git updates:', error);
    }
    return null;
  }
}

/**
 * Get update instructions based on how the CLI was installed
 */
export function getGitUpdateInstructions(): string {
  const cliPath = process.argv[1];
  
  if (!cliPath) {
    return 'Please check the project repository for update instructions.';
  }

  try {
    const realPath = require('fs').realpathSync(cliPath).replace(/\\/g, '/');
    
    // Check if running from a git clone
    if (realPath.includes('.git') || realPath.includes('/src/')) {
      return 'Run "git pull" to update to the latest version.';
    }
    
    // Check if installed globally via npm
    if (realPath.includes('/node_modules/') && realPath.includes('/bin/')) {
      return 'Run "npm update -g @harald-code/harald-code" to update.';
    }
    
    // Default instructions
    return 'Visit https://github.com/haraldroine/harald-code for update instructions.';
  } catch (error) {
    return 'Please check the project repository for update instructions.';
  }
}