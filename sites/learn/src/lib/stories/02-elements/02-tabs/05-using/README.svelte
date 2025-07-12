<script>
  import StoryRoot from '$lib/components/Story/StoryRoot.svelte'
</script>

# Custom Components

Here is an example where the data is not how list expects. In the sample data below, we want to
display the `name` and `photo`.

```json
{
  "name": "Fruits",
  "photo": "/examples/fruits.jpg",
  "artist": "https://www.pexels.com/@hellojanedoan/",
  "target": "_blank'
}
```

These photos were taken from [pexels](https://pexels.com) and the artist attribute is a link to the
profile of the artist who created the image.

We want to allow the user to click on any item to visit the artist's profile. To do this we can use the `using` property. We will be combining this with the `fields` property.

```js
let using = { default: Link }
```

Try clicking on any item in the list to visit the artist's profile.

## Interactive Demo

<StoryRoot 
  slug="elements/tabs/using" 
  title="Custom Components" 
  description="Use custom components with the using property for advanced functionality"
/>