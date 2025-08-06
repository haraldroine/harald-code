/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { getErrorMessage } from '../utils/errors.js';

export interface ApiKeyRotationSettings {
  /** List of API keys to rotate between */
  apiKeys?: string[];
  /** Current active key index */
  currentKeyIndex?: number;
  /** Whether to enable automatic rotation on rate limits */
  autoRotateOnRateLimit?: boolean;
  /** Reset rotation daily (to handle daily limits) */
  resetRotationDaily?: boolean;
  /** Track usage per key per day */
  dailyUsageTracking?: Record<string, { date: string; requests: number }>;
}

export interface ApiKeyRotationConfig {
  settings: ApiKeyRotationSettings;
  onSettingsUpdate?: (settings: ApiKeyRotationSettings) => Promise<void>;
}

export class ApiKeyRotationManager {
  private settings: ApiKeyRotationSettings;
  private onSettingsUpdate?: (settings: ApiKeyRotationSettings) => Promise<void>;
  private fallbackApiKey?: string;

  constructor(config: ApiKeyRotationConfig, fallbackApiKey?: string) {
    this.settings = {
      apiKeys: [],
      currentKeyIndex: 0,
      autoRotateOnRateLimit: true,
      resetRotationDaily: true,
      dailyUsageTracking: {},
      ...config.settings,
    };
    this.onSettingsUpdate = config.onSettingsUpdate;
    this.fallbackApiKey = fallbackApiKey;

    // Reset daily tracking if needed
    this.resetDailyTrackingIfNeeded();
  }

  /**
   * Get the current active API key
   */
  getCurrentApiKey(): string | undefined {
    const keys = this.getAvailableKeys();
    if (keys.length === 0) {
      return this.fallbackApiKey;
    }

    const currentIndex = this.settings.currentKeyIndex || 0;
    if (currentIndex >= keys.length) {
      // Reset to first key if index is out of bounds
      this.settings.currentKeyIndex = 0;
      this.saveSettings();
      return keys[0];
    }

    return keys[currentIndex];
  }

  /**
   * Get all available API keys (from settings + fallback)
   */
  getAvailableKeys(): string[] {
    const keys = this.settings.apiKeys || [];
    
    // Always include the fallback key (from environment) as the first key if it exists
    if (this.fallbackApiKey && !keys.includes(this.fallbackApiKey)) {
      return [this.fallbackApiKey, ...keys];
    }
    return keys;
  }

  /**
   * Rotate to the next available API key
   */
  async rotateToNextKey(): Promise<string | undefined> {
    const keys = this.getAvailableKeys();
    if (keys.length <= 1) {
      console.warn('Cannot rotate: only one API key available');
      return this.getCurrentApiKey();
    }

    const currentIndex = this.settings.currentKeyIndex || 0;
    const nextIndex = (currentIndex + 1) % keys.length;
    
    this.settings.currentKeyIndex = nextIndex;
    await this.saveSettings();

    const newKey = keys[nextIndex];
    console.log(`Rotated to API key ${nextIndex + 1} of ${keys.length}`);
    return newKey;
  }

  /**
   * Handle rate limit error and potentially rotate keys
   */
  async handleRateLimit(error: unknown): Promise<string | undefined> {
    if (!this.settings.autoRotateOnRateLimit) {
      return this.getCurrentApiKey();
    }

    console.log('Rate limit detected, attempting to rotate API key...');
    
    // Track the failed request for current key
    await this.trackUsage(this.getCurrentApiKey() || '', true);
    
    // Rotate to next key
    return await this.rotateToNextKey();
  }

  /**
   * Track API usage for a key
   */
  async trackUsage(apiKey: string, isRateLimit: boolean = false): Promise<void> {
    if (!this.settings.dailyUsageTracking) {
      this.settings.dailyUsageTracking = {};
    }

    const today = new Date().toISOString().split('T')[0];
    const keyHash = this.hashApiKey(apiKey);
    
    if (!this.settings.dailyUsageTracking[keyHash] || 
        this.settings.dailyUsageTracking[keyHash].date !== today) {
      this.settings.dailyUsageTracking[keyHash] = {
        date: today,
        requests: 0
      };
    }

    this.settings.dailyUsageTracking[keyHash].requests += 1;
    
    if (isRateLimit) {
      console.log(`Rate limit hit for key ending in ...${apiKey.slice(-4)} (${this.settings.dailyUsageTracking[keyHash].requests} requests today)`);
    }

    await this.saveSettings();
  }

