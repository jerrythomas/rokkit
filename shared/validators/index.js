export {
	stdMock,
	stdMockRestore,
	consoleMock,
	consoleMockRestore,
	getCustomEventMock,
	createNestedElement
} from './mock'
export * from './array'
export * from './action'
export * from './dataset'
export * from './event'

export function getSubscribedData(store) {
	let result
	let unsubscribe = store.subscribe((data) => {
		result = data
	})
	unsubscribe()
	return result
}

export function getComponentProp(component, prop) {
	return component.$$.ctx[component.$$.props[prop]]
}
