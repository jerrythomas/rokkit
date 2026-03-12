import { readFileSync, writeFileSync } from 'fs'

export function parseDimensions(svg) {
	const vbMatch = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)
	if (!vbMatch) throw new Error('No viewBox found in SVG')
	return { w: parseFloat(vbMatch[1]), h: parseFloat(vbMatch[2]) }
}

export function normalizeSVG(svgContent, targetH = 24, targetW = null) {
	const { w, h } = parseDimensions(svgContent)
	const scale = targetH / h
	const finalW = targetW ?? Math.round(w * scale)
	return svgContent
		.replace(/width="[^"]*"/, `width="${finalW}"`)
		.replace(/height="[^"]*"/, `height="${targetH}"`)
}

export function monochromeVariant(svgContent, color) {
	return svgContent
		.replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`)
		.replace(/stop-color="[^"]*"/g, `stop-color="${color}"`)
		.replace(/fill-opacity="[^"]*"/g, '')
}

export function processFile(inputPath, outputPath, opts = {}) {
	const { targetH = 24, targetW = null, color = null } = opts
	let svg = readFileSync(inputPath, 'utf8')
	svg = normalizeSVG(svg, targetH, targetW)
	if (color) svg = monochromeVariant(svg, color)
	writeFileSync(outputPath, svg, 'utf8')
	console.log(`Written: ${outputPath}`)
}
