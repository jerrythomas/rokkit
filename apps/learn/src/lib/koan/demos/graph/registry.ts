import type { Component } from 'svelte'
import {
	CallTree,
	DependencyDiagram,
	LayersDiagram,
	DependencyMatrix,
	ErDiagram,
	Graph,
	Neighborhood,
	StructureDiagram,
	Sunburst,
	Treemap
} from '@rokkit/graph'
import { datasets, lazyCodebase } from './datasets'
import { LAYER_LABELS } from './layers'

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
 * The codebase gets `StructureDiagram`, not `CallTree`: a call graph's own spanning tree has
 * hundreds of roots over a real repo, so capping its depth prunes almost nothing. Containment
 * is the tree that makes it legible, and the calls are drawn ON it.
 */
export type DiagramId =
	| 'er'
	| 'dependencies'
	| 'calls'
	| 'structure'
	| 'treemap'
	| 'lazy-treemap'
	| 'sunburst'
	| 'neighborhood'
	| 'matrix'
	| 'coupling'
	| 'cycles'
	| 'layers'
	| 'layers-sample'

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
	/**
	 * What the diagram draws on. `graph` (the default) is the node-link canvas, where `layout`
	 * applies; `matrix` is the dependency structure matrix, which has no layout at all.
	 */
	canvas?: 'graph' | 'matrix'
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
	structure: {
		id: 'structure',
		layout: 'structure',
		label: 'Structure',
		group: 'Code',
		component: StructureDiagram as Component<Record<string, unknown>>,
		dataset: 'codebase',
		blurb:
			'The repo as a radial dendrogram, with every import bundled through the hierarchy it travels. The depth control says what sits on the rim — 1 is the packages, 3 is every file — which is how you narrow it enough to read.',
		// Opens at ONE: fourteen packages you can name. Three puts 435 files on the rim, which
		// is a picture rather than something to read, and is what the control is for.
		props: { levels: 1, sizeBy: 'degree', bundleTension: 0.85, focusPath: ['rokkit'], maxLevels: 4 }
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
	'lazy-treemap': {
		id: 'lazy-treemap',
		layout: 'world',
		label: 'Treemap, loaded per level',
		group: 'Code',
		component: Treemap as Component<Record<string, unknown>>,
		dataset: 'codebase-lazy',
		blurb:
			'The same treemap, but the page never holds the whole repo. Opening a box asks the host for that level — the canvas waits while it loads — and a level it already has comes back instantly.',
		props: {
			sizeBy: 'declarations',
			levels: 2,
			focusPath: ['rokkit'],
			ondrill: (path: string[]) => lazyCodebase.load(path),
			ondrillup: (path: string[]) => lazyCodebase.load(path)
		}
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
	},
	matrix: {
		id: 'matrix',
		// Not a Graph layout — the matrix orders its own rows. `flow` is what the shared state
		// runs for the entity views; the matrix itself reads only the model.
		layout: 'flow',
		canvas: 'matrix',
		label: 'Dependency matrix',
		group: 'Code',
		component: DependencyMatrix as Component<Record<string, unknown>>,
		dataset: 'components',
		blurb:
			'Every component a row and a column; a cell where the row depends on the column. Providers come first, so a layered codebase is lower-triangular — a red cell above the diagonal is a cycle or a layer reaching up.',
		props: { groupBy: 'group', cell: 14 }
	},
	coupling: {
		id: 'coupling',
		// `points`, not `flow`: flow spreads ~45 components over ten card columns, and fitting
		// that to the canvas shrinks every card — and every overlay between them — to a speck.
		// Packed by package, the dotted co-change edges visibly cross package lines.
		layout: 'points',
		label: 'Hidden coupling',
		group: 'Code',
		component: Graph as Component<Record<string, unknown>>,
		dataset: 'cochange',
		blurb:
			'Components packed by package, sized by lines of code, with their imports — and, dotted over them, the pairs that change in the same commit but share no import, thicker the more often. The layout never sees those, so they cross it: that is the coupling the import graph hides.',
		props: { layout: 'points', sizeBy: 'weight' }
	},
	cycles: {
		id: 'cycles',
		layout: 'flow',
		label: 'Import cycles',
		group: 'Code',
		component: DependencyDiagram as Component<Record<string, unknown>>,
		dataset: 'cycles',
		blurb:
			'Each group of components that import each other is collapsed into one node, so what remains reads as a hierarchy. Expand one to see the cycle; the dashed red edge is the weakest link, the cheapest one to cut.',
		props: { density: 'names' }
	},
	layers: {
		id: 'layers',
		layout: 'layers',
		label: 'Layers',
		group: 'Code',
		component: LayersDiagram as Component<Record<string, unknown>>,
		dataset: 'layers',
		blurb:
			'rokkit’s components in the layers its packages are meant to keep, foundations at the bottom. Arrows should only point down — dashed ones skip a layer. Switch to “Violations only” and the canvas empties: no rokkit package imports upward.',
		props: { layerLabels: LAYER_LABELS }
	},
	'layers-sample': {
		id: 'layers-sample',
		layout: 'layers',
		label: 'Layers, with a violation',
		group: 'Code',
		component: LayersDiagram as Component<Record<string, unknown>>,
		dataset: 'layers-sample',
		blurb:
			'The sample from #167: five modules, every call going down a layer — except one, which climbs. That red edge is the violation, and “Violations only” leaves just it.',
		props: {}
	}
}

export const diagrams = Object.values(registry)

export const diagramGroups: DiagramGroup[] = ['Schema', 'Code']