  /**
   * Add a new API key to the rotation
   */
  async addApiKey(apiKey: string): Promise<void> {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key provided');
    }

    if (!this.settings.apiKeys) {
      this.settings.apiKeys = [];
    }

    if (this.settings.apiKeys.includes(apiKey)) {
      console.log('API key already exists in rotation');
      return;
    }

    this.settings.apiKeys.push(apiKey);
    await this.saveSettings();
    console.log(`Added new API key to rotation (total: ${this.settings.apiKeys.length})`);
  }

  /**
   * Remove an API key from rotation
   */
  async removeApiKey(apiKey: string): Promise<void> {
    if (!this.settings.apiKeys) {
      return;
    }

    const index = this.settings.apiKeys.indexOf(apiKey);
    if (index === -1) {
      console.log('API key not found in rotation');
      return;
    }

    this.settings.apiKeys.splice(index, 1);
    
    // Adjust current index if needed
    if (this.settings.currentKeyIndex && this.settings.currentKeyIndex >= index) {
      this.settings.currentKeyIndex = Math.max(0, this.settings.currentKeyIndex - 1);
    }

    await this.saveSettings();
    console.log(`Removed API key from rotation (remaining: ${this.settings.apiKeys.length})`);
  }

  /**
   * Get rotation status information
   */
  getRotationStatus(): {
    totalKeys: number;
    currentKeyIndex: number;
    currentKeyPreview: string;
    autoRotateEnabled: boolean;
    dailyUsage: Record<string, { date: string; requests: number }>;
  } {
    const keys = this.getAvailableKeys();
    const currentKey = this.getCurrentApiKey() || '';
    
    return {
      totalKeys: keys.length,
      currentKeyIndex: this.settings.currentKeyIndex || 0,
      currentKeyPreview: currentKey ? `...${currentKey.slice(-4)}` : 'none',
      autoRotateEnabled: this.settings.autoRotateOnRateLimit || false,
      dailyUsage: this.settings.dailyUsageTracking || {}
    };
  }

  /**
   * Reset daily usage tracking if it's a new day
   */
  private resetDailyTrackingIfNeeded(): void {
    if (!this.settings.resetRotationDaily || !this.settings.dailyUsageTracking) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const hasOldData = Object.values(this.settings.dailyUsageTracking).some(
      usage => usage.date !== today
    );

    if (hasOldData) {
      console.log('Resetting daily usage tracking for new day');
      this.settings.dailyUsageTracking = {};
      this.settings.currentKeyIndex = 0; // Reset to first key each day
      this.saveSettings();
    }
  }

  /**
   * Create a hash of the API key for tracking (privacy-safe)
   */
  private hashApiKey(apiKey: string): string {
    // Simple hash for privacy - just use last 8 characters
    return apiKey.slice(-8);
  }

  /**
   * Save settings changes
   */
  private async saveSettings(): Promise<void> {
    if (this.onSettingsUpdate) {
      try {
        await this.onSettingsUpdate(this.settings);
      } catch (error) {
        console.error('Failed to save rotation settings:', getErrorMessage(error));
      }
    }
  }

  /**
   * Update rotation settings
   */
  async updateSettings(newSettings: Partial<ApiKeyRotationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }

  /**
   * Check if rate limiting error should trigger rotation
   */
  static isRateLimitError(error: unknown): boolean {
    if (!error) return false;

    const errorMessage = error instanceof Error 
      ? error.message.toLowerCase() 
      : String(error).toLowerCase();
    
    // Check for various rate limit indicators
    return (
      errorMessage.includes('rate limit') ||
      errorMessage.includes('quota exceeded') ||
      errorMessage.includes('too many requests') ||
      errorMessage.includes('429') ||
      // Cerebras specific messages
      errorMessage.includes('daily limit') ||
      errorMessage.includes('usage limit')
    );
  }

  /**
   * Validate API key format (basic validation)
   */
  static validateApiKey(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }

    // Basic validation - should be at least 20 characters and start with expected prefix
    return apiKey.length >= 20 && (
      apiKey.startsWith('csk-') ||  // Cerebras keys
      apiKey.startsWith('sk-') ||   // OpenAI keys
      apiKey.startsWith('api-')     // Generic API keys
    );
  }
}