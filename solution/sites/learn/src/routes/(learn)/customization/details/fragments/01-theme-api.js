/**
 * Example: Using the Theme API in Rokkit UI
 *
 * This demonstrates how to use the Theme class directly in your code
 * to generate a palette and semantic color shortcuts.
 */

import { Theme } from '@rokkit/themes'

// Define your palette mapping
const mapping = {
	primary: 'orange',
	surface: 'shark'
}

// Create a Theme instance
const theme = new Theme({ mapping })

// Get a palette (skin shortcut) for the mapping
const palette = theme.getPalette(mapping)

// Get semantic color shortcuts for a role
const surfaceShortcuts = theme.getShortcuts('surface')

// Get the full color rule set for UnoCSS theme config
const colorRules = theme.getColorRules(mapping)

// Example usage:
console.log('Palette:', palette)
console.log('surface Shortcuts:', surfaceShortcuts)
console.log('Color Rules:', colorRules)
