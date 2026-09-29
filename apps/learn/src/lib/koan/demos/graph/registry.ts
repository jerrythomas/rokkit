import type { Component } from 'svelte'
import {
	CallTree,
	DependencyDiagram,
	ErDiagram,
	Neighborhood,
	Sunburst,
	Treemap
} from '@rokkit/graph'
import { datasets } from './datasets'

/**
 * One entry per DIAGRAM, each carrying the dataset it is for.
 *
 * The thing this fixes: the demo used to offer one component, one dataset picker and one
 * layout picker as independent choices — so an ER dataset could be pointed at a radial tree,
 * where table entities have no call hierarchy and the picture is meaningless. A diagram and
 * the shape of data it reads are not separable, so they are chosen together.
 *
 * Same structure as the chart demo's registry, for the same reason: the registry is what lets
 * the controls ask "does this apply here" instead of showing every knob for every picture.
 *
 * NOT here yet, and deliberately: a radial view of the CODEBASE. `CallTree` builds its tree
 * from call edges, and a codebase's structure is CONTAINMENT (`path`) — 470 modules have
 * hundreds of roots, so capping depth prunes almost nothing and the rim is a grey smear. The
 * honest version needs a radial layout over `buildTree`, the same tree `Treemap` and
 * `Sunburst` use. Pairing the component with the data anyway would be exactly the mismatch
 * this registry exists to remove.
 */
export type DiagramId =
	| 'er'
	| 'dependencies'
	| 'calls'
	| 'treemap'
	| 'sunburst'
	| 'neighborhood'

/** What question the diagram answers. Groups the picker, nothing more. */
export type DiagramGroup = 'Schema' | 'Code'

export type DiagramConfig = {
	id: DiagramId
	label: string
	group: DiagramGroup
	/** The named component from `@rokkit/graph`. */
	component: Component<Record<string, unknown>>
	/**
	 * The layout that component draws with.
	 *
	 * Declared here because the explorer shares ONE GraphState across the diagram and the
	 * entity views, and `update()` fully re-applies — so a layout the component set would be
	 * reset on the caller's next update. `graph-meta.spec.ts` renders each component on its
	 * own and compares, so this cannot drift from what the component actually draws.
	 */
	layout: string
	dataset: keyof typeof datasets
	/** One line on what the picture answers, shown beside the canvas. */
	blurb: string
	/** Props this diagram opens with. */
	props?: Record<string, unknown>
	/** Which of the demo's own extras make sense here. */
	views?: boolean
}

export const registry: Record<DiagramId, DiagramConfig> = {
	er: {
		id: 'er',
		layout: 'flow',
		label: 'ER diagram',
		group: 'Schema',
		component: ErDiagram as Component<Record<string, unknown>>,
		dataset: 'ecommerce',
		blurb:
			'Table entities and their foreign keys, ranked left to right so every link leaves the right edge and enters the left.',
		props: { density: 'keys', groupTint: true },
		views: true
	},
	dependencies: {
		id: 'dependencies',
		layout: 'flow',
		label: 'Schema dependencies',
		group: 'Schema',
		component: DependencyDiagram as Component<Record<string, unknown>>,
		dataset: 'schema-deps',
		blurb:
			'What reads, writes, calls and contains what. Views and routines live here — an ER canvas is table entities only.',
		props: { density: 'names', groupTint: true },
		views: true
	},
	neighborhood: {
		id: 'neighborhood',
		layout: 'neighborhood',
		label: 'Neighbourhood',
		group: 'Schema',
		component: Neighborhood as Component<Record<string, unknown>>,
		dataset: 'ecommerce',
		blurb:
			'One table and what reaches it. At two hops it answers the question you have before editing something: what does changing this touch?',
		props: { focus: 'public.orders', depth: 1 },
		views: true
	},
	calls: {
		id: 'calls',
		layout: 'radial',
		label: 'Call tree',
		group: 'Code',
		component: CallTree as Component<Record<string, unknown>>,
		dataset: 'service-calls',
		blurb:
			'A call graph as a radial tidy tree. Angle separates the subtrees, radius carries the depth.',
		props: { radialMode: 'tree' }
	},
	treemap: {
		id: 'treemap',
		layout: 'world',
		label: 'Treemap',
		group: 'Code',
		component: Treemap as Component<Record<string, unknown>>,
		dataset: 'codebase',
		blurb:
			'Where the mass of a codebase is. A box’s area is what it contains, so the tree sums subtrees rather than counting nodes.',
		props: { sizeBy: 'declarations', levels: 2, focusPath: ['rokkit'] }
	},
	sunburst: {
		id: 'sunburst',
		layout: 'sunburst',
		label: 'Sunburst',
		group: 'Code',
		component: Sunburst as Component<Record<string, unknown>>,
		dataset: 'codebase',
		blurb:
			'The same containment as wedges. Angle carries the measure and radius carries the depth, so how deep the tree goes reads at a glance.',
		props: { sizeBy: 'declarations', levels: 2, focusPath: ['rokkit'] }
	}
}

export const diagrams = Object.values(registry)

export const diagramGroups: DiagramGroup[] = ['Schema', 'Code']
