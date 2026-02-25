import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit FloatingActions Component

> Floating action button (FAB) menu for quick access to primary actions.

The FloatingActions component provides a floating action button pattern commonly seen in mobile and material design interfaces. It displays a main trigger that expands to reveal multiple action buttons.

## Quick Start

\`\`\`svelte
<script>
  import { FloatingActions, FloatingAction } from '@rokkit/ui'
</script>

<FloatingActions>
  <FloatingAction icon="plus" label="Add Item" onclick={() => addItem()} />
  <FloatingAction icon="edit" label="Edit" onclick={() => edit()} />
  <FloatingAction icon="trash" label="Delete" onclick={() => remove()} />
</FloatingActions>
\`\`\`

## Core Concepts

### Container and Actions

FloatingActions consists of two components:
- **FloatingActions** - Container that manages position, open state, and layout
- **FloatingAction** - Individual action buttons with icon, label, and click handler

\`\`\`svelte
<FloatingActions position="bottom-right">
  <FloatingAction icon="share" label="Share" onclick={share} />
  <FloatingAction icon="bookmark" label="Save" onclick={save} />
</FloatingActions>
\`\`\`

### Open/Close Behavior

The menu opens on hover or click and closes when:
- Mouse leaves the container (hover mode)
- User presses Escape key
- User clicks outside the menu

\`\`\`svelte
<script>
  let open = $state(false)
</script>

<FloatingActions bind:open>
  <!-- Actions -->
</FloatingActions>

<p>Menu is {open ? 'open' : 'closed'}</p>
\`\`\`

## FloatingActions Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`position\` | \`string\` | \`'bottom-right'\` | Screen position |
| \`open\` | \`boolean\` | \`false\` | Open state (use \`bind:open\`) |
| \`class\` | \`string\` | \`''\` | CSS class names |
| \`children\` | \`Snippet\` | Required | FloatingAction components |

### Position Options

| Position | Description |
|----------|-------------|
| \`'bottom-right'\` | Bottom-right corner (default) |
| \`'bottom-left'\` | Bottom-left corner |
| \`'top-right'\` | Top-right corner |
| \`'top-left'\` | Top-left corner |

## FloatingAction Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`icon\` | \`string\` | Required | Icon name to display |
| \`label\` | \`string\` | \`''\` | Accessible label (shown on hover) |
| \`onclick\` | \`function\` | \`undefined\` | Click handler |
| \`class\` | \`string\` | \`''\` | CSS class names |

## Component Structure

\`\`\`
<floating-actions>
├── <fab-trigger>           // Main FAB button (opens menu)
│   └── <Icon>              // Trigger icon (plus/close)
└── <fab-menu>              // Actions container (when open)
    └── <floating-action>   // Individual action button
        ├── <Icon>          // Action icon
        └── <span>          // Action label
\`\`\`

## Keyboard Navigation

| Key | Action |
|-----|--------|
| \`Escape\` | Close the menu |
| \`Tab\` | Navigate through actions |
| \`Enter\` / \`Space\` | Activate focused action |

## Data Attributes for Styling

### FloatingActions

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`floating-actions\` | Root | Main container |
| \`fab-trigger\` | Button | Main trigger button |
| \`fab-menu\` | Container | Actions menu |
| \`data-position\` | Root | Position value |
| \`data-open\` | Root | Open state |

### FloatingAction

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`floating-action\` | Root | Action button |

### Styling Example

\`\`\`css
floating-actions {
  position: fixed;
  z-index: 1000;
}

floating-actions[data-position="bottom-right"] {
  bottom: 24px;
  right: 24px;
}

floating-actions[data-position="bottom-left"] {
  bottom: 24px;
  left: 24px;
}

floating-actions[data-position="top-right"] {
  top: 24px;
  right: 24px;
}

floating-actions[data-position="top-left"] {
  top: 24px;
  left: 24px;
}

fab-trigger {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary-500);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s, background 0.2s;
}

fab-trigger:hover {
  background: var(--primary-600);
  transform: scale(1.05);
}

fab-menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

floating-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--surface-100);
  border-radius: 24px;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: background 0.2s, transform 0.2s;
}

floating-action:hover {
  background: var(--surface-200);
  transform: translateX(-4px);
}

floating-action span {
  white-space: nowrap;
}
\`\`\`

## Import

\`\`\`javascript
// Named imports
import { FloatingActions, FloatingAction } from '@rokkit/ui'

// Default imports
import FloatingActions from '@rokkit/ui/floating-actions'
import FloatingAction from '@rokkit/ui/floating-action'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface FloatingActionsProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  open?: boolean
  class?: string
  children: Snippet
}

interface FloatingActionProps {
  icon: string
  label?: string
  onclick?: () => void
  class?: string
}
\`\`\`

## Examples

### Basic FAB Menu

\`\`\`svelte
<script>
  import { FloatingActions, FloatingAction } from '@rokkit/ui'

  function addNote() { /* ... */ }
  function addPhoto() { /* ... */ }
  function addTask() { /* ... */ }
</script>

<FloatingActions>
  <FloatingAction icon="note" label="New Note" onclick={addNote} />
  <FloatingAction icon="camera" label="Add Photo" onclick={addPhoto} />
  <FloatingAction icon="check" label="New Task" onclick={addTask} />
</FloatingActions>
\`\`\`

### Different Positions

\`\`\`svelte
<!-- Bottom-right (default) -->
<FloatingActions position="bottom-right">
  <FloatingAction icon="plus" onclick={add} />
</FloatingActions>

<!-- Bottom-left -->
<FloatingActions position="bottom-left">
  <FloatingAction icon="menu" onclick={openMenu} />
</FloatingActions>

<!-- Top-right -->
<FloatingActions position="top-right">
  <FloatingAction icon="settings" onclick={openSettings} />
</FloatingActions>
\`\`\`

### Controlled Open State

\`\`\`svelte
<script>
  import { FloatingActions, FloatingAction } from '@rokkit/ui'

  let fabOpen = $state(false)

  function closeAndAction(action) {
    action()
    fabOpen = false
  }
</script>

<FloatingActions bind:open={fabOpen}>
  <FloatingAction
    icon="share"
    label="Share"
    onclick={() => closeAndAction(share)}
  />
  <FloatingAction
    icon="copy"
    label="Copy Link"
    onclick={() => closeAndAction(copyLink)}
  />
</FloatingActions>
\`\`\`

### Conditional Actions

\`\`\`svelte
<script>
  import { FloatingActions, FloatingAction } from '@rokkit/ui'

  let { canEdit, canDelete, isAdmin } = $props()
</script>

<FloatingActions>
  <FloatingAction icon="plus" label="Add" onclick={add} />

  {#if canEdit}
    <FloatingAction icon="edit" label="Edit" onclick={edit} />
  {/if}

  {#if canDelete}
    <FloatingAction icon="trash" label="Delete" onclick={remove} />
  {/if}

  {#if isAdmin}
    <FloatingAction icon="settings" label="Settings" onclick={settings} />
  {/if}
</FloatingActions>
\`\`\`

### With Navigation

\`\`\`svelte
<script>
  import { FloatingActions, FloatingAction } from '@rokkit/ui'
  import { goto } from '$app/navigation'
</script>

<FloatingActions position="bottom-right">
  <FloatingAction
    icon="home"
    label="Home"
    onclick={() => goto('/')}
  />
  <FloatingAction
    icon="user"
    label="Profile"
    onclick={() => goto('/profile')}
  />
  <FloatingAction
    icon="help"
    label="Help"
    onclick={() => goto('/help')}
  />
</FloatingActions>
\`\`\`

### Social Share Menu

\`\`\`svelte
<script>
  import { FloatingActions, FloatingAction } from '@rokkit/ui'

  const pageUrl = $page.url.href

  function shareTwitter() {
    window.open(\`https://twitter.com/intent/tweet?url=\${pageUrl}\`)
  }

  function shareFacebook() {
    window.open(\`https://facebook.com/sharer/sharer.php?u=\${pageUrl}\`)
  }

  function shareLinkedIn() {
    window.open(\`https://linkedin.com/sharing/share-offsite/?url=\${pageUrl}\`)
  }

  function copyLink() {
    navigator.clipboard.writeText(pageUrl)
  }
</script>

<FloatingActions>
  <FloatingAction icon="twitter" label="Twitter" onclick={shareTwitter} />
  <FloatingAction icon="facebook" label="Facebook" onclick={shareFacebook} />
  <FloatingAction icon="linkedin" label="LinkedIn" onclick={shareLinkedIn} />
  <FloatingAction icon="link" label="Copy Link" onclick={copyLink} />
</FloatingActions>
\`\`\`

### With Animation

\`\`\`svelte
<script>
  import { FloatingActions, FloatingAction } from '@rokkit/ui'
  import { fly, fade } from 'svelte/transition'
</script>

<FloatingActions>
  {#each actions as action, i}
    <div
      in:fly={{ y: 20, delay: i * 50 }}
      out:fade={{ duration: 100 }}
    >
      <FloatingAction
        icon={action.icon}
        label={action.label}
        onclick={action.handler}
      />
    </div>
  {/each}
</FloatingActions>
\`\`\`

## Accessibility

- Main trigger has \`aria-expanded\` indicating open state
- Actions have \`aria-label\` from the label prop
- Focus is trapped within the menu when open
- Escape key closes the menu
- Screen readers announce the menu state

## Best Practices

1. **Limit actions** - Keep to 3-6 actions for usability
2. **Primary action first** - Most important action at top
3. **Clear icons** - Use recognizable, meaningful icons
4. **Descriptive labels** - Labels should clearly describe the action
5. **Consistent position** - Keep FAB in same position throughout app

## Related Components

- **Button** - Standard button component
- **Icon** - Icon rendering
- **Panel** - Container component for structured layouts
- **Dropdown** - Alternative menu pattern
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
