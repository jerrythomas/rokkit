# Rollup

The `rollup` method aggregates data based on specified grouping criteria, allowing you to compute summary statistics for each group. You can provide one or more grouping columns and specify aggregation functions to apply to each group.

## Basic Usage

You can roll up data without specifying any grouping criteria, which aggregates the entire dataset.

```javascript
const result = dataset.summarize('country', { count: counter }).rollup()
```

## Grouping by Columns

To group data by one or more columns, use the `groupBy` method before calling `rollup`.

```javascript
const result = dataset.groupBy('country').summarize('name', 'children').rollup()
```

## Aggregations

You can specify aggregation functions to compute summary statistics for each group.

```javascript
const result = dataset
  .groupBy('category')
  .summarize('price', {
    avg_price: mean,
    min_price: dataset.min('price'),
    max_price: dataset.max('price')
  })
  .rollup()
```

## Alignment and Template

You can align subgroups and use a template to fill missing values during rollup.

```javascript
const result = dataset.groupBy('date').alignBy('team').using({ score: 0, pct: 0 }).rollup()
```

## Applying Aggregators

You can apply custom aggregators to the rollup result.

```javascript
const result = dataset
  .groupBy('category')
  .summarize('price', {
    avg_price: mean,
    q1: (v) => quantile(v, 0.25),
    q3: (v) => quantile(v, 0.75)
  })
  .rollup()
  .apply(violin)
```

Rollup provides valuable insights into the distribution and characteristics of your data, allowing you to identify trends, patterns, and outliers. Experiment with different grouping criteria, aggregation functions, and alignment techniques to derive meaningful insights from your datasets.
