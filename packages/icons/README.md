# Icons

Add icons to your svelte/svelte-kit apps.

- Specify the icon by name or by component
- Select only the icons you need
- Add custom icon sets
- Choose custom sizes
- Supports click & focus events
- Apply custom classes

```svelte
<script>
import { Icon, iconStore } from '@sparsh-ui/icons'
import * as icons from '@sparsh-ui/icons/heroicons/outline'

$: $iconStore.set(icons)
</script>

<Icon name="chevron-up" />
<Icon icon={icons.ChevronUp} name="Up" />
<Icon icon={icons.ChevronUp} name="Up" />
```

## Includes

- Outline and Filled variants of [heroicons](https://heroicons.com) created by [@steveschoger](https://twitter.com/intent/tweet?text=Check%20out%20Heroicons%20by%20%40steveschoger%20and%20the%20%40tailwindcss%20team%20%F0%9F%98%8D&url=https%3A%2F%2Fheroicons.com)
