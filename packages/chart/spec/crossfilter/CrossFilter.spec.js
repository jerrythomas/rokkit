import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import CrossFilter from '../../src/crossfilter/CrossFilter.svelte'

describe('CrossFilter', () => {
  it('renders without crashing', () => {
    expect(() => render(CrossFilter)).not.toThrow()
  })

  it('renders data-crossfilter container', () => {
    const { container } = render(CrossFilter)
    expect(container.querySelector('[data-crossfilter]')).toBeTruthy()
  })
})
