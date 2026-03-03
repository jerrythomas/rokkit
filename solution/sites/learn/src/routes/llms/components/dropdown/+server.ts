import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Menu Component

> Data-driven dropdown menu with keyboard navigation, grouping, and custom snippets.

The Menu component renders a trigger button that opens a dropdown list of selectable options. Supports grouped options, shortcut display, custom item snippets, and named snippet slots per item.

## Quick Start

\`\`\`svelte
<script>
  import { Menu } from '@rokkit/ui'

  const options = [
    { text: 'Edit',      value: 'edit',   icon: 'i-lucide:edit' },
    { text: 'Duplicate', value: 'dup',    icon: 'i-lucide:copy' },
    { text: 'Delete',    value: 'delete', icon: 'i-lucide:trash' }
  ]
</script>

<Menu {options} label="Actions" onselect={(v) => console.log(v)} />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`options\` | \`MenuItem[]\` | \`[]\` | Menu items array |
| \`fields\` | \`MenuFields\` | defaults | Field mapping |
| \`label\` | \`string\` | \`'Menu'\` | Trigger button label |
| \`icon\` | \`string\` | — | Trigger button icon class |
| \`showArrow\` | \`boolean\` | \`true\` | Show dropdown arrow on trigger |
| \`size\` | \`'sm'|'md'|'lg'\` | \`'md'\` | Size variant |
| \`align\` | \`'left'|'right'|'start'|'end'\` | \`'left'\` | Dropdown alignment |
| \`direction\` | \`'up'|'down'\` | \`'down'\` | Dropdown slide direction |
| \`disabled\` | \`boolean\` | \`false\` | Disable the menu |
| \`icons\` | \`MenuStateIcons\` | — | Override state icons |
| \`class\` | \`string\` | \`''\` | Additional CSS classes |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| \`value\` | \`'value'\` | Value emitted on selection |
| \`text\` | \`'text'\` | Display label |
| \`icon\` | \`'icon'\` | Icon class name |
| \`description\` | \`'description'\` | Secondary/subtitle text |
| \`shortcut\` | \`'shortcut'\` | Keyboard shortcut display |
| \`label\` | \`'label'\` | Aria-label override |
| \`disabled\` | \`'disabled'\` | Disabled state |
| \`children\` | \`'children'\` | Nested group items |
| \`snippet\` | \`'snippet'\` | Named snippet for custom rendering |

## Callbacks

| Callback | Signature | Description |
|----------|-----------|-------------|
| \`onselect\` | \`(value, item) => void\` | Item selected |

## Grouped Options

Use the \`children\` field to create groups:

\`\`\`svelte
<script>
  const options = [
    { text: 'File', children: [
      { text: 'New',  value: 'new',  icon: 'i-lucide:file-plus', shortcut: 'Ctrl+N' },
      { text: 'Open', value: 'open', icon: 'i-lucide:folder-open', shortcut: 'Ctrl+O' }
    ]},
    { text: 'Edit', children: [
      { text: 'Cut',   value: 'cut',   icon: 'i-lucide:scissors', shortcut: 'Ctrl+X' },
      { text: 'Paste', value: 'paste', icon: 'i-lucide:clipboard', shortcut: 'Ctrl+V' }
    ]}
  ]
</script>

<Menu {options} label="File" onselect={handleAction} />
\`\`\`

## Custom Item Snippet

\`\`\`svelte
<Menu {options} label="Actions">
  {#snippet item(data, fields, handlers)}
    <button onclick={handlers.onclick} onkeydown={handlers.onkeydown}
      data-menu-item>
      {#if data.icon}<span class={data.icon}></span>{/if}
      <span>{data.text}</span>
      {#if data.shortcut}<kbd>{data.shortcut}</kbd>{/if}
    </button>
  {/snippet}
</Menu>
\`\`\`

## Named Snippets per Item

Use the \`snippet\` field to assign different renderers to individual items:

\`\`\`svelte
<script>
  const options = [
    { text: 'Normal',    value: 'a' },
    { text: 'Separator', value: 'sep', snippet: 'divider' },
    { text: 'Danger',    value: 'd',   snippet: 'danger' }
  ]
</script>

<Menu {options} label="Options">
  {#snippet divider(data, fields, handlers)}
    <hr />
  {/snippet}
  {#snippet danger(data, fields, handlers)}
    <button onclick={handlers.onclick} class="text-red-500">{data.text}</button>
  {/snippet}
</Menu>
\`\`\`

## Custom Group Label

\`\`\`svelte
<Menu {options} label="Actions">
  {#snippet groupLabel(data, fields)}
    <div class="px-3 py-1 text-xs uppercase text-muted">{data.text}</div>
  {/snippet}
</Menu>
\`\`\`

## Keyboard Navigation

| Key | Action |
|-----|--------|
| \`Enter/Space\` | Open menu |
| \`ArrowDown/Up\` | Navigate items |
| \`Enter\` | Select focused item |
| \`Escape\` | Close menu |
| \`Home/End\` | First/last item |

## Data Attributes

| Attribute | Description |
|-----------|-------------|
| \`data-menu\` | Root element |
| \`data-menu-trigger\` | Trigger button |
| \`data-menu-dropdown\` | Dropdown container |
| \`data-menu-item\` | Individual item |
| \`data-menu-group\` | Group container |
| \`data-menu-group-label\` | Group header |
| \`data-open\` | Open state |

## Import

\`\`\`javascript
import { Menu } from '@rokkit/ui'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface MenuProps {
  options?: MenuItem[]
  fields?: MenuFields
  label?: string
  icon?: string
  showArrow?: boolean
  size?: 'sm' | 'md' | 'lg'
  align?: 'left' | 'right' | 'start' | 'end'
  direction?: 'up' | 'down'
  disabled?: boolean
  icons?: MenuStateIcons
  class?: string
  onselect?: (value: unknown, item: MenuItem) => void
  item?: Snippet<[MenuItem, MenuFields, MenuItemHandlers]>
  groupLabel?: Snippet<[MenuItem, MenuFields]>
}

interface MenuStateIcons {
  opened?: string  // open arrow icon
  closed?: string  // closed arrow icon
}
\`\`\`

## Related Components

- [Select](/docs/components/select/llms.txt) — form-style dropdown for value selection
- [Toolbar](/docs/components/toolbar/llms.txt) — horizontal action bar
- [FloatingActions](/docs/components/floating-actions/llms.txt) — FAB action menu
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	})
}
