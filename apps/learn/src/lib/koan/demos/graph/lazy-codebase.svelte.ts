/**
 * A host that loads a containment tree ONE LEVEL AT A TIME — the demo's side of #165.
 *
 * The treemap asks for nothing; it announces a drill (`ondrill(path)`), and this answers by
 * "fetching" that subtree — a delay standing in for the network — and swapping it in as the
 * dataset's nodes. A level it already has comes back synchronously, so drilling back up is not
 * a refetch. At no point is the whole tree loaded, which is the point for a graph the size of a
 * real monorepo index.
 */

type Row = { path?: string[] }

type Options = {
	/** The path the demo opens at. */
	root: string[]
	/** How many levels below a path one fetch returns — what the treemap materialises. */
	depth: number
	/** Simulated latency, ms. */
	delay: number
}

const keyOf = (path: string[]) => path.join('/')

/** Every row inside `path`, down to `depth` levels below it. */
function levelOf(all: Row[], path: string[], depth: number): Row[] {
	return all.filter((row) => {
		const p = row.path ?? []
		return p.length > path.length && p.length <= path.length + depth && path.every((s, i) => p[i] === s)
	})
}

export class LazyCodebase {
	#all: Row[]
	#depth: number
	#delay: number
	/** Levels already fetched, by path. A plain record: it is a cache, nothing renders from it. */
	#cache: Record<string, Row[]> = {}
	/** The rows currently loaded — what the dataset hands the graph. */
	nodes = $state.raw<unknown[]>([])
	/** How many times the "network" was asked — what the demo reports, and the spec checks. */
	fetches = $state(0)

	constructor(all: unknown[], { root, depth, delay }: Options) {
		this.#all = all as Row[]
		this.#depth = depth
		this.#delay = delay
		this.#cache[keyOf(root)] = levelOf(this.#all, root, depth)
		this.nodes = this.#cache[keyOf(root)]
	}

	/**
	 * Show the level at `path`. Cached: swapped in now, and nothing is returned — the graph has
	 * nothing to wait for. Not yet seen: a promise that resolves once it has been fetched and
	 * swapped in, which is what puts the treemap in its pending state meanwhile.
	 */
	load(path: string[]): Promise<void> | undefined {
		const cached = this.#cache[keyOf(path)]
		if (cached) {
			this.nodes = cached
			return undefined
		}
		this.fetches += 1
		return new Promise((resolve) => {
			setTimeout(() => {
				this.#cache[keyOf(path)] = levelOf(this.#all, path, this.#depth)
				this.nodes = this.#cache[keyOf(path)]
				resolve()
			}, this.#delay)
		})
	}
}
