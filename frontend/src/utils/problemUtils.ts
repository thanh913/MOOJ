import React from 'react';
import { Problem } from '../types/problem';

/**
 * Determines the display color for a given difficulty level.
 * 
 * @param level The numerical difficulty score (1.0 - 9.0).
 * @returns A hex color code string.
 */
export const getDifficultyColor = (level: number): string => {
  if (level <= 1.5) return '#4caf50'; // Easy (Green)
  if (level <= 3.5) return '#2196f3'; // Intermediate (Blue)
  if (level <= 6.0) return '#ff9800'; // Advanced (Yellow)
  if (level <= 8.0) return '#f44336'; // Expert (Red)
  return '#b71c1c'; // Master (Deep Red)
};

/**
 * Gets the user-friendly label for a given difficulty level.
 * 
 * @param level The numerical difficulty score (1.0 - 9.0).
 * @returns The difficulty tier label (e.g., "Easy", "Intermediate").
 */
export const getDifficultyLabel = (level: number): string => {
  if (level <= 1.5) return 'Easy';
  if (level <= 3.5) return 'Intermediate';
  if (level <= 6.0) return 'Advanced';
  if (level <= 8.0) return 'Expert';
  if (level <= 9.0) return 'Master';
  return 'Unknown';
};

/**
 * Calculates a background color with reduced opacity based on difficulty.
 * Useful for chips or other elements where a subtle background is needed.
 * 
 * @param level The numerical difficulty score (1.0 - 9.0).
 * @returns A hex color code string with opacity (e.g., "#4caf5033").
 */
export const getDifficultyBackgroundColor = (level: number): string => {
  const color = getDifficultyColor(level);
  return `${color}33`; // Add 33 for 20% opacity in hex
};

// You can add other problem-related utility functions here in the future. 