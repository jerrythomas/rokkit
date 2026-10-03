/* What the System One page tells a visitor, and how it checks their Ollama.
 *
 * System One runs on the visitor's own Ollama, asked from the browser, so three things must hold:
 * the System One model is pulled (`ollama pull nimble`, Ollama 0.35+), Ollama allows this site's
 * origin (OLLAMA_ORIGINS — the per-OS steps follow Ollama's FAQ), and the browser is allowed to
 * reach the local network (Chromium asks on the first request from a public site).
 */

export type AllowStep = { os: string; commands: string[]; note?: string }
export type SetupSteps = {
	install: string
	model: string
	/** False on a localhost origin: Ollama already allows those. */
	allowNeeded: boolean
	allow: AllowStep[]
}

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

export function setupSteps(origin: string, model: string): SetupSteps {
	return {
		install: 'https://ollama.com/download',
		model: `ollama pull ${model}`,
		allowNeeded: !LOCAL_ORIGIN.test(origin),
		allow: [
			{ os: 'macOS app', commands: [`launchctl setenv OLLAMA_ORIGINS "${origin}"`], note: 'Then quit and reopen the Ollama app.' },
			{
				os: 'Linux (systemd)',
				commands: [
					'sudo systemctl edit ollama.service',
					`# under [Service]: Environment="OLLAMA_ORIGINS=${origin}"`,
					'sudo systemctl daemon-reload && sudo systemctl restart ollama'
				]
			},
			{
				os: 'Windows',
				commands: [`OLLAMA_ORIGINS = ${origin}`],
				note: 'Quit Ollama, add this under “Edit environment variables for your account”, then start Ollama again.'
			},
			{ os: 'Terminal', commands: [`OLLAMA_ORIGINS=${origin} ollama serve`], note: 'Runs Ollama in the foreground until you stop it.' }
		]
	}
}

export type OllamaStatus = 'ready' | 'no-model' | 'unreachable'

/**
 * Whether the visitor's Ollama answers and has the model. Unreachable covers everything the
 * browser cannot tell apart: Ollama not running, the origin not allowed, or local network access
 * refused — a CORS or permission failure looks the same as no server.
 */
export async function checkOllama(
	{ url, model }: { url: string; model: string },
	fetcher: typeof fetch = fetch
): Promise<OllamaStatus> {
	try {
		const res = await fetcher(`${url.replace(/\/$/, '')}/api/tags`)
		if (!res.ok) return 'unreachable'
		const { models = [] } = (await res.json()) as { models?: { name: string }[] }
		return models.some((m) => m.name === model || m.name.startsWith(`${model}:`)) ? 'ready' : 'no-model'
	} catch {
		return 'unreachable'
	}
}
