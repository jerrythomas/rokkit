# D3 Charts for Svelte

The core idea behind the implementation is to use the respective strengths of both D3 and Svelte to build Themable, Composable, Animated, Responsive, Accessible, and Reactive Data Visualization components.

- [D3](https://d3js.org/) makes working with SVG a breeze. It provides a large set of utility functions for graph visualization that includes the computation of scales, interpolation, shapes, and more.
- [Svelte](https://svelte.dev/) makes UI development fun again. It provides modularization, interactivity, reactivity, and responsiveness.

This component library borrows concepts from the following articles, products, and repositories.

- [Introduction to Accessible Contrast and Color for Data Visualization](https://observablehq.com/@frankelavsky/chartability-contrast-series) by [Frank Elavsky](https://observablehq.com/@frankelavsky)
- [Animated, Responsive, and Reactive Data Visualization with Svelte](https://www.infoq.com/news/2020/10/svelte-d3-animation-data-vis/)
- [Barchart Race using Svelte & D3](https://t.co/iIoJw4f7Jc?amp=1) by [Amelia Wattenberger](https://mobile.twitter.com/Wattenberger) & [Russell Goldenberg](https://mobile.twitter.com/codenberg)
- [The D3.js Graph Gallery](https://www.d3-graph-gallery.com/index.html)
- [DC.js](https://dc-js.github.io/dc.js/) is an awesome implementation of interactive animated charts using D3.

## Getting Started

Get started quickly using [degit](https://github.com/Rich-Harris/degit).

```bash
degit jerrythomas/sparsh-ui/sites/playground my-app
```

## Features

- [x] Fill patterns
- [x] Symbols
- [x] Colors
- [ ] Themes

### Plots

- [x] Box
- [ ] Violin
- [x] Scatter
- [ ] Line
- [ ] Histogram
- [ ] StackedBar
- [ ] Funnel

### Chart

- [x] Axis
  - [x] Labels
  - [x] Grid
  - [x] Ticks
- [ ] Margins
- [ ] Legend
- [ ] Composable
- [ ] Facet Grid
- [ ] Combine multiple plots
- [ ] Animation
- [ ] Time lapse
  - [ ] Sliding window
  - [ ] Rolling window
