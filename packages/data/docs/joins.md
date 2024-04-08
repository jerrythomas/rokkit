# Joins

The `dataset` function provides powerful capabilities for performing various types of joins with other datasets. Joins allow you to combine data from multiple sources based on specified conditions, enabling comprehensive data integration and analysis. Here's an overview of the join methods available:

## Inner Join

The `innerJoin` method combines rows from two datasets where there is a match based on a specified matching function. It returns only the rows that have matching values in both datasets.

```javascript
const result = datasetA.innerJoin(datasetB, (rowA, rowB) => rowA.id === rowB.id)
```

## Left Join

The `leftJoin` method combines all rows from the left dataset with the matching rows from the right dataset based on a specified matching function. If there is no match, null values are filled for the columns from the right dataset.

```javascript
const result = datasetA.leftJoin(datasetB, (rowA, rowB) => rowA.id === rowB.id)
```

## Right Join

The `rightJoin` method is similar to the left join but ensures that all rows from the right dataset are included, with matching rows from the left dataset. Null values are filled for the columns from the left dataset if there is no match.

```javascript
const result = datasetA.rightJoin(datasetB, (rowA, rowB) => rowA.id === rowB.id)
```

## Full Join

The `fullJoin` method combines all rows from both datasets, filling null values for columns from the opposite dataset if there is no match based on the specified matching function.

```javascript
const result = datasetA.fullJoin(datasetB, (rowA, rowB) => rowA.id === rowB.id)
```

## Cross Join

The `crossJoin` method generates a Cartesian product of the two datasets, combining every row from the left dataset with every row from the right dataset.

```javascript
const result = datasetA.crossJoin(datasetB)
```

## Semi Join

The `semiJoin` method returns rows from the left dataset where there is a match in the right dataset based on the specified matching function.

```javascript
const result = datasetA.semiJoin(datasetB, (rowA, rowB) => rowA.id === rowB.id)
```

## Anti Join

The `antiJoin` method returns rows from the left dataset where there is no match in the right dataset based on the specified matching function.

```javascript
const result = datasetA.antiJoin(datasetB, (rowA, rowB) => rowA.id === rowB.id)
```

## Nested Join

The `nestedJoin` method allows for nested joining, where the left and right datasets are joined based on a specified matching function.

```javascript
const result = datasetA.nestedJoin(datasetB, (rowA, rowB) => rowA.id === rowB.id)
```

These join methods provide versatile options for combining datasets and conducting comprehensive data analysis. Experiment with different join types to best suit your data integration needs.
