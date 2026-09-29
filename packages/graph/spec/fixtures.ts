/* Named data shapes, one per case the layouts have to get right.
 *
 * These live at the STATE level on purpose. `GraphState` owns every derivation, so a defect
 * in placement, sizing, direction or nesting is provable from a dataset and an assertion
 * about `state.cards` / `state.clusters` — with no DOM, no render and no browser. The
 * components then assert only that they published what the state said.
 *
 * The practical consequence: widening coverage means adding a SHAPE here, not writing a new
 * kind of test. Every issue closed against this package (#160-#164) has its shape below, so
 * a regression on any of them fails a state test rather than surfacing in someone's UI.
 */

import type { GraphFields } from '../src/types.js'

/** Edges as plain source/target — the minimum a call graph needs. */
export const CALL_FIELDS: GraphFields = {
	id: 'id',
	label: 'label',
	group: 'group',
	kind: 'kind',
	weight: 'weight',
	source: 'source',
	target: 'target',
	defaultEdgeKind: 'dependency'
}

/**
 * #160 — direction.
 *
 * `mutualBalanced` has one edge each way; `mutualCallerHeavy` reaches the focus twice and is
 * reached once. A split on "has an out edge at all" put every mutual node on the right and
 * drew its inbound edge backwards.
 */
export const bidirectional = {
	nodes: [
		{ id: 'focus', label: 'resolve_edges', group: 'core' },
		{ id: 'mutualBalanced', label: 'walk_scope', group: 'core' },
		{ id: 'mutualCallerHeavy', label: 'run_pipeline', group: 'core' },
		{ id: 'mutualCalleeHeavy', label: 'lookup_fqn', group: 'core' },
		{ id: 'pureCaller', label: 'main', group: 'cli' },
		{ id: 'pureCallee', label: 'intern', group: 'util' }
	],
	edges: [
		{ source: 'focus', target: 'mutualBalanced' },
		{ source: 'mutualBalanced', target: 'focus' },
		{ source: 'mutualCallerHeavy', target: 'focus' },
		{ source: 'mutualCallerHeavy', target: 'focus' },
		{ source: 'focus', target: 'mutualCallerHeavy' },
		{ source: 'focus', target: 'mutualCalleeHeavy' },
		{ source: 'focus', target: 'mutualCalleeHeavy' },
		{ source: 'mutualCalleeHeavy', target: 'focus' },
		{ source: 'pureCaller', target: 'focus' },
		{ source: 'focus', target: 'pureCallee' }
	]
}

/**
 * #162 — depth.
 *
 * Two rings either side of the focus, plus `shared`, which is reachable at BOTH depths — it
 * must be claimed by the nearer ring and not drawn twice.
 */
export const twoHop = {
	nodes: [
		{ id: 'focus', label: 'apply', group: 'core' },
		{ id: 'callerL1', label: 'run', group: 'cli' },
		{ id: 'callerL2', label: 'main', group: 'cli' },
		{ id: 'calleeL1', label: 'plan', group: 'core' },
		{ id: 'calleeL2', label: 'diff', group: 'core' },
		{ id: 'shared', label: 'log', group: 'util' },
		{ id: 'unrelated', label: 'unrelated', group: 'util' }
	],
	edges: [
		{ source: 'callerL1', target: 'focus' },
		{ source: 'callerL2', target: 'callerL1' },
		{ source: 'focus', target: 'calleeL1' },
		{ source: 'calleeL1', target: 'calleeL2' },
		// `shared` is one hop out AND two hops out via calleeL1.
		{ source: 'focus', target: 'shared' },
		{ source: 'calleeL1', target: 'shared' }
	]
}

/**
 * A chain long enough to reach past the two NAMED rings.
 *
 * "callers of callers of callers" is not a phrase, so beyond depth 2 the heading states the
 * hop count instead of inventing English — which needs a graph that actually goes that deep.
 */
