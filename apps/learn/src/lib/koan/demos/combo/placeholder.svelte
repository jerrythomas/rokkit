<script lang="ts">
	import { Select } from '@rokkit/ui'

	const countries = [
		'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil',
		'Canada', 'Chile', 'China', 'Colombia', 'Denmark',
		'Egypt', 'Finland', 'France', 'Germany', 'Greece',
		'India', 'Indonesia', 'Ireland', 'Israel', 'Italy',
		'Japan', 'Kenya', 'Mexico', 'Netherlands', 'New Zealand',
		'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines',
		'Poland', 'Portugal', 'South Africa', 'South Korea', 'Spain',
		'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'United Kingdom',
		'United States', 'Vietnam'
	].map((label) => ({ label, value: label.toLowerCase().replace(/\s+/g, '-') }))

	let value = $state<unknown>(null)
</script>

<Select items={countries} bind:value filterable placeholder="Type to search countries" />
