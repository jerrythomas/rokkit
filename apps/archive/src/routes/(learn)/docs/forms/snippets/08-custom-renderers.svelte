<script>
  import { FormRenderer } from '@rokkit/forms'
  import InputSwatch from './InputSwatch.svelte' // your custom component

  let data = $state({ color: 'blue' })

  const COLORS = [
    { name: 'blue',   fill: '#93c5fd', stroke: '#1d4ed8' },
    { name: 'rose',   fill: '#fda4af', stroke: '#9f1239' },
    { name: 'teal',   fill: '#5eead4', stroke: '#134e4a' },
    { name: 'amber',  fill: '#fcd34d', stroke: '#92400e' },
  ]

  const schema = {
    type: 'object',
    properties: {
      color: { type: 'string' }
    }
  }

  const layout = {
    type: 'vertical',
    elements: [
      {
        scope: '#/color',
        label: 'Color',
        props: {
          renderer: 'swatch',       // key in the renderers registry
          options: COLORS,
          fields: { label: 'name', value: 'name' },
          shape: 'circle'
        }
      }
    ]
  }
</script>

<!-- Pass custom components via the renderers prop -->
<FormRenderer bind:data {schema} {layout} renderers={{ swatch: InputSwatch }} />
