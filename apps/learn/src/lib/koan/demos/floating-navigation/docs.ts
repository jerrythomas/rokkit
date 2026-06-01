export const floatingNavigationDocs = `## Edge-anchored section navigator

FloatingNavigation is a column (or row) of dots that anchors to a
screen edge, expands on hover to reveal section labels, and uses
IntersectionObserver to track which section is currently in view —
all without taking layout space until the user reaches for it.

## Basic example

\`\`\`svelte
<script>
  import { FloatingNavigation } from '@rokkit/ui'

  const items = [
    { label: 'Introduction', value: 'intro', icon: 'i-glyph:book', href: '#intro' },
    { label: 'Features',     value: 'features', icon: 'i-glyph:star', href: '#features' },
    { label: 'Contact',      value: 'contact', icon: 'i-glyph:letter', href: '#contact' }
  ]
</script>

<FloatingNavigation {items} value="intro" position="right" />
\`\`\`

Each item's \`href\` points at a DOM id; clicking smooth-scrolls to
that target. If \`href\` is omitted, the component falls back to
\`document.getElementById(value)\`.

## Pin

\`pinned\` (bindable) controls whether the nav stays expanded. By
default it collapses to a thin rail and expands on hover; pinning
keeps it open. \`onpinchange\` fires on toggle so you can persist the
preference.

## Observer

\`observe={true}\` (default) sets up an IntersectionObserver across
the target elements, syncing \`value\` to whichever section is
currently in view. \`observerOptions\` lets you tune the trigger band
— defaults to \`rootMargin: '-20% 0px -70% 0px'\` so a section is
considered active when it crosses the upper third of the viewport.

## Position

\`position\` chooses the screen edge — \`right\` (default), \`left\`,
\`top\`, or \`bottom\`. Top/bottom positions render the nav
horizontally instead of as a vertical column.
`
