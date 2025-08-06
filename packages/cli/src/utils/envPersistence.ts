/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Determines the appropriate shell profile file to use
 */
function getShellProfilePath(): string {
  const homeDir = os.homedir();
  const shell = process.env.SHELL || '/bin/bash';
  
  // Check for zsh first (most common on macOS)
  if (shell.includes('zsh') || fs.existsSync(path.join(homeDir, '.zshrc'))) {
    return path.join(homeDir, '.zshrc');
  }
  
  // Check for bash
  if (shell.includes('bash')) {
    const bashProfile = path.join(homeDir, '.bash_profile');
    const bashrc = path.join(homeDir, '.bashrc');
    
    // On macOS, .bash_profile is preferred
    if (process.platform === 'darwin' && fs.existsSync(bashProfile)) {
      return bashProfile;
    }
    
    // On Linux, .bashrc is preferred
    if (fs.existsSync(bashrc)) {
      return bashrc;
    }
    
    // Create .bash_profile if neither exists
    return bashProfile;
  }
  
  // Default to .zshrc (most common modern shell)
  return path.join(homeDir, '.zshrc');
}

/**
 * Adds or updates an environment variable in the shell profile
 */
export async function persistEnvironmentVariable(
  key: string,
  value: string,
  comment?: string
): Promise<void> {
  const profilePath = getShellProfilePath();
  const exportLine = `export ${key}="${value}"`;
  const commentLine = comment ? `# ${comment}` : '';
  
  try {
    let content = '';
    
    // Read existing content if file exists
    if (fs.existsSync(profilePath)) {
      content = fs.readFileSync(profilePath, 'utf-8');
    }
    
    // Check if the variable already exists
    const existingLineRegex = new RegExp(`^export\\s+${key}=.*$`, 'm');
    const existingMatch = content.match(existingLineRegex);
    
    if (existingMatch) {
      // Replace existing line
      content = content.replace(existingLineRegex, exportLine);
    } else {
      // Add new line
      const linesToAdd = [];
      if (commentLine) {
        linesToAdd.push(commentLine);
      }
      linesToAdd.push(exportLine);
      
      // Add a newline before if the file doesn't end with one
      const separator = content && !content.endsWith('\n') ? '\n' : '';
      content += separator + linesToAdd.join('\n') + '\n';
    }
    
    // Write the updated content
    fs.writeFileSync(profilePath, content, 'utf-8');
    
    console.log(`✅ Saved ${key} to ${profilePath}`);
  } catch (error) {
    console.error(`❌ Failed to save ${key} to shell profile:`, error);
    throw error;
  }
}

/**
 * Persists Cerebras API configuration to shell profile
 */
export async function persistCerebrasConfig(
  apiKey: string,
  baseUrl?: string,
  model?: string
): Promise<void> {
  await persistEnvironmentVariable(
    'CEREBRAS_API_KEY',
    apiKey,
    'Cerebras API Key for Harald Code CLI'
  );
  
  if (baseUrl) {
    await persistEnvironmentVariable(
      'OPENAI_BASE_URL',
      baseUrl,
      'Base URL for Cerebras API'
    );
  }
  
  if (model) {
    await persistEnvironmentVariable(
      'OPENAI_MODEL',
      model,
      'Default model for Cerebras'
    );
  }
}

/**
 * Gets the shell profile path for display to user
 */
export function getShellProfilePathForDisplay(): string {
  return getShellProfilePath();
}