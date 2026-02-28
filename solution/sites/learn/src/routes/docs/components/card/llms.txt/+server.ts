import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Card Component

> Data-driven card component with field mapping and link support.

The Card component displays content in a card format, supporting icons, titles, descriptions, and optional link behavior through field mapping.

## Quick Start

\`\`\`svelte
<script>
  import { Card } from '@rokkit/ui'

  let cardData = {
    icon: 'fa-solid fa-rocket',
    title: 'Getting Started',
    description: 'Learn the basics of Rokkit'
  }
</script>

<Card value={cardData} />
\`\`\`

## Core Concepts

### Data-Driven Design

Card adapts to your data structure through field mapping:

\`\`\`svelte
<script>
  const product = {
    productIcon: 'shopping-bag',
    productName: 'Premium Widget',
    productDesc: 'High-quality widget for all your needs',
    productUrl: '/products/widget'
  }

  const fields = {
    icon: 'productIcon',
    title: 'productName',
    description: 'productDesc',
    href: 'productUrl'
  }
</script>

<Card value={product} {fields} />
\`\`\`

### Link Behavior

When the data includes an \`href\` field, Card renders as a link:

\`\`\`svelte
<script>
  // This card will be a clickable link
  const linkCard = {
    title: 'Documentation',
    description: 'Read the docs',
    href: '/docs'
  }

  // This card will be a div with click handler
  const actionCard = {
    title: 'Settings',
    description: 'Configure options'
  }
</script>

<Card value={linkCard} />
<Card value={actionCard} onClick={() => openSettings()} />
\`\`\`

### Custom Rendering

Use the \`child\` snippet for custom card content:

\`\`\`svelte
<Card value={data} {fields}>
  {#snippet child(proxy)}
    <div class="custom-card">
      <img src={proxy.get('image')} alt="" />
      <h3>{proxy.get('title')}</h3>
      <p>{proxy.get('description')}</p>
      <span class="price">\${proxy.value.price}</span>
    </div>
  {/snippet}
</Card>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`object\` | \`undefined\` | Card data object (use \`bind:value\`) |
| \`fields\` | \`object\` | \`{}\` | Field mapping configuration |
| \`class\` | \`string\` | \`''\` | CSS class names |
| \`child\` | \`Snippet\` | \`undefined\` | Custom content renderer |
| \`children\` | \`Snippet\` | \`undefined\` | Alternative content |
| \`onClick\` | \`function\` | \`undefined\` | Click handler (when no href) |

## Field Mapping

Map your data fields to card expectations:

| Field | Default | Description |
|-------|---------|-------------|
| \`icon\` | \`'icon'\` | Icon class or name |
| \`title\` | \`'title'\` | Card title |
| \`description\` | \`'description'\` | Card description |
| \`href\` | \`'href'\` | Link URL (makes card clickable) |

### Field Mapping Example

\`\`\`svelte
<script>
  const article = {
    articleIcon: 'newspaper',
    headline: 'Breaking News',
    summary: 'Something important happened',
    link: '/articles/123'
  }

  const fields = {
    icon: 'articleIcon',
    title: 'headline',
    description: 'summary',
    href: 'link'
  }
</script>

<Card value={article} {fields} />
\`\`\`

## Component Structure

\`\`\`
<!-- With href (renders as link) -->
<a href="..." data-card-root>
├── <icon>              // Icon container
│   └── <i class="..."> // Icon element
├── <h1>                // Title
└── <h2>                // Description
</a>

<!-- Without href (renders as div) -->
<div data-card-root>
├── <icon>
│   └── <i class="...">
├── <h1>
└── <h2>
</div>
\`\`\`

## Data Attributes for Styling

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`data-card-root\` | a/div | Main card element |

### Styling Example

\`\`\`css
[data-card-root] {
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: var(--surface-100);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
}

[data-card-root]:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

[data-card-root] icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--primary-100);
  color: var(--primary-600);
  border-radius: 12px;
  margin-bottom: 16px;
}

[data-card-root] h1 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

[data-card-root] h2 {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
  font-weight: normal;
}
\`\`\`

## Accessibility

- Renders as \`<a>\` when href is present for proper link semantics
- Keyboard accessible via Enter key (for div variant)
- \`role="button"\` and \`tabindex\` for non-link cards

## Import

\`\`\`javascript
// Named import
import { Card } from '@rokkit/ui'

// Default import
import Card from '@rokkit/ui/card'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface CardProps {
  value?: any
  fields?: FieldMapping
  class?: string
  child?: Snippet<[Proxy]>
  children?: Snippet
  onClick?: () => void
}

interface FieldMapping {
  icon?: string
  title?: string
  description?: string
  href?: string
  [key: string]: string | undefined
}
\`\`\`

## Examples

### Basic Card

\`\`\`svelte
<script>
  import { Card } from '@rokkit/ui'

  const feature = {
    icon: 'fa-solid fa-bolt',
    title: 'Fast Performance',
    description: 'Optimized for speed and efficiency'
  }
</script>

<Card value={feature} />
\`\`\`

### Link Card

\`\`\`svelte
<script>
  import { Card } from '@rokkit/ui'

  const navItem = {
    icon: 'fa-solid fa-book',
    title: 'Documentation',
    description: 'Learn how to use our API',
    href: '/docs'
  }
</script>

<Card value={navItem} />
\`\`\`

### Card Grid

\`\`\`svelte
<script>
  import { Card } from '@rokkit/ui'

  const features = [
    { icon: 'rocket', title: 'Fast', description: 'Blazing fast performance' },
    { icon: 'shield', title: 'Secure', description: 'Enterprise-grade security' },
    { icon: 'puzzle', title: 'Flexible', description: 'Highly customizable' },
    { icon: 'heart', title: 'Loved', description: 'Built with care' }
  ]
</script>

<div class="card-grid">
  {#each features as feature}
    <Card value={feature} />
  {/each}
</div>

<style>
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
  }
</style>
\`\`\`

### Custom Card Content

\`\`\`svelte
<script>
  import { Card } from '@rokkit/ui'

  const product = {
    image: '/product.jpg',
    name: 'Premium Widget',
    price: 29.99,
    rating: 4.5
  }

  const fields = {
    title: 'name'
  }
</script>

<Card value={product} {fields}>
  {#snippet child(proxy)}
    <img src={proxy.value.image} alt={proxy.get('title')} />
    <div class="product-info">
      <h3>{proxy.get('title')}</h3>
      <div class="price">\${proxy.value.price}</div>
      <div class="rating">★ {proxy.value.rating}</div>
    </div>
  {/snippet}
</Card>
\`\`\`

### Action Card

\`\`\`svelte
<script>
  import { Card } from '@rokkit/ui'

  const action = {
    icon: 'fa-solid fa-plus',
    title: 'Create New',
    description: 'Start a new project'
  }

  function handleCreate() {
    console.log('Creating new project...')
  }
</script>

<Card value={action} onClick={handleCreate} />
\`\`\`

### Using Children Snippet

\`\`\`svelte
<script>
  import { Card } from '@rokkit/ui'
</script>

<Card>
  <h2>Custom Title</h2>
  <p>Completely custom content without data binding.</p>
  <button>Learn More</button>
</Card>
\`\`\`

## Related Components

- **Panel** - Structured container with header/body/footer
- **Item** - Simpler item display
- **List** - Display multiple items
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
