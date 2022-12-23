export function generateMenu(groups) {
	return Object.keys(groups).map((group) => ({
		text: group,
		data: getItems(group, groups[group])
	}))
}

function getItems(group, components) {
	const result = Object.entries(components)
		.map(([component, data]) => {
			if ('types' in data) {
				return Object.keys(data.types).map((key) => ({
					text: `<${component} type="${key}" />`,
					url: `/${group}/${component}/${key}`,
					icon: `i-spice:${component.toLowerCase()}-${key}`
				}))
			} else {
				return {
					text: `<${component} />`,
					url: `/${group}/${component}`,
					icon: `i-spice:${component.toLowerCase()}`
				}
			}
		})
		.flat()

	return result
}
