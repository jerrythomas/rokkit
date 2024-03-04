---
title: Introduction
---

# {title}

The Plot component is a Svelte wrapper around the [@observablehq/plot](https://github.com/observablehq/plot) library, providing an easy and efficient way to create interactive and customizable plots in your Svelte applications.

## Usage

Here's an example of how you can use the Rocket Plot component:

```svelte
<script>
  import { Plot } from '@rokkit/chart'
  import { data } from './cars.js'

  const labels = {
    x: 'Economy',
    y: 'Horsepower'
  }
</script>

<Plot {data} x="mpg" y="hp" stroke="mpg" symbol="mpg" legend {labels} />
```

In the above example:

- `Plot` is the Plot component.
- `data` is the dataset you want to visualize, typically an array of objects.
- `x` and `y` specify the columns from your dataset to be plotted on the x and y axes, respectively.
- `stroke` and `symbol` specify how data points will be styled.
- `legend` enables the display of a legend.
- `labels` is an object containing labels for the x and y axes.
