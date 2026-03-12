/**
 * Palette Utilities
 *
 * Functions for color manipulation, shade generation, and runtime palette application.
 */

// =============================================================================
// Types
// =============================================================================

export interface RGB {
	r: number
	g: number
	b: number
}

export interface HSL {
	h: number
	s: number
	l: number
}

export type ShadeKey = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950'

export type Shades = Record<ShadeKey, string>

export type ColorRole =
	| 'primary'
	| 'secondary'
	| 'accent'
	| 'surface'
	| 'success'
	| 'warning'
	| 'danger'
	| 'info'

/**
 * Mapping of color roles to Tailwind color names or hex values
 */
export type ColorMapping = Partial<Record<ColorRole, string>>

// =============================================================================
// Color Conversion Utilities
// =============================================================================

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	if (!result) {
		throw new Error(`Invalid hex color: ${hex}`)
	}
	return {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	}
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(rgb: RGB): string {
	const toHex = (n: number) => {
		const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
		return hex.length === 1 ? `0${  hex}` : hex
	}
	return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
	const r = rgb.r / 255
	const g = rgb.g / 255
	const b = rgb.b / 255

	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	const l = (max + min) / 2

	if (max === min) {
		return { h: 0, s: 0, l: l * 100 }
	}

	const d = max - min
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

	let h = 0
	switch (max) {
		case r:
			h = ((g - b) / d + (g < b ? 6 : 0)) / 6
			break
		case g:
			h = ((b - r) / d + 2) / 6
			break
		case b:
			h = ((r - g) / d + 4) / 6
			break
	}

	return { h: h * 360, s: s * 100, l: l * 100 }
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
	const h = hsl.h / 360
	const s = hsl.s / 100
	const l = hsl.l / 100

	if (s === 0) {
		const val = Math.round(l * 255)
		return { r: val, g: val, b: val }
	}

	const hue2rgb = (p: number, q: number, t: number) => {
		if (t < 0) t += 1
		if (t > 1) t -= 1
		if (t < 1 / 6) return p + (q - p) * 6 * t
		if (t < 1 / 2) return q
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
		return p
	}

	const q = l < 0.5 ? l * (1 + s) : l + s - l * s
	const p = 2 * l - q

	return {
		r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
		g: Math.round(hue2rgb(p, q, h) * 255),
		b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
	}
}

/**
 * Convert hex to HSL
 */
export function hexToHsl(hex: string): HSL {
	return rgbToHsl(hexToRgb(hex))
}

/**
 * Convert HSL to hex
 */
export function hslToHex(hsl: HSL): string {
	return rgbToHex(hslToRgb(hsl))
}

// =============================================================================
// Shade Generation
// =============================================================================

/**
 * Generate Tailwind-like shades from a base hex color
 * The input color is used as the 500 shade
 */
export function generateShades(hex: string): Shades {
	const hsl = hexToHsl(hex)

	// Shade configuration: [saturation multiplier, target lightness]
	// Lighter shades have higher lightness, lower saturation
	// Darker shades have lower lightness, slightly higher saturation
	const shadeConfig: Record<ShadeKey, [number, number]> = {
		'50': [0.9, 97],
		'100': [0.92, 94],
		'200': [0.94, 86],
		'300': [0.96, 75],
		'400': [0.98, 60],
		'500': [1.0, hsl.l], // Keep original lightness
		'600': [1.02, Math.max(hsl.l * 0.82, 25)],
		'700': [1.04, Math.max(hsl.l * 0.65, 20)],
		'800': [1.06, Math.max(hsl.l * 0.50, 15)],
		'900': [1.08, Math.max(hsl.l * 0.35, 12)],
		'950': [1.12, Math.max(hsl.l * 0.22, 8)]
	}

	const shades: Partial<Shades> = {}

	for (const [shade, [satMult, lightness]] of Object.entries(shadeConfig)) {
		const newHsl: HSL = {
			h: hsl.h,
			s: Math.min(100, hsl.s * satMult),
			l: lightness
		}
		shades[shade as ShadeKey] = hslToHex(newHsl)
	}

	return shades as Shades
}

/**
 * Check if a string is a valid hex color
 */
export function isHexColor(value: string): boolean {
	return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)
}

// =============================================================================
// Tailwind Colors (Built-in Presets)
// =============================================================================

