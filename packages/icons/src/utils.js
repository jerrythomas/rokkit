export function toCapitalCase(text) {
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function toPascalCase(text) {
	return text
		.split('-')
		.map((part) => toCapitalCase(part))
		.join('')
}

export function toHyphenCase(text) {
	return text
		.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
		.replace(/^-/, '')
}

export function sortByParts(a, b) {
	const partsOfA = a.split('-')
	const partsOfB = b.split('-')

	let result =
		partsOfA[0] > partsOfB[0]
			? 1
			: partsOfA[0] < partsOfB[0]
			? -1
			: partsOfA.length - partsOfB.length
	return result != 0 ? result : a > b ? 1 : a < b ? -1 : 0
}
