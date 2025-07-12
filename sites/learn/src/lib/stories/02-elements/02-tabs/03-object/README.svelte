<script>
  import StoryRoot from '$lib/components/Story/StoryRoot.svelte'
</script>

# Custom Data

Here's another example that uses an array of objects. The list uses the Text component to render options. The List expects a `text` attribute on each option. Optionally an `image` or `icon` attribute can be provided for each option.

In this example, the value attribute has been included. Click on any option in the list to see the data
of the selected option.

## Properties

- **options**: Supply the data for the list
- **fields**: Adapt to your data by customizing the fields
- **using**: An object containing components to be used for displaying data. Uses the Text component by default.
- **value**: Current selected value of the list
- **class**: Set custom class for style overrides

## Interactive Demo

<StoryRoot 
  slug="elements/tabs/object" 
  title="Object Data Tabs" 
  description="Tabs with object data containing text and image attributes"
/>