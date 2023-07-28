export function getPropertyValue(component, property) {
	return component.$$.ctx[component.$$.props[property]]
}

// export function getComponentProp(component, prop) {
// 	return component.$$.ctx[component.$$.props[prop]]
// }
