# DataSet

The `dataset` function is designed to facilitate easy manipulation and analysis of data arrays. It returns an object with various methods that allow for SQL-like operations on the data. Here's a breakdown of its functionality with examples:

## Initialization

To create a dataset, simply call the `dataset` function with an array of objects:

```javascript
import { dataset } from 'your-library'

const data = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]
const ds = dataset(data)
```

## Methods Available

The dataset object returned by `dataset` provides the following methods:

- `select()`: Returns the entire dataset.
- `where(predicate)`: Filters the dataset based on the provided predicate function.
- `union(otherDataset)`: Performs a union operation with another dataset.
- `intersect(otherDataset)`: Performs an intersection operation with another dataset.
- `minus(otherDataset)`: Performs a set difference operation with another dataset.
- `rename(mapping)`: Renames columns in the dataset using either a mapping object or a function.
- `drop(...columns)`: Drops specified columns from the dataset.
- `update(updates)`: Updates records in the dataset based on the provided updates object or function.
- `delete()`: Deletes records from the dataset based on optional conditions.
- `fillNA(fillValues)`: Fills null or undefined values in the dataset with provided values.
- `sortBy(...columns)`: Sorts the dataset based on specified columns.

Let's explore some examples of using these methods:

### Example 1: Filtering Data

```javascript
const filteredData = ds.where((row) => row.id > 1).select()
```

### Example 2: Renaming Columns

```javascript
const renamedData = ds.rename({ id: 'userID', name: 'fullName' }).select()
```

### Example 3: Updating Records

```javascript
const updatedData = ds.update({ name: 'New Name' }).select()
```

### Example 4: Sorting Data

```javascript
const sortedData = ds.sortBy('name').select()
```

### Example 5: Performing Set Operations

```javascript
const newData = [{ id: 3, name: 'Charlie' }]
const unionData = ds.union(newData).select()
const intersectData = ds.intersect(newData).select()
const minusData = ds.minus(newData).select()
```

Refer to the following additional documentation for more details on specific operations:

- [Joins](./joins.md) for more details on combining datasets.
- [Rollup](./rollup.md) for more details on summarizing data across multiple dimensions.
- [Model](./model.md) for more details on model operations.
- [Renamer](./renamer.md) documentation for more details on renaming keys in JavaScript objects.
