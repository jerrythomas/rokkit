import {
	importDirectory,
	cleanupSVG,
	runSVGO,
	parseColors,
	isEmptyColor
} from '@iconify/tools'
import fs from 'fs'

export async function convert(folder, prefix, color = false) {
	// Import icons
	const iconSet = await importDirectory(folder, {
		prefix
	})

	// Validate, clean up, fix palette and optimise
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
			// Clean up icon code
			await cleanupSVG(svg)

			if (!color) {
				await parseColors(svg, {
					defaultColor: 'currentColor',
					callback: (attr, colorStr, color) => {
						return !color || isEmptyColor(color) ? colorStr : 'currentColor'
					}
				})
			}

			// Optimise
			await runSVGO(svg)
		} catch (err) {
			// Invalid icon
			console.error(`Error parsing ${name}:`, err)
			iconSet.remove(name)
			return
		}

		// Update icon
		iconSet.fromSVG(name, svg)
	})

	// Export
	const collection = JSON.stringify(iconSet.export(), null, 2)
	fs.writeFileSync(`./lib/${prefix}.json`, collection, 'utf8')
}
