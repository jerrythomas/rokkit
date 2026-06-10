/**
 * App command registry — keyboard shortcuts + actions in one place.
 * Singleton, like `vibe`/`messages`. See docs/design/19-command-system.md.
 *
 * @typedef {Object} Command
 * @property {string}        id        Unique id; re-registering the same id replaces (warns).
 * @property {string}        label     Display text (consumer-localized).
 * @property {() => void}    run       Executed on shortcut match or palette select.
 * @property {string}        [shortcut] e.g. 'mod+k' | 'mod+shift+p' | '?'. `mod` = Cmd on macOS / Ctrl elsewhere.
 * @property {string}        [group]   Palette category.
 * @property {boolean}       [global]  Fire even while a text input is focused (default false).
 * @property {() => boolean} [enabled] Optional dynamic gate.
 * @property {string[]}      [keywords] Extra palette search terms.
 */

const MOD_ORDER = ['ctrl', 'meta', 'alt', 'shift']

const MODIFIER_ALIAS = { cmd: 'meta', meta: 'meta', ctrl: 'ctrl', control: 'ctrl', shift: 'shift', alt: 'alt', option: 'alt' }

function isMac() {
	if (typeof navigator === 'undefined') return false
	return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '')
}

/** Canonicalize a shortcut string: resolve `mod`, sort modifiers, lowercase the key. */
export function normalizeShortcut(shortcut) {
	const mods = new Set()
	let key = ''
	for (const raw of String(shortcut).toLowerCase().split('+')) {
		const p = raw.trim()
		if (!p) continue
		if (p === 'mod') mods.add(isMac() ? 'meta' : 'ctrl')
		else if (MODIFIER_ALIAS[p]) mods.add(MODIFIER_ALIAS[p])
		else key = p
	}
	return [...MOD_ORDER.filter((m) => mods.has(m)), key].join('+')
}

/** Build the canonical shortcut string from a KeyboardEvent. */
export function eventToShortcut(event) {
	const mods = []
	if (event.ctrlKey) mods.push('ctrl')
	if (event.metaKey) mods.push('meta')
	if (event.altKey) mods.push('alt')
	if (event.shiftKey) mods.push('shift')
	return [...MOD_ORDER.filter((m) => mods.includes(m)), String(event.key).toLowerCase()].join('+')
}

class CommandRegistry {
	#commands = $state(/** @type {Command[]} */ ([]))
	#byShortcut = new Map() // normalized shortcut → id (first registrant wins)

	/** @returns {Command[]} */
	get all() {
		return this.#commands
	}

	/** @param {Command} cmd @returns {() => void} unregister */
	register(cmd) {
		const idx = this.#commands.findIndex((c) => c.id === cmd.id)
		if (idx >= 0) {
			// eslint-disable-next-line no-console
			console.warn(`[commands] duplicate id "${cmd.id}" — replacing existing registration`)
			this.#commands[idx] = cmd
			// drop any shortcut(s) previously indexed to this id (avoid stale bindings)
			for (const [sc, owner] of this.#byShortcut) {
				if (owner === cmd.id) this.#byShortcut.delete(sc)
			}
		} else {
			this.#commands = [...this.#commands, cmd]
		}
		if (cmd.shortcut) {
			const norm = normalizeShortcut(cmd.shortcut)
			const owner = this.#byShortcut.get(norm)
			if (owner && owner !== cmd.id) {
				// eslint-disable-next-line no-console
				console.warn(
					`[commands] shortcut "${cmd.shortcut}" already bound to "${owner}"; "${cmd.id}" will not receive it`
				)
			} else {
				this.#byShortcut.set(norm, cmd.id)
			}
		}
		return () => this.unregister(cmd.id)
	}

	/** @param {Command[]} cmds @returns {() => void} */
	registerMany(cmds) {
		const offs = cmds.map((c) => this.register(c))
		return () => offs.forEach((off) => off())
	}

	/** @param {string} id */
	unregister(id) {
		this.#commands = this.#commands.filter((c) => c.id !== id)
		for (const [shortcut, owner] of this.#byShortcut) {
			if (owner === id) this.#byShortcut.delete(shortcut)
		}
	}

	/** @param {string} id */
	execute(id) {
		const cmd = this.#commands.find((c) => c.id === id)
		if (!cmd) {
			// eslint-disable-next-line no-console
			console.warn(`[commands] unknown command "${id}"`)
			return
		}
		if (cmd.enabled && !cmd.enabled()) return
		cmd.run()
	}

	/** @param {KeyboardEvent} event @returns {Command | null} */
	resolve(event) {
		const id = this.#byShortcut.get(eventToShortcut(event))
		if (!id) return null
		const cmd = this.#commands.find((c) => c.id === id)
		if (!cmd || (cmd.enabled && !cmd.enabled())) return null
		return cmd
	}
}

export const commands = new CommandRegistry()
