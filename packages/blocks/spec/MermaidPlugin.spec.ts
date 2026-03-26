import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import MermaidPlugin from '../src/MermaidPlugin.svelte'

// Mock mermaid dynamic import
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg><rect/></svg>' })
  }
}))

describe('MermaidPlugin', () => {
  it('renders a mermaid container div', () => {
    const { container } = render(MermaidPlugin, { props: { code: 'graph TD; A-->B' } })
    expect(container.querySelector('[data-mermaid-block]')).toBeTruthy()
  })
})
