import { deriveSchemaFromValue, schemaAt } from '../schema.js'
import { deriveLayoutFromValue, deriveLayoutFromSchema } from '../layout.js'
import { getSchemaWithLayout } from '../fields.js'

const hasFields = (schema) =>
	Boolean(schema && typeof schema === 'object' && schema.properties && typeof schema.properties === 'object' && Object.keys(schema.properties).length > 0)

const hasElements = (layout) => Boolean(layout && Array.isArray(layout.elements) && layout.elements.length > 0)

/**
 * What the form IS: its schema (the fields and their rules) and its layout (how they are
 * arranged), each derivable from the other or from the data.
 *
 * The setters carry the derivation rules, so a caller can set either at any time:
 * - a schema set explicitly is the source of truth for which fields exist — a layout that was
 *   only ever derived (perhaps from empty data) is re-derived from it; an explicit, non-empty
 *   layout is kept;
 * - a null schema derives from the current data;
 * - a null layout derives from the schema when it declares fields — so declared fields render
 *   even when the data starts as `{}`, the norm for LLM-generated and reset forms — else from
 *   the data.
 */
export class FormDefinition {
	#values
	#schema = $state({})
	#layout = $state({})

	/**
	 * @param {import('./FormValues.svelte.js').FormValues} values
	 * @param {Object|null} schema
	 * @param {Object|null} layout
	 */
	constructor(values, schema, layout) {
		this.#values = values
		this.schema = schema
		this.layout = layout
	}

	get schema() {
		return this.#schema
	}
	set schema(value) {
		this.#schema = value ?? deriveSchemaFromValue(this.#values.data)
		if (!hasElements(this.#layout)) this.#layout = deriveLayoutFromSchema(this.#schema)
	}

	get layout() {
		return this.#layout
	}
	set layout(value) {
		if (value) {
			this.#layout = value
			return
		}
		this.#layout = hasFields(this.#schema)
			? deriveLayoutFromSchema(this.#schema)
			: deriveLayoutFromValue(this.#values.data)
	}

	/** Schema merged with the layout's scoped elements. */
	get combined() {
		const elements = (this.#layout?.elements ?? []).filter((el) => el.scope)
		return getSchemaWithLayout(this.#schema, { ...this.#layout, elements })
	}

	/** The schema of one field by slash path, or null — see `schemaAt`. */
	fieldSchema(path) {
		return schemaAt(this.#schema, path)
	}

	/** A field's display label: its layout element's label, then title, then the path itself. */
	fieldLabel(path) {
		const el = this.#layout?.elements?.find((e) => e.scope === `#/${path}`)
		return el?.label || (el?.title ?? path)
	}
}
