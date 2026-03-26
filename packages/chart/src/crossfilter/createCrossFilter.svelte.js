import { SvelteMap, SvelteSet } from 'svelte/reactivity'

/**
 * Creates a reactive cross-filter state object.
 *
 * Filter values follow the spec type:
 *   FilterState = Map<string, Set<unknown> | [number, number]>
 *   - categorical: raw Set of selected values
 *   - continuous:  [min, max] tuple
 *
 * Exposes a `filters` getter so CrossFilter.svelte can bind to current state.
 * Exposes a `version` counter that increments on every mutation, giving
 * components a simple reactive signal to watch for filter changes.
 *
 * @returns {CrossFilter}
 */

function toggleCategoricalInMap(filters, dimension, value) {
  const existing = filters.get(dimension)
  const set = existing instanceof Set ? new SvelteSet(existing) : new SvelteSet()
  if (set.has(value)) {
    set.delete(value)
  } else {
    set.add(value)
  }
  if (set.size === 0) {
    filters.delete(dimension)
  } else {
    filters.set(dimension, set)
  }
}

export function createCrossFilter() {
  // Map<dimension, Set<unknown> | [number, number]>
  const filters = new SvelteMap()

  // Simple counter incremented on every mutation. Components read cf.version
  // inside $effect to reactively recompute when any filter changes.
  let version = $state(0)

  /**
   * Returns true if any filter is active on this dimension.
   * @param {string} dimension
   */
  function isFiltered(dimension) {
    const f = filters.get(dimension)
    if (!f) return false
    if (f instanceof Set) return f.size > 0
    return true  // range: always active if present
  }

  /**
   * Returns true if a value on this dimension is NOT in the active filter.
   * Returns false when no filter is active on this dimension.
   *
   * @param {string} dimension
   * @param {unknown} value
   */
  function isDimmed(dimension, value) {
    const f = filters.get(dimension)
    if (!f) return false
    if (f instanceof Set) {
      return !f.has(value)
    }
    // [min, max] range
    const [lo, hi] = f
    return Number(value) < lo || Number(value) > hi
  }

  /**
   * Toggles a categorical value for a dimension.
   * Adds when absent, removes when present.
   * Clears the dimension filter when the last value is removed.
   *
   * @param {string} dimension
   * @param {unknown} value
   */
  function toggleCategorical(dimension, value) {
    toggleCategoricalInMap(filters, dimension, value)
    version++
  }

  /**
   * Sets a continuous range filter for a dimension.
   * @param {string} dimension
   * @param {[number, number]} range
   */
  function setRange(dimension, range) {
    filters.set(dimension, [range[0], range[1]])
    version++
  }

  /**
   * Clears the filter for a single dimension.
   * @param {string} dimension
   */
  function clearFilter(dimension) {
    filters.delete(dimension)
    version++
  }

  /** Clears all active filters. */
  function clearAll() {
    filters.clear()
    version++
  }

  return {
    /** @readonly — reactive Map of current filter state */
    get filters() { return filters },
    /** @readonly — increments on every mutation; read inside $effect to react to any filter change */
    get version() { return version },
    isFiltered,
    isDimmed,
    toggleCategorical,
    setRange,
    clearFilter,
    clearAll
  }
}
