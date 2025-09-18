# FloatingNav Component

A floating navigation component that uses `List.svelte` to render navigation items with smooth scrollspy functionality, expand/collapse states, and pinning capability.

## Features

- **Smooth scrollspy**: Automatically highlights the active section based on scroll position
- **Expandable/Collapsible**: Hover to expand, click pin to keep open
- **Customizable positioning**: Left or right side of the screen
- **Icon support**: Display icons alongside navigation labels
- **Responsive design**: Adapts to different screen sizes
- **Accessible**: Proper ARIA labels and keyboard navigation

## Usage

```svelte
<script>
  import { FloatingNav } from '@rokkit/bits-ui'

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: 'navigate-up',
      href: '#home'
    },
    {
      id: 'features',
      label: 'Features',
      icon: 'action-search',
      href: '#features'
    },
    {
      id: 'about',
      label: 'About',
      icon: 'navigate-right',
      href: '#about'
    }
  ]

  let activeSection = $state('home')
  let isExpanded = $state(false)
  let isPinned = $state(false)

  function handleNavigate(item) {
    console.log('Navigated to:', item.label)
  }
</script>

<FloatingNav
  items={navigationItems}
  bind:activeSection
  bind:isExpanded
  bind:isPinned
  position="right"
  onNavigate={handleNavigate}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `class` | `string` | `''` | Additional CSS class names |
| `items` | `NavigationItem[]` | `[]` | Array of navigation items |
| `activeSection` | `string` | `''` | Currently active section ID (bindable) |
| `isExpanded` | `boolean` | `false` | Whether the nav is expanded (bindable) |
| `isPinned` | `boolean` | `false` | Whether the nav is pinned open (bindable) |
| `position` | `'left' \| 'right'` | `'right'` | Position of the nav |
| `icons` | `Object` | `undefined` | Custom icon overrides |
| `onNavigate` | `Function` | `undefined` | Callback when navigation item is clicked |

## NavigationItem Interface

```typescript
interface NavigationItem {
  id: string              // Unique identifier for the navigation item
  label: string           // Display text for the navigation item
  href: string            // URL or anchor link for the navigation item
  icon?: string           // Optional icon name (from defaultStateIcons)
}
```

## HTML Structure Requirements

For the scrollspy functionality to work properly, ensure your page sections have IDs that match the navigation item IDs:

```html
<section id="home">
  <h1>Home Section</h1>
</section>

<section id="features">
  <h1>Features Section</h1>
</section>

<section id="about">
  <h1>About Section</h1>
</section>
```

## Styling

The component uses Tailwind CSS classes and includes custom styles for smooth animations. You can customize the appearance by:

1. **Adding custom classes**: Pass additional classes via the `class` prop
2. **CSS variables**: Override the CSS custom properties for colors and spacing
3. **Global styles**: Target the component's CSS selectors

### Custom Styling Example

```css
.my-floating-nav {
  /* Custom positioning */
  top: 20%;
}

/* Override active state colors */
:global(.floating-nav-list [data-cmdk-item][data-selected='true']) {
  @apply bg-blue-500/10 border-blue-500/20 text-blue-600;
}
```

## Accessibility

The component includes several accessibility features:

- Proper ARIA labels for the pin/unpin button
- Keyboard navigation support through the underlying List component
- Focus management and visual indicators
- Screen reader friendly structure

## Integration with List.svelte

The FloatingNav component internally uses `List.svelte` to render navigation items, which means it inherits all the functionality and styling from the List component, including:

- Command-based navigation
- Keyboard shortcuts
- Search functionality (if enabled)
- Custom item rendering via snippets

## Advanced Usage

### Custom Item Rendering

You can customize how navigation items are rendered by modifying the component or extending the child snippet:

```svelte
<FloatingNav items={navigationItems}>
  {#snippet child(item)}
    <div class="flex items-center space-x-3">
      {#if item.get('icon')}
        <Icon name={item.get('icon')} size={20} class="text-blue-500" />
      {/if}
      <span class="font-semibold">{item.get('label')}</span>
      {#if item.get('badge')}
        <span class="badge">{item.get('badge')}</span>
      {/if}
    </div>
  {/snippet}
</FloatingNav>
```

### Scroll Offset Configuration

You can adjust the intersection observer settings for different scroll trigger points by modifying the `observerOptions` in the component.

## Browser Support

- Modern browsers with IntersectionObserver support
- Fallback gracefully degrades without scrollspy functionality
- Requires CSS Grid and Flexbox support

## Icons

The component uses the `defaultStateIcons` pattern from `@rokkit/core`. Available icons include:

- **Navigation**: `navigate-up`, `navigate-down`, `navigate-left`, `navigate-right`
- **Actions**: `action-add`, `action-remove`, `action-close`, `action-search`
- **States**: `state-success`, `state-error`, `state-warning`, `state-info`

You can override default icons by passing an `icons` prop:

```svelte
<FloatingNav
  items={navigationItems}
  icons={{
    pin: 'action-add',
    pinOff: 'action-remove',
    right: 'navigate-right'
  }}
/>
```

## Dependencies

- `List.svelte` - Core list rendering functionality
- `@rokkit/ui` - Icon component
- `@rokkit/core` - defaultStateIcons
- Tailwind CSS - Styling framework