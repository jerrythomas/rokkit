import {
	importDirectory,
	cleanupSVG,
	runSVGO,
	parseColors,
	isEmptyColor,
	exportJSONPackage
} from '@iconify/tools'
import fs from 'fs'
import { pick } from 'ramda'
import pkg from '../package.json' with { type: 'json' }

const PACKAGE_INFO = {
	namespace: '@rokkit',
	version: pkg.version,
	homepage: 'https://github.com/jerrythomas/rokkit'
}
/**
 * Clean up and optimise SVG icon
 *
 * @param {string} svg SVG code
 * @param {boolean} color True if color should be preserved
 */
export function cleanAndOptimizeIcon(svg, color) {
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

/**
 * Process icons
 *
 * @param {IconifyTools} iconSet Icon set
 * @param {boolean} color True if color should be preserved
 */
export function processIcons(iconSet, color) {
	iconSet.forEach((name) => {
		const svg = iconSet.toSVG(name)

		try {
			cleanAndOptimizeIcon(svg, color)
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(`Error parsing ${name}: ${err.reason}`)
			iconSet.remove(name)
			return
		}

		iconSet.fromSVG(name, svg)
	})
}

/**
 * Convert individual icons into a json bundle
 *
 * @param {string} folder Folder with icons
 * @param {string} prefix Prefix for icon set
 * @param {boolean} color True if color should be preserved
 */
export async function bundle(folder, prefix, color = false, location = '.') {
	const iconSet = await importDirectory(folder, { prefix })

	// Validate, clean up, fix palette and optimise
	processIcons(iconSet, color)

	// Export
	const collection = JSON.stringify(iconSet.export(), null, 2)
	fs.writeFileSync(`${location}/${prefix}.json`, collection, 'utf8')
	return iconSet
}
/**
 * Convert icons
 *
 * @param {string} folder Folder with icons
 * @param {string} prefix Prefix for icon set
 * @param {boolean} color True if color should be preserved
 */
export async function convert(folder, prefix, color = false) {
	// Import icons
	// const iconSet = await importDirectory(folder, { prefix })

	// // Validate, clean up, fix palette and optimise
	// processIcons(iconSet, color)

	// // Export
	// const collection = JSON.stringify(iconSet.export(), null, 2)
	// fs.writeFileSync(`./lib/${prefix}.json`, collection, 'utf8')
	const iconSet = await bundle(folder, prefix, color, './lib')
	const target = `./lib/${iconSet.prefix}`
	await exportJSONPackage(iconSet, {
		target,
		package: {
			name: `${PACKAGE_INFO.namespace}/${iconSet.prefix}`,
			...pick(['version', 'homepage'], PACKAGE_INFO)
		},
		cleanup: true
	})
}
