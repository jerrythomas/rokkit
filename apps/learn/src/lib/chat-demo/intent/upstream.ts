/* What the browser hears when OpenRouter fails. Its error body names our account (`user_id`)
 * and the provider's raw metadata, so only its one-line message is passed on.
 */

const MAX_PROBLEM = 200

/** OpenRouter's one-line error message for the browser. The rest of its error body names our
 *  account (`user_id`) and the provider's raw metadata, so none of that is passed on. */
export function upstreamProblem(status: number, text: string): string {
	let message: unknown
	try {
		message = JSON.parse(text)?.error?.message
	} catch {
		message = undefined
	}
	if (typeof message !== 'string' || message === '') return `OpenRouter ${status}`
	return `OpenRouter ${status}: ${message.slice(0, MAX_PROBLEM)}`
}
