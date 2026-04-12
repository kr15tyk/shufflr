import type { Track } from '@shufflr/types';

// ──────────────────────────────────────────────────────────────────────────────
// String utilities
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Truncates a string to the given maximum length and appends an ellipsis when
 * the original string exceeds that length.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  if (maxLength <= 3) return str.slice(0, maxLength);
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Converts a string to kebab-case.
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

// ──────────────────────────────────────────────────────────────────────────────
// Number / time utilities
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Formats a duration given in milliseconds into a human-readable string
 * (e.g. "3:45").
 */
export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Clamps a numeric value between a minimum and maximum.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ──────────────────────────────────────────────────────────────────────────────
// Array utilities
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Returns a new array with the items shuffled using the Fisher-Yates algorithm.
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]] as [T, T];
  }
  return result;
}

/**
 * Shuffles an array of tracks – convenience wrapper over `shuffle`.
 */
export function shuffleTracks(tracks: Track[]): Track[] {
  return shuffle(tracks);
}

// ──────────────────────────────────────────────────────────────────────────────
// Validation utilities
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Returns `true` when the provided string is a valid e-mail address.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Returns `true` when the value is neither `null` nor `undefined`.
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
