import {
	importDirectory,
	cleanupSVG,
	runSVGO,
	parseColors,
	isEmptyColor,
	exportJSONPackage
} from '@iconify/tools'
import fs from 'fs'

export async function convert(folder, prefix, color = false) {
	// Import icons
	const iconSet = await importDirectory(folder, { prefix })

	// Validate, clean up, fix palette and optimise
	await processIcons(iconSet, color)

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

async function processIcons(iconSet, color) {
	await iconSet.forEach(async (name, type) => {
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
			await cleanAndOptimizeIcon(svg, color)
		} catch (err) {
			// Invalid icon
			console.error(`Error parsing ${name}:`, err)
			iconSet.remove(name)
			return
		}

		// Update icon
		iconSet.fromSVG(name, svg)
	})
}

async function cleanAndOptimizeIcon(svg, color) {
	// Clean up icon code
	cleanupSVG(svg)

	if (!color) {
		await parseColors(svg, {
			defaultColor: 'currentColor',
			callback: (attr, colorStr, color) => {
				return !color || isEmptyColor(color) ? colorStr : 'currentColor'
			}
		})
	}

	// Optimise
	runSVGO(svg)
}
