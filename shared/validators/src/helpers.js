export function getPropertyValue(component, property) {
	// console.log(component, property)
	return component.$$.ctx[component.$$.props[property]]
}

export function setProperties(component, value) {
	// This is a workaround to force an update on the component
	// component.$set(value)
	// intentionally left blank
}
