/**
 * The layers demo's HOST side (#167). `@rokkit/graph` computes no depth: the host knows the
 * architecture it INTENDS and assigns each node its layer. Here that is rokkit's own package
 * layering, top to bottom — what is allowed to import what.
 */

/** Package → intended layer. 0 is the top; core is the foundation everything stands on. */
export const PACKAGE_LAYERS: Record<string, number> = {
	app: 0,
	blocks: 0,
	cli: 0,
	forms: 1,
	chart: 1,
	graph: 1,
	ui: 2,
	actions: 3,
	states: 3,
	data: 4,
	themes: 4,
	unocss: 4,
	helpers: 4,
	core: 5
}

export const LAYER_LABELS = [
	'Apps & composites',
	'Feature libraries',
	'Components',
	'Behaviour & state',
	'Data & build',
	'Foundation'
]

/** A component (`ui/components`) sits in its package's layer. */
export function layerOfComponent(component: string): number | undefined {
	return PACKAGE_LAYERS[component.split('/')[0]]
}
