import { createCrossFilter } from '../../src/crossfilter/createCrossFilter.svelte.js'

// Module-level crossfilter instance for tests.
// Module-level $state propagates reactivity reliably across component trees.
export const testCf = createCrossFilter()

export function resetTestCf() {
  testCf.clearAll()
}