export const tailwindColors: Record<string, Shades> = {
	slate: {
		'50': '#f8fafc',
		'100': '#f1f5f9',
		'200': '#e2e8f0',
		'300': '#cbd5e1',
		'400': '#94a3b8',
		'500': '#64748b',
		'600': '#475569',
		'700': '#334155',
		'800': '#1e293b',
		'900': '#0f172a',
		'950': '#020617'
	},
	gray: {
		'50': '#f9fafb',
		'100': '#f3f4f6',
		'200': '#e5e7eb',
		'300': '#d1d5db',
		'400': '#9ca3af',
		'500': '#6b7280',
		'600': '#4b5563',
		'700': '#374151',
		'800': '#1f2937',
		'900': '#111827',
		'950': '#030712'
	},
	zinc: {
		'50': '#fafafa',
		'100': '#f4f4f5',
		'200': '#e4e4e7',
		'300': '#d4d4d8',
		'400': '#a1a1aa',
		'500': '#71717a',
		'600': '#52525b',
		'700': '#3f3f46',
		'800': '#27272a',
		'900': '#18181b',
		'950': '#09090b'
	},
	neutral: {
		'50': '#fafafa',
		'100': '#f5f5f5',
		'200': '#e5e5e5',
		'300': '#d4d4d4',
		'400': '#a3a3a3',
		'500': '#737373',
		'600': '#525252',
		'700': '#404040',
		'800': '#262626',
		'900': '#171717',
		'950': '#0a0a0a'
	},
	stone: {
		'50': '#fafaf9',
		'100': '#f5f5f4',
		'200': '#e7e5e4',
		'300': '#d6d3d1',
		'400': '#a8a29e',
		'500': '#78716c',
		'600': '#57534e',
		'700': '#44403c',
		'800': '#292524',
		'900': '#1c1917',
		'950': '#0c0a09'
	},
	red: {
		'50': '#fef2f2',
		'100': '#fee2e2',
		'200': '#fecaca',
		'300': '#fca5a5',
		'400': '#f87171',
		'500': '#ef4444',
		'600': '#dc2626',
		'700': '#b91c1c',
		'800': '#991b1b',
		'900': '#7f1d1d',
		'950': '#450a0a'
	},
	orange: {
		'50': '#fff7ed',
		'100': '#ffedd5',
		'200': '#fed7aa',
		'300': '#fdba74',
		'400': '#fb923c',
		'500': '#f97316',
		'600': '#ea580c',
		'700': '#c2410c',
		'800': '#9a3412',
		'900': '#7c2d12',
		'950': '#431407'
	},
	amber: {
		'50': '#fffbeb',
		'100': '#fef3c7',
		'200': '#fde68a',
		'300': '#fcd34d',
		'400': '#fbbf24',
		'500': '#f59e0b',
		'600': '#d97706',
		'700': '#b45309',
		'800': '#92400e',
		'900': '#78350f',
		'950': '#451a03'
	},
	yellow: {
		'50': '#fefce8',
		'100': '#fef9c3',
		'200': '#fef08a',
		'300': '#fde047',
		'400': '#facc15',
		'500': '#eab308',
		'600': '#ca8a04',
		'700': '#a16207',
		'800': '#854d0e',
		'900': '#713f12',
		'950': '#422006'
	},
	lime: {
		'50': '#f7fee7',
		'100': '#ecfccb',
		'200': '#d9f99d',
		'300': '#bef264',
		'400': '#a3e635',
		'500': '#84cc16',
		'600': '#65a30d',
		'700': '#4d7c0f',
		'800': '#3f6212',
		'900': '#365314',
		'950': '#1a2e05'
	},
	green: {
		'50': '#f0fdf4',
		'100': '#dcfce7',
		'200': '#bbf7d0',
		'300': '#86efac',
		'400': '#4ade80',
		'500': '#22c55e',
		'600': '#16a34a',
		'700': '#15803d',
		'800': '#166534',
		'900': '#14532d',
		'950': '#052e16'
	},
	emerald: {
		'50': '#ecfdf5',
		'100': '#d1fae5',
		'200': '#a7f3d0',
		'300': '#6ee7b7',
		'400': '#34d399',
		'500': '#10b981',
		'600': '#059669',
		'700': '#047857',
		'800': '#065f46',
		'900': '#064e3b',
		'950': '#022c22'
	},
	teal: {
		'50': '#f0fdfa',
		'100': '#ccfbf1',
		'200': '#99f6e4',
		'300': '#5eead4',
		'400': '#2dd4bf',
		'500': '#14b8a6',
		'600': '#0d9488',
		'700': '#0f766e',
		'800': '#115e59',
		'900': '#134e4a',
		'950': '#042f2e'
	},
	cyan: {
		'50': '#ecfeff',
		'100': '#cffafe',
		'200': '#a5f3fc',
		'300': '#67e8f9',
		'400': '#22d3ee',
		'500': '#06b6d4',
		'600': '#0891b2',
		'700': '#0e7490',
		'800': '#155e75',
		'900': '#164e63',
		'950': '#083344'
	},
	sky: {
		'50': '#f0f9ff',
		'100': '#e0f2fe',
		'200': '#bae6fd',
		'300': '#7dd3fc',
		'400': '#38bdf8',
		'500': '#0ea5e9',
		'600': '#0284c7',
		'700': '#0369a1',
		'800': '#075985',
		'900': '#0c4a6e',
		'950': '#082f49'
	},
	blue: {
		'50': '#eff6ff',
		'100': '#dbeafe',
		'200': '#bfdbfe',
		'300': '#93c5fd',
		'400': '#60a5fa',
		'500': '#3b82f6',
		'600': '#2563eb',
		'700': '#1d4ed8',
		'800': '#1e40af',
		'900': '#1e3a8a',
		'950': '#172554'
	},
	indigo: {
		'50': '#eef2ff',
		'100': '#e0e7ff',
		'200': '#c7d2fe',
		'300': '#a5b4fc',
		'400': '#818cf8',
		'500': '#6366f1',
		'600': '#4f46e5',
		'700': '#4338ca',
		'800': '#3730a3',
		'900': '#312e81',
		'950': '#1e1b4b'
	},
	violet: {
		'50': '#f5f3ff',
		'100': '#ede9fe',
		'200': '#ddd6fe',
		'300': '#c4b5fd',
		'400': '#a78bfa',
		'500': '#8b5cf6',
		'600': '#7c3aed',
		'700': '#6d28d9',
		'800': '#5b21b6',
		'900': '#4c1d95',
		'950': '#2e1065'
	},
	purple: {
		'50': '#faf5ff',
		'100': '#f3e8ff',
		'200': '#e9d5ff',
		'300': '#d8b4fe',
		'400': '#c084fc',
		'500': '#a855f7',
		'600': '#9333ea',
		'700': '#7e22ce',
		'800': '#6b21a8',
		'900': '#581c87',
		'950': '#3b0764'
	},
	fuchsia: {
		'50': '#fdf4ff',
		'100': '#fae8ff',
		'200': '#f5d0fe',
		'300': '#f0abfc',
		'400': '#e879f9',
		'500': '#d946ef',
		'600': '#c026d3',
		'700': '#a21caf',
		'800': '#86198f',
		'900': '#701a75',
		'950': '#4a044e'
	},
	pink: {
		'50': '#fdf2f8',
		'100': '#fce7f3',
		'200': '#fbcfe8',
		'300': '#f9a8d4',
		'400': '#f472b6',
		'500': '#ec4899',
		'600': '#db2777',
		'700': '#be185d',
		'800': '#9d174d',
		'900': '#831843',
		'950': '#500724'
	},
	rose: {
		'50': '#fff1f2',
		'100': '#ffe4e6',
		'200': '#fecdd3',
		'300': '#fda4af',
		'400': '#fb7185',
		'500': '#f43f5e',
		'600': '#e11d48',
		'700': '#be123c',
		'800': '#9f1239',
		'900': '#881337',
		'950': '#4c0519'
	}
}

