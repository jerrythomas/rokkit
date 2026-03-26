<script>
	// @ts-nocheck
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { Code } from '@rokkit/ui'
</script>

<article data-article-root>
	<p>
		PaletteManager provides an interactive color palette editor for managing theme color mappings.
		Select from predefined palettes or customize individual color roles with Tailwind color options.
	</p>

	<h2>Quick Start</h2>
	<Code
		lang="svelte"
		code={`<script>
  import { List, Select } from '@rokkit/ui'
  import { defaultRoles, getShades, getTailwindColorNames, tailwindColors } from '@rokkit/ui'

  const palettes = [
    {
      name: 'Default',
      mapping: { primary: 'orange', secondary: 'pink', accent: 'sky', surface: 'slate',
                 success: 'green', warning: 'amber', danger: 'red', info: 'cyan' }
    }
  ]
</script>

<!-- Build your own palette editor using List + Select + color utilities -->`}
	/>
</article>
