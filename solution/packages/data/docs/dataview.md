# DataView

The `dataview` function is a powerful tool for creating interactive views of tabular data, allowing users to sort, filter, and select rows in a structured and intuitive way. DataView organizes data into a hierarchical structure and provides methods for manipulating and interacting with this structure. Here's an overview of how to use the `dataview` function:

## Creating a Flat View

You can create a flat view of tabular data using the `dataview` function. This view presents data in a simple table format with sortable and filterable columns.

```javascript
const data = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 20 },
  { name: 'Charlie', age: 35 }
]
const view = dataview(data)
```

## Sorting and Filtering

The DataView allows users to sort rows by column and apply filters to refine the displayed data.

```javascript
view.sortBy('age')
```

## Selecting Rows

Users can select individual rows in the DataView, providing a visual indication of the selected items.

```javascript
view.select(0)
```

## Creating a Hierarchical View

In addition to flat views, DataView supports hierarchical views, where data is organized into parent-child relationships.

```javascript
const data = [
  { name: 'Smith', lineage: '/Smith', age: 90 },
  { name: 'Bob', lineage: '/Smith/Bob', age: 20 },
  { name: 'Alice', lineage: '/Smith/Alice', age: 55 }
  // Other data entries...
]
const view = dataview(data, { path: 'lineage' })
```

## Collapsing and Expanding Nodes

Hierarchical views allow users to collapse or expand nodes in the tree structure, providing a compact or detailed view of the data.

```javascript
view.toggle(0)
```

## Determining Selected State

The `determineSelectedState` function helps determine the selection state of rows in a hierarchical view, returning whether all rows are checked, unchecked, or in an indeterminate state.

```javascript
const selectedState = determineSelectedState([{ selected: 'checked' }, { selected: 'unchecked' }])
```

DataView provides a versatile and user-friendly interface for exploring and interacting with complex datasets, making it an essential tool for data analysis and visualization.
