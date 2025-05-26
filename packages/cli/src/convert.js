/* eslint-disable no-console */
import {
	importDirectory,
	cleanupSVG,
	runSVGO,
	parseColors,
	isEmptyColor,
	exportJSONPackage
} from '@iconify/tools'
import fs from 'fs'
import path from 'path'
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
 * @param {object} options Options for bundling
 * @param {string} options.prefix Prefix for icon set
 * @param {boolean} [options.color=false] True if color should be preserved
 * @param {string} [options.target='.'] Target directory for output
 * @returns {Promise<object>} The generated icon set
 */
export async function bundle(folder, options) {
	const { prefix, color = false, target = '.' } = options

	// Ensure the target directory exists
	const targetDir = path.resolve(target)
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true })
	}

	const iconSet = await importDirectory(folder, { prefix })

	// Validate, clean up, fix palette and optimise
	processIcons(iconSet, color)

	// Export
	const collection = JSON.stringify(iconSet.export(), null, 2)
	const outputPath = path.join(targetDir, `${prefix}.json`)
	fs.writeFileSync(outputPath, collection, 'utf8')

	console.info(`> Bundle created: ${outputPath}`)
	return iconSet
}

/**
 * Convert icons to an iconify package
 *
 * @param {string} folder Folder with icons
 * @param {object} options Options for conversion
 * @param {string} options.prefix Prefix for icon set
 * @param {boolean} [options.color=false] True if color should be preserved
 * @param {string} [options.target='.'] Target directory for output
 * @param {object} [options.package] Package information
 * @returns {Promise<object>} The generated icon set
 */
export async function convert(folder, options) {
	// First bundle the icons
	const iconSet = await bundle(folder, options)

	// Create the target directory if it doesn't exist
	const targetDir = path.resolve(options.target)
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true })
	}

	// Create package info with sensible defaults
	const packageInfo = {
		// Use prefix as package name if no namespace provided
		name: options.package?.namespace
			? `${options.package.namespace}/${options.prefix}`
			: options.prefix,
		// Default version is 1.0.0
		version: options.package?.version || '1.0.0',
		// Homepage is optional
		...(options.package?.homepage && { homepage: options.package.homepage })
	}

	// Export as iconify package
	const packageTarget = path.join(targetDir, iconSet.prefix)
	await exportJSONPackage(iconSet, {
		target: packageTarget,
		package: packageInfo,
		cleanup: true
	})

	console.info(`> Package created: ${packageTarget}`)
	return iconSet
}

/**
 * Read config file from path
 *
 * @param {string} configPath Path to config file
 * @returns {object} Parsed config object
 */
export function readConfigFile(configPath) {
	try {
		const configFilePath = path.resolve(configPath)
		if (fs.existsSync(configFilePath)) {
			const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'))
			return config
		}
		console.warn(`Config file not found: ${configFilePath}, using defaults`)
		return {}
	} catch (err) {
		console.error(`Error reading config file: ${err.message}`)
		return {}
	}
}

/**
 * Get folders from directory
 *
 * @param {string} dir Directory to scan for folders
 * @returns {string[]} List of folder names
 */
export function getFolderNames(dir) {
	try {
		const dirPath = path.resolve(dir)
		return fs
			.readdirSync(dirPath, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name)
	} catch (err) {
		console.error(`Error reading directory: ${err.message}`)
		return []
	}
}
