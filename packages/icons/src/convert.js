import {
	importDirectory,
	cleanupSVG,
	runSVGO,
	parseColors,
	isEmptyColor,
	exportJSONPackage
} from '@iconify/tools'
import fs from 'fs'

/**
 * Convert icons
 *
 * @param {string} folder Folder with icons
 * @param {string} prefix Prefix for icon set
 * @param {boolean} color True if color should be preserved
 */
export async function convert(folder, prefix, color = false) {
	// Import icons
	const iconSet = await importDirectory(folder, { prefix })

	// Validate, clean up, fix palette and optimise
	processIcons(iconSet, color)

	// Export
	const collection = JSON.stringify(iconSet.export(), null, 2)
	fs.writeFileSync(`./lib/${prefix}.json`, collection, 'utf8')
	const target = `./lib/${iconSet.prefix}`
	await exportJSONPackage(iconSet, {
		target,
		package: {
			name: `@rokkit/${iconSet.prefix}`,
			version: '1.0.0',
			bugs: 'https://github.com/jerrythomas/rokkit/issues',
			homepage: 'https://github.com/jerrythomas/rokkit'
		},
		cleanup: true
	})
}

/**
 * Process icons
 *
 * @param {IconifyTools} iconSet Icon set
 * @param {boolean} color True if color should be preserved
 */
function processIcons(iconSet, color) {
	iconSet.forEach((name, type) => {
		if (type !== 'icon') {
			return
		}

		const svg = iconSet.toSVG(name)
		if (!svg) {
			// Invalid icon
			iconSet.remove(name)
			return
		}

		// Clean up and optimise icons
		try {
			cleanAndOptimizeIcon(svg, color)
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(`Error parsing ${name}:`, err)
			iconSet.remove(name)
			return
		}

		// Update icon
		iconSet.fromSVG(name, svg)
	})
}

/**
 * Clean up and optimise SVG icon
 *
 * @param {string} svg SVG code
 * @param {boolean} color True if color should be preserved
 */
function cleanAndOptimizeIcon(svg, color) {
	// Clean up icon code
	cleanupSVG(svg)

	if (!color) {
		parseColors(svg, {
			defaultColor: 'currentColor',
			callback: (_, colorStr, value) => {
				return !value || isEmptyColor(value) ? colorStr : 'currentColor'
			}
		})
	}

	// Optimise
	runSVGO(svg)
}
