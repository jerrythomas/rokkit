/**
 * web-llm is loaded at runtime from the esm.run CDN (Vite's dependency scanner
 * overflows on the npm bundle, so the chat demo imports the opaque CDN URL
 * directly). That URL ships no types — declare the minimal surface used.
 *
 * This file is a pure ambient script (no top-level import/export) so the
 * `declare module` below registers a new ambient module rather than augmenting
 * an existing one.
 */
declare module 'https://esm.run/@mlc-ai/web-llm@0.2.83' {
	export interface MLCEngine {
		chat: {
			completions: {
				create(opts: unknown): Promise<unknown>
			}
		}
		[key: string]: unknown
	}
	export function CreateMLCEngine(
		model: string,
		options?: {
			initProgressCallback?: (report: { progress: number; text: string }) => void
			[key: string]: unknown
		}
	): Promise<MLCEngine>
}