/**
 * Get shades for a color (either Tailwind preset or custom hex)
 */
export function getShades(color: string): Shades {
	if (isHexColor(color)) {
		return generateShades(color)
	}
	const preset = tailwindColors[color.toLowerCase()]
	if (preset) {
		return preset
	}
	throw new Error(`Unknown color: ${color}. Must be a hex color or Tailwind color name.`)
}

// =============================================================================
// Runtime Palette Application
// =============================================================================

/**
 * Apply a color palette to the document root
 * Sets CSS variables for each color role and shade
 */
export function applyPalette(
	mapping: Partial<Record<ColorRole, string>>,
	element: HTMLElement = document.documentElement
): void {
	for (const [role, color] of Object.entries(mapping)) {
		if (!color) continue

		const shades = getShades(color)

		for (const [shade, hex] of Object.entries(shades)) {
			const rgb = hexToRgb(hex)
			// Store as RGB values (comma-separated) for rgba() compatibility
			element.style.setProperty(`--color-${role}-${shade}`, `${rgb.r},${rgb.g},${rgb.b}`)
		}

		// Also set the default (500) as the base color variable
		const baseRgb = hexToRgb(shades['500'])
		element.style.setProperty(`--color-${role}`, `${baseRgb.r},${baseRgb.g},${baseRgb.b}`)
	}
}

/**
 * Remove custom palette CSS variables (reset to theme defaults)
 */
export function resetPalette(
	roles: ColorRole[] = ['primary', 'secondary', 'accent', 'surface', 'success', 'warning', 'danger', 'info'],
	element: HTMLElement = document.documentElement
): void {
	const shadeKeys: ShadeKey[] = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

	for (const role of roles) {
		element.style.removeProperty(`--color-${role}`)
		for (const shade of shadeKeys) {
			element.style.removeProperty(`--color-${role}-${shade}`)
		}
	}
}

/**
 * Save palette to localStorage
 */
export function savePalette(key: string, mapping: Partial<Record<ColorRole, string>>): void {
	localStorage.setItem(key, JSON.stringify(mapping))
}

/**
 * Load palette from localStorage
 */
export function loadPalette(key: string): Partial<Record<ColorRole, string>> | null {
	const stored = localStorage.getItem(key)
	if (stored) {
		try {
			return JSON.parse(stored)
		} catch {
			return null
		}
	}
	return null
}

/**
 * Get list of available Tailwind color names
 */
export function getTailwindColorNames(): string[] {
	return Object.keys(tailwindColors)
}
