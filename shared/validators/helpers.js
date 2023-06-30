export function getPropertyValue(component, property) {
	return component.$$.ctx[component.$$.props[property]]
}
