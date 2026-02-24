/**
 * ItemProxy - A class that wraps an item with field mapping
 *
 * Provides a clean API for accessing mapped fields from data items.
 * Based on the rokkit Proxy pattern from @rokkit/states.
 */

/**
 * Common fields configuration for data-driven components.
 * Supports menu, toolbar, list, and other list-like components.
 */
export interface ItemFields {
	/** Field for display text - default: 'text' */
	text?: string

	/** Field for the value to emit on select/click - default: 'value' */
	value?: string

	/** Field for icon class name - default: 'icon' */
	icon?: string

	/** Field for secondary descriptive text - default: 'description' */
	description?: string

	/** Field for keyboard shortcut display - default: 'shortcut' */
	shortcut?: string

	/** Field for aria-label override - default: 'label' */
	label?: string

	/** Field for disabled state - default: 'disabled' */
	disabled?: string

	/** Field for active/pressed state - default: 'active' */
	active?: string

	/** Field for item type - default: 'type' */
	type?: string

	/** Field for children array (for grouping) - default: 'children' */
	children?: string

	/** Field for custom snippet name - default: 'snippet' */
	snippet?: string

	/** Field for navigation URL (renders as link) - default: 'href' */
	href?: string

	/** Field for badge/indicator content - default: 'badge' */
	badge?: string

	/** Nested field mapping for children - default: inherits parent */
	fields?: ItemFields
}

/**
 * Default field mapping values
 */
export const defaultItemFields: Required<Omit<ItemFields, 'fields'>> = {
	text: 'text',
	value: 'value',
	icon: 'icon',
	description: 'description',
	shortcut: 'shortcut',
	label: 'label',
	disabled: 'disabled',
	active: 'active',
	type: 'type',
	children: 'children',
	snippet: 'snippet',
	href: 'href',
	badge: 'badge'
}

/**
 * ItemProxy wraps a data item with field mapping for clean property access.
 *
 * @example
 * ```ts
 * const item = { name: 'Save', kbd: 'Ctrl+S', actionId: 'save' }
 * const fields = { text: 'name', shortcut: 'kbd', value: 'actionId' }
 * const proxy = new ItemProxy(item, fields)
 *
 * proxy.text      // 'Save'
 * proxy.shortcut  // 'Ctrl+S'
 * proxy.itemValue // 'save'
 * proxy.has('icon') // false
 * ```
 */
export class ItemProxy<T extends Record<string, unknown> = Record<string, unknown>> {
	readonly #original: T | string | number
	readonly #value: Record<string, unknown>
	#fields: Required<Omit<ItemFields, 'fields'>> & { fields?: ItemFields }

	constructor(value: T | string | number, fields?: ItemFields) {
		this.#fields = this.#mergeFields(fields)
		this.#original = value

		// Normalize value to object form
		if (typeof value === 'object' && value !== null) {
			this.#value = value as Record<string, unknown>
		} else {
			this.#value = { [this.#fields.text]: value }
		}
	}

