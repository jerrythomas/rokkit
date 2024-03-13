/**
 * Converts a flat array of file metadata into a nested array of file metadata.
 *
 * @param {Array<import('../../rokkit/packages/tutorial/src/types.js').FileMetadata>} files - Flat Array of file metadata
 * @returns {Array<import('../../rokkit/packages/tutorial/src/types.js').FileMetadata>} - Nested Array of file metadata
 */
export function folderHierarchy(files) {
	const result = files.reduce((acc, file) => {
		const parts = file.path.split('/')
		let current = acc
		parts.forEach((part, index) => {
			let child = current.find((item) => item.name === part)
			if (!child && part !== '') {
				child = {
					name: part,
					path: parts.slice(0, index).join('/'),
					type: 'folder',
					children: []
				}
				current.push(child)
			}
			if (part !== '') current = child.children
		})
		current.push(file)
		return acc
	}, [])
	return result
}

/**
 * Get the sequence and key from a text string.
 * @param {string} text - The text to extract the sequence and key from.
 * @returns {Object|null} - An object containing the sequence and key or null if not found.
 */
export function getSequenceAndKey(text) {
	const result = /(?<number>\d+)(\s*-\s*)(?<key>.*)$/.exec(text)
	if (result?.groups) {
		return {
			sequence: parseInt(result.groups.number),
			key: result.groups.key
		}
	}
	return null
}
