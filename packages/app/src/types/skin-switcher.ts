export interface SkinSwitcherOption {
	value: string
	label: string
	icon?: string
}

export function buildSkinSwitcherOptions(
	skins: Array<string | { name: string; label?: string; icon?: string }>,
	labels: Record<string, string> = {}
): SkinSwitcherOption[] {
	return skins.map((s) => {
		const name = typeof s === 'string' ? s : s.name
		const label = typeof s === 'string' ? (labels[s] ?? s) : (s.label ?? labels[s.name] ?? s.name)
		const icon = typeof s === 'string' ? undefined : s.icon
		return { value: name, label, icon }
	})
}
