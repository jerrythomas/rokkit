/* A share (0..1) for every box of the containment tree (#164).
 *
 * A share is a fraction — how much of this is tested, how much reaches no target — so it does
 * not sum the way a size does. A container's share is the SIZE-WEIGHTED mean of what it holds:
 * 30 tested lines of 40 is 0.75, where a plain mean of the two files' 1 and 0 would say 0.5.
 * A box that declares its own share keeps it (the host may know better), and a box with
 * nothing measured beneath it has none — "unknown" is not "zero".
 */
import type { TreeNode } from './tree.js'
import type { Cluster } from '../layout/types.js'

const clamp = (value: number) => Math.min(1, Math.max(0, value))

/** The box's own share, when its node declares one. */
const ownShare = (box: TreeNode, measure: string): number | undefined => {
	const value = box.node?.measures?.[measure]
	return value === undefined ? undefined : clamp(value)
}

/** The mean of the children's shares, weighted by their size; a plain mean if none has size. */
function meanOf(children: { share: number; size: number }[]): number | undefined {
	if (children.length === 0) return undefined
	const weight = children.reduce((total, child) => total + Math.max(0, child.size), 0)
	if (weight === 0) return children.reduce((total, child) => total + child.share, 0) / children.length
	return children.reduce((total, child) => total + child.share * Math.max(0, child.size), 0) / weight
}

function visit(box: TreeNode, measure: string, out: Map<string, number>): number | undefined {
	const measured: { share: number; size: number }[] = []
	for (const child of box.children) {
		const share = visit(child, measure, out)
		if (share !== undefined) measured.push({ share, size: child.value })
	}
	const share = ownShare(box, measure) ?? meanOf(measured)
	if (share !== undefined) out.set(box.id, share)
	return share
}

/** Every box's share of `measure`, by tree id. A box with none is absent from the map. */
export function shares(root: TreeNode, measure: string): Map<string, number> {
	const out = new Map<string, number>()
	visit(root, measure, out)
	return out
}

/**
 * What a box carries for the shade channel: its share, or — when shading is on and it has
 * none — a mark that the value is missing, so the theme never paints it as a zero.
 */
export function shadeFields(
	all: Map<string, number> | undefined,
	id: string
): Pick<Cluster, 'shade' | 'missing'> {
	if (!all) return {}
	const share = all.get(id)
	return share === undefined ? { missing: ['color'] } : { shade: share }
}
