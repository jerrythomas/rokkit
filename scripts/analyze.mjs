import madge from 'madge'

function processMadgeOutput(madgeOutput) {
	const result = []
	for (const [filePath, dependencies] of Object.entries(madgeOutput)) {
		const parts = filePath.split('/')
		const packageName = parts[0]
		const fileName = parts[parts.length - 1]
		const componentName = fileName.split('.')[0]
		const extension = fileName.split('.')[1]
		const hasTests = !!madgeOutput[`${filePath.split('.')[0]}.spec.js`]
		let type
		if (filePath.includes('/store/')) {
			type = 'store'
		} else if (filePath.includes('/actions/')) {
			type = 'action'
		} else if (extension === 'svelte') {
			type = 'UI Component'
		} else {
			type = 'utility function'
		}
		let level
		switch (type) {
			case 'store':
			case 'action':
				level = 'organism'
				break
			case 'UI Component':
				level = dependencies.length === 0 ? 'atom' : 'molecule'
				break
			default:
				level = 'atom'
		}
		const priority = hasTests ? 'low' : 'high'
		result.push({
			package: packageName,
			component: componentName,
			type,
			level,
			dependencies,
			hasTests,
			priority
		})
	}
	return result
}

madge('packages/')
	.then((res) => console.log(processMadgeOutput(res.obj())))
	.catch(console.error)
// const result = processMadgeOutput(madgeOutput);
// console.log(result);
