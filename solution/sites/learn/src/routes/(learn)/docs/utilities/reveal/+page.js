import { redirect } from '@sveltejs/kit'
export function load() {
  throw redirect(301, '/docs/effects/reveal')
}
