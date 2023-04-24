export function generateMenu(groups) {
	return Object.keys(groups).map((group) => ({
		text: group,
		data: getItems(group, groups[group]),
		isOpen: true
	}))
}

function getItems(group, components) {
	const result = Object.entries(components)
		.map(([component, data]) => {
			if ('types' in data) {
				return Object.keys(data.types).map((key) => ({
					text: `<${component} type="${key}" />`,
					url: `/${group}/${component}/${key}`,
					icon: `i-rokkit:${component.toLowerCase()}-${key}`
				}))
			} else {
				return {
					text: `<${component} />`,
					url: `/${group}/${component}`,
					icon: `i-rokkit:${component.toLowerCase()}`
				}
			}
		})
		.flat()

	return result
}