	/**
	 * Merge user fields with defaults
	 */
	#mergeFields(
		fields?: ItemFields
	): Required<Omit<ItemFields, 'fields'>> & { fields?: ItemFields } {
		return {
			...defaultItemFields,
			...fields
		}
	}

	/**
	 * Get the field mapping configuration
	 */
	get fields(): Required<Omit<ItemFields, 'fields'>> & { fields?: ItemFields } {
		return this.#fields
	}

	/**
	 * Get the original unwrapped value
	 */
	get original(): T | string | number {
		return this.#original
	}

	/**
	 * Get the normalized value object
	 */
	get value(): Record<string, unknown> {
		return this.#value
	}

	/**
	 * Gets a mapped attribute from the item
	 *
	 * @param fieldName - Name of the field to get (e.g., 'text', 'icon', 'shortcut')
	 * @param defaultValue - Default value to return if not found
	 * @returns The attribute value or defaultValue if not found
	 */
	get<V = unknown>(fieldName: keyof ItemFields, defaultValue: V | null = null): V | null {
		if (this.has(fieldName)) {
			const mappedField = (this.#fields as Record<string, unknown>)[fieldName]
			if (typeof mappedField === 'string') {
				return this.#value[mappedField] as V
			}
		}
		return defaultValue
	}

	/**
	 * Checks if a mapped attribute exists in the item
	 *
	 * @param fieldName - Name of the field to check
	 * @returns true if the field exists and has a value
	 */
	has(fieldName: keyof ItemFields): boolean {
		const mappedField = (this.#fields as Record<string, unknown>)[fieldName]
		if (typeof mappedField !== 'string') {
			return false
		}
		return (
			mappedField in this.#value &&
			this.#value[mappedField] !== undefined &&
			this.#value[mappedField] !== null
		)
	}

	/**
	 * Get the display text for this item
	 */
	get text(): string {
		const value = this.get<string>('text')
		if (value !== null) return String(value)

		// Fallback to common field names
		const fallbacks = ['label', 'name', 'title', 'text']
		for (const fallback of fallbacks) {
			if (
				fallback in this.#value &&
				this.#value[fallback] !== null &&
				this.#value[fallback] !== undefined
			) {
				return String(this.#value[fallback])
			}
		}

		// Last resort: stringify primitive
		if (typeof this.#original !== 'object') {
			return String(this.#original)
		}

		return ''
	}

	/**
	 * Get the value for this item
	 */
	get itemValue(): unknown {
		const value = this.get('value')
		if (value !== null) return value

		// Fallback to common field names
		const fallbacks = ['id', 'key', 'value']
		for (const fallback of fallbacks) {
			if (fallback in this.#value && this.#value[fallback] !== undefined) {
				return this.#value[fallback]
			}
		}

		return this.#original
	}

	/**
	 * Get the icon class for this item
	 */
	get icon(): string | null {
		const icon = this.get<string>('icon')
		return typeof icon === 'string' && icon.length > 0 ? icon : null
	}

	/**
	 * Get the description for this item
	 */
	get description(): string | null {
		const desc = this.get<string>('description')
		if (desc !== null) return String(desc)

		// Fallback to common field names
		const fallbacks = ['hint', 'subtitle', 'summary']
		for (const fallback of fallbacks) {
			if (
				fallback in this.#value &&
				this.#value[fallback] !== null &&
				this.#value[fallback] !== undefined
			) {
				return String(this.#value[fallback])
			}
		}

		return null
	}

	/**
	 * Get the keyboard shortcut for this item
	 */
	get shortcut(): string | null {
		const shortcut = this.get<string>('shortcut')
		if (typeof shortcut === 'string' && shortcut.length > 0) {
			return shortcut
		}

		// Fallback to common field names
		const fallbacks = ['kbd', 'hotkey', 'accelerator', 'keyBinding']
		for (const fallback of fallbacks) {
			if (
				fallback in this.#value &&
				this.#value[fallback] !== null &&
				this.#value[fallback] !== undefined
			) {
				return String(this.#value[fallback])
			}
		}

		return null
	}

	/**
	 * Get the aria-label for this item
	 */
	get label(): string {
		const label = this.get<string>('label')
		if (label !== null) return String(label)
		return this.text
	}

	/**
	 * Check if this item is disabled
	 */
	get disabled(): boolean {
		return this.get('disabled') === true
	}

	/**
	 * Check if this item is active/pressed
	 */
	get active(): boolean {
		return this.get('active') === true
	}

	/**
	 * Get the item type (e.g., 'button', 'toggle', 'separator', 'spacer')
	 */
	get itemType(): string {
		const type = this.get<string>('type')
		return typeof type === 'string' ? type : 'button'
	}

	/**
	 * Check if this item has children (is a group)
	 */
	get hasChildren(): boolean {
		const childrenField = this.#fields.children
		const children = this.#value[childrenField]
		return Array.isArray(children) && children.length > 0
	}

	/**
	 * Check if this item can load children on demand (has truthy children field that isn't an array)
	 * Convention: `children: true` means "has children, not yet loaded"
	 */
	get canLoadChildren(): boolean {
		const childrenField = this.#fields.children
		const children = this.#value[childrenField]
		return Boolean(children) && !Array.isArray(children)
	}

	/**
	 * Get children array from this item
	 */
	get children(): Record<string, unknown>[] {
		const childrenField = this.#fields.children
		const children = this.#value[childrenField]
		return Array.isArray(children) ? children : []
	}

	/**
	 * Get the snippet name for custom rendering, if specified
	 */
	get snippetName(): string | null {
		const snippet = this.get<string>('snippet')
		return typeof snippet === 'string' && snippet.length > 0 ? snippet : null
	}

	/**
	 * Create a proxy for a child item, inheriting or using nested fields
	 */
	createChildProxy(child: Record<string, unknown>): ItemProxy {
		const childFields = this.#fields.fields ?? this.#fields
		return new ItemProxy(child, childFields)
	}
}

/**
 * Factory function to create an ItemProxy
 */
export function createItemProxy<T extends Record<string, unknown>>(
	item: T | string | number,
	fields?: ItemFields
): ItemProxy<T> {
	return new ItemProxy(item, fields)
}
