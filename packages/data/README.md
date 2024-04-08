# @rokkit/data

This package provides a set of tools for managing and manipulating data in user interfaces. It is framework agnostic and can be used with any ui framework.

## Features

- **Datasets:** Manage and manipulate datasets with ease
  - filtering, sorting, and aggregation.
  - **Joins:** Combine datasets effortlessly with support for inner, outer, left, and right joins.
  - **Rollup:** Summarize data across multiple dimensions, calculating aggregate statistics like sum, average, min, and max.
- **Modeling:** Create and manage data models, including merging, renaming, and resolving conflicts.
- **Renaming:** Simplify key renaming in JavaScript objects, with options for prefixes, suffixes, and custom separators.
- **Dataviews:** Create interactive views for exploring and analyzing datasets, including sortable and filterable columns.

## Dataset

- The `dataset` function initializes a dataset from an array of objects.
- This dataset comprises data rows that are sortable, filterable, and groupable.
- Leverage dataset for SQL-like operations such as selecting, updating, and deleting rows.
- Employ aggregate functions like sum, average, and count for summarizing multiple attributes of the data.
- Utilize the dataset for various data operations like joining and merging data from disparate sources.
- Establish connected data views with joins to visualize data relationships, particularly for tracking parent-child connections.

This makes it easier to build a tweenable data structure for animations. Here is an example of how to use the `dataset` to generate a tweenable data:

```js
function tweenable(data, by, group, template) {
  return dataset(data)
    .groupBy(by)
    .using(template)
    .alignBy(...group)
    .rollup()
    .sortBy(by)
    .select()
}
```

Refer to [dataset](docs/dataset.md) documentation for more details.

## DataView

- Utilize the `dataview` function to create a data view, enabling dynamic data manipulation and observation.
- This view facilitates sorting, filtering, and grouping data while providing insight into selected or hidden rows.
- The original dataset remains untouched while the view offers flexible data presentation options.
- Associate actions such as select, edit, and delete with data rows using action columns within the view.
- Manage data effectively, including parent-child links, even within a flat array structure.

Refer to [dataview](docs/dataview.md) documentation for more details.

The `dataview` function initializes a manageable data state with methods that allow for manipulation and observation of data changes, integrating smoothly with UI updates.