export const threeHop = {
	nodes: [
		{ id: 'focus', label: 'apply', group: 'core' },
		{ id: 'out1', label: 'plan', group: 'core' },
		{ id: 'out2', label: 'diff', group: 'core' },
		{ id: 'out3', label: 'hash', group: 'util' },
		{ id: 'in1', label: 'run', group: 'cli' },
		{ id: 'in2', label: 'main', group: 'cli' },
		{ id: 'in3', label: 'boot', group: 'cli' }
	],
	edges: [
		{ source: 'focus', target: 'out1' },
		{ source: 'out1', target: 'out2' },
		{ source: 'out2', target: 'out3' },
		{ source: 'in1', target: 'focus' },
		{ source: 'in2', target: 'in1' },
		{ source: 'in3', target: 'in2' }
	]
}

/**
 * #161 / #164 — a per-node measure.
 *
 * Equal degree, wildly unequal weight. Degree-only sizing gives these identical geometry,
 * which is the defect: the picture is about the quantity, not the connectivity.
 */
export const weighted = {
	nodes: [
		{ id: 'bigModule', label: 'parser', group: 'src', weight: 50000 },
		{ id: 'smallModule', label: 'version', group: 'src', weight: 3 },
		{ id: 'midModule', label: 'lexer', group: 'src', weight: 500 },
		{ id: 'hub', label: 'index', group: 'src' },
		{ id: 'noWeight', label: 'unknown', group: 'src' }
	],
	edges: [
		{ source: 'hub', target: 'bigModule' },
		{ source: 'hub', target: 'smallModule' },
		{ source: 'hub', target: 'midModule' },
		{ source: 'hub', target: 'noWeight' }
	]
}

/**
 * #164 — two INDEPENDENT measures over one picture.
 *
 * `declarations` is absolute and drives area; `unresolved` and `tests` are 0..1 shares and
 * drive shade. A reader asks both at once — "this module is huge AND half its calls go
 * nowhere" — which is why one field cannot serve both.
 */
export const measured = {
	nodes: [
		{ id: 'parser', label: 'parser', path: ['src'], m: { declarations: 900, unresolved: 0.9, tests: 0.1 } },
		{ id: 'lexer', label: 'lexer', path: ['src'], m: { declarations: 300, unresolved: 0.1, tests: 0.8 } },
		{ id: 'util', label: 'util', path: ['src'], m: { declarations: 60, unresolved: 0.5, tests: 0.5 } },
		// No measures at all — must floor, not break the normalisation.
		{ id: 'bare', label: 'bare', path: ['src'] }
	],
	edges: [{ source: 'parser', target: 'lexer' }]
}

/**
 * #163 — containment deeper than two levels.
 *
 * `path` carries the chain a codebase actually has: repo › folder › module. Two axes cannot
 * express it, and which level is "outer" depends on where the reader is standing.
 */
export const nestedPath = {
	nodes: [
		// Two leaves in one container, so `dbd/core/lexer` is a real level.
		{ id: 'a', label: 'parse', path: ['dbd', 'core', 'lexer'], weight: 40 },
		{ id: 'b', label: 'tokenize', path: ['dbd', 'core', 'lexer'], weight: 60 },
		// A container that CLAIMS its synthesised box, carrying its own label and note.
		{ id: 'dbd/core/lexer', label: 'Lexer', note: 'Tokeniser and parser.' },
		// One leaf under its own container → that container is a wrapper and folds away.
		{ id: 'c', label: 'plan', path: ['dbd', 'core', 'apply'], weight: 25 },
		// A chain of wrappers, all single-child: three levels collapsing to one.
		{ id: 'd', label: 'render', path: ['dbd', 'site', 'ui', 'view'], weight: 10 },
		// No path at all → sits at the root.
		{ id: 'e', label: 'orphan', weight: 5 }
	],
	edges: [
		{ source: 'a', target: 'b' },
		{ source: 'b', target: 'c' },
		{ source: 'c', target: 'd' }
	]
}

/** A schema shaped like dbd's, for the ER-flavoured cases. */
export const SCHEMA_FIELDS_LITE: GraphFields = {
	id: 'id',
	label: 'name',
	group: 'schema',
	kind: 'kind',
	rows: 'columns',
	rowBadges: { pk: 'pk' },
	source: 'from',
	target: 'to'
}
