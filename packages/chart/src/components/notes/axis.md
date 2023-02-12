# Axis

A chart typically has a horizontal (x) axis and a vertical (y) axis. The axis is heplful in showing the scale of values along either direction.

Axis tick marks and labels can be displayed in various ways depending on the range of data being plotted. Most charts have axis starting at left bottom corner with ticks and labels below the x axis line and licks and labels to left of the y axis line.

## Range

When plotting data on any axis the data range can be one of the following:

- Discrete values considered to be on the positive side
- Ranging from negative to positive
- Only negative values
- Only positive values

In case the data contains mix of positive and negative values, it might be a good idea to identify the absolute maximum value and use it as the negative and positive range. In this case the y axis will be in the center of the chart and the labels for y axis ticks may not be completely visible.

## Position

- Margin: Axis at margin of the data at minimum or maximum values
- Margin with offset: Axis offset from origin where y axis is at min x - offset or max x + offset and vice versa for y axis
- Origin: Axis is in center of the chart (0,0) and passes through both sides

## Orientation

- X Axis: Ticks and labels oriented above or below
- Y Axis: Ticks and labels oriented left or right

When at origin should ticks be centred on the axis?

## Ticks

- Count
- Values
- Formatting (millions withh m suffix or date formats)

## Calculations

Range, scale, positioning of the ticks and tick labels should be calculated on the full data, so that the plots show the same scale wven when data is filtered.

Since the axis value does not change after the chart is initialized, this information can be passed using context.
