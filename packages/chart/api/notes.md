# Hierarchy

- A page can contain multiple charts.
- Each chart can include one or more plots and optional axis & labels.
- Legends can potentially be shared by multiple charts, provided they use the same attributes for plotting.
- Plots can be used to highlight data points of one attribute by using a highlight color with grays for the remaining attributes.

Timelapse should be a function on its own. By separating Timelapse as a separate function, we can apply the same before plotting and let the charts focus purely on the data needed for the plotting.

Each chart should have its own reference to data and calculate the scales. This can be done using the table function or a separate chart function. The data and scales will be passed via the context store to its slot components.

Plots will also have reference to the chart data and scales. A plot will use the plot function to aggregate data for plotting.

A page wrapper can be used to combine everything together. Page wrappers can control the filters. Filters defined as functions will be easier to use across the app.

Page > Timelapse > Chart > Plot

Plots can emit events like click and drag allowing this to be used for setting other attributes shared by the page.

Page attributes

- [ ] Palette
- [ ] Pattern
- [ ] Filters
- [ ] Highlight
- [ ] Symbols
- [ ] Styles
- [ ] Timelapse
- [ ] Aesthetics Mapping

Page Composed of

- [ ] Chart
- [ ] Legend

Chart attributes

- [ ] Data
- [ ] Scales
- [ ] Aesthetics Mapping

Charts composed of

- [ ] Axis
- [ ] Labels
- [ ] Title
- [ ] Plots

Plot attributes

- [ ] Data
- [ ] Aggregations
- [ ] Aesthetics Mapping? This should be same as chart . Is there a reason to override? Unless multiple plots are embedded into one.

Plot Types

- [ ] Box
- [ ] Violin
- [ ] Bar
- [ ] Line
- [ ] Scatter (this should be optionally embedded in box and violin in plots or combined with them)
- [ ] Funnel
- [ ] Area
- [ ] Heatmap
- [ ] Stacked variants

## Timelapse

- A timelapse chart would show variation in chart by one of the fields which would usually be a date type field.
- A race chart would be similar to a timelapse chart, however a race needs a rank attribute or a ranking approach to be applied to the data.
- Calculations should ideally be done before the data is supplied to the plot

## Race

- time: the time field
- orient: horizontal/vertical
- group: grouping attribute
- value: value attribute
- stat: stat to be applied
- limit: visible ranks limit

To ensure that race works using svelte's builtin tween function we need to ensure that

- data is first grouped by time and sorted by time
- sub group by 'group' attr ( this is required to keep the same group in same place for the tweening to work)
- aggregate 'value' field based on 'stat' (min, max, sum)
- calculate 'rank' based on the aggregated value. This should be optional for a timelapse.
- add missing values (group) with default values for the stat & rank
- sort by the 'group'
- rank attribute should be used to set positions of the bars and the value to be used for size.

This data can now be used for a bar chart race.

The difference between a bar chart race and a timelapse will be that in a timelapse chart the positions should be based on the 'group' attribute and not on the 'rank' attribute. In a race you can set a limit to the number of items based on rank. In a timelapse there would be no limit.

A timelapse chart can be used for any chart. It should be fairly easy to implement it for a bar chart. It will be much more complex when trying to implement it for a scatter plot.

A scatter plot consists of multiple points. The number of points can vary by time with arrivals and exits. Tweening expects arrays to have same size across the different stages of the timelapse. The challenge will be to seamlessly add fillers which have default values (maybe mean/avg of the data set) which is added as a filler. Fillers should ideally not be plotted. tweening does not allow for text values to identify filler attributes. maybe boolean will work. Arrival, Departure? Question is how to identify arrivals and departures in a data set?

// Input will be an array of values, having a unique key attribute or a group attribute
// in case of charts that are based on summarized data
//
//
// 1. Find unique id's
// 2. Group by keyframe key
// 3. For each frame add dummy row for missing key, if key exists in previous row copy over the key data to next frame

// each chart type requires a different aggregation
// 1: we group by keyframe
// 2: (if agg metric) we group by and aggregate using the group key
// 3: impute missing values (defaults need to be identified for each type)
// 4: impute should carry over values from previous frame (applies to most cases where )
// 5: sort by grouping key to ensure consistency in case of animations
//
// Sorting is optional when keyframes are not present

// let kf = chart(data)
// .aes(x, y, value, fill, color)
// .timelapse(time, group)
// .compute()
// .keyframes()

// let d = tweened(kf[0], { delay: 0, duration: 200, easing: cubicOut })

// TimerComponent()
// timer(kf.length, inderval)

// // timelapse with aggregation may need to rely on the grouped data coming from db
