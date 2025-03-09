export class Node {
	#original
	#state
	#mapper
	#children

	constructor(data, mapper) {
		this.#original = data
		this.#state = {}
		this.#mapper = mapper

		// Initialize children if they exist
		if (this.#mapper.hasChildren(data)) {
			this.#children = this.#mapper.getChildren(data).map((child) => new Node(child, mapper))
		}

		// Create getters/setters for all properties except children
		Object.keys(data).forEach((key) => {
			if (key !== this.#mapper.fields.children) {
				Object.defineProperty(this, key, {
					get: () => this.#state[key] ?? this.#original[key],
					set: (value) => {
						this.#original[key] = value
						this.#state[key] = value
					},
					enumerable: true
				})
			}
		})
	}

	get children() {
		return this.#children ?? []
	}

	get original() {
		return this.#original
	}

	addChild(data) {
		if (!this.#mapper.hasChildren(this.#original)) {
			this.#original[this.#mapper.fields.children] = []
			this.#children = []
		}

		const newNode = new Node(data, this.#mapper)
		this.#original[this.#mapper.fields.children].push(data)
		this.#children.push(newNode)

		return newNode
	}

	removeChild(node) {
		const originalChildren = this.#original[this.#mapper.fields.children]
		const index = originalChildren.findIndex((child) => child === node.original)

		if (index !== -1) {
			originalChildren.splice(index, 1)
			this.#children.splice(index, 1)
			return true
		}
		return false
	}
}
