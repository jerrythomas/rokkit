/**
 * The polymetric demo's HOST side (#168). `@rokkit/graph` reads containment from `parent` ids
 * and three measures off each leaf; it computes neither. Here the host is the metrics script's
 * output: one package's files, each folder declared once, every node naming its parent.
 */

type Module = { id: string; label: string; package: string; loc: number; churn: number; declarations: number }

export type PolymetricNode = {
	id: string
	label: string
	kind: 'folder' | 'file'
	parent: string | null
	measures?: { declarations: number; loc: number; churn: number }
}

const parentOf = (id: string) => id.slice(0, id.lastIndexOf('/'))
const lastSegment = (id: string) => id.slice(id.lastIndexOf('/') + 1)

/** Every folder from `id`'s parent up to `root`, declared once, nearest first. */
function declareFolders(id: string, root: string, folders: Map<string, PolymetricNode>): void {
	for (let dir = parentOf(id); dir.startsWith(root) && !folders.has(dir); dir = parentOf(dir)) {
		folders.set(dir, { id: dir, label: lastSegment(dir), kind: 'folder', parent: dir === root ? null : parentOf(dir) })
	}
}

/** One package's files and folders, as `parent`-linked nodes with the files' measures. */
export function filesWithParents(modules: Module[], pkg: string): PolymetricNode[] {
	const root = `packages/${pkg}`
	const folders = new Map<string, PolymetricNode>()
	const files: PolymetricNode[] = []
	for (const m of modules.filter((x) => x.package === pkg)) {
		declareFolders(m.id, root, folders)
		files.push({
			id: m.id,
			label: m.label,
			kind: 'file',
			parent: parentOf(m.id),
			measures: { declarations: m.declarations, loc: m.loc, churn: m.churn }
		})
	}
	return [...folders.values(), ...files]
}
