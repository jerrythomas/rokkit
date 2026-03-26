import type { Component } from 'svelte'

/**
 * A plugin that renders a fenced code block as a Svelte component.
 * The component receives { code: string } as props.
 */
export interface MarkdownPlugin {
  /** Fenced code block language to match (e.g. 'plot', 'table', 'sparkline') */
  language: string
  /** Svelte component to render the block. Receives { code: string } */
  component: Component<{ code: string }>
}
