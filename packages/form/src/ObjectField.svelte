<script>
	import { omit } from 'ramda'
	import FormField  from './FormField.svelte'
  import FieldLayout  from './FieldLayout.svelte'

	export let data
	export let schema
	export let using
</script>


  <FieldLayout class={schema.layout}>
		  {#each Object.entries(schema.properties) as [key, value]}
			{@const component = using[value.widget]}
			{@const props = omit(['widget'], value)}
			  <FormField {component} bind:data={data[key]} {...props} />
			{/each}
	</FieldLayout>