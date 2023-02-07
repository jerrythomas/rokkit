export {
	stdMock,
	stdMockRestore,
	consoleMock,
	consoleMockRestore
} from './mock'
export * from './array'
export * from './action'
export * from './dataset'

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
