import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import SparklinePlugin from '../src/SparklinePlugin.svelte'

const validSpec = JSON.stringify({
  data: [10, 20, 15, 30],
  type: 'line'
})

describe('SparklinePlugin', () => {
  it('renders an SVG', () => {
    const { container } = render(SparklinePlugin, { props: { code: validSpec } })
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders error badge for invalid JSON', () => {
    const { container } = render(SparklinePlugin, { props: { code: 'bad' } })
    expect(container.querySelector('[data-block-error]')).toBeTruthy()
  })
})
