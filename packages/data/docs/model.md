# Model

The `model` function provides a versatile set of methods for deriving and manipulating data models. With `model`, you can easily generate models from data, merge models, handle conflicts, and perform deep scans to infer data types. Here's an overview of how to use the `model` function:

## Basic Usage

The `model` function returns an object with several methods:

- `get`: Retrieves the current state of the model.
- `clone`: Creates a deep copy of the model.
- `renameUsing`: Applies a function to rename model attributes.
- `from`: Initializes the model with data.
- `merge`: Merges the model with another model.

```javascript
const first = model()
const second = model().from([{ id: 1 }])
const merged = first.merge(second)
```

## Deriving Models from Data

You can initialize a model with data using the `from` method. The `from` method accepts an array of objects or a single object and infers the data types of attributes.

```javascript
const first = model().from([{ id: 1 }, { name: 'Alpha' }])
```

## Deep Scan

You can perform a deep scan to infer data types by enabling the `useDeepScan` method. This method analyzes the entire data set to determine attribute types.

```javascript
const first = model().from([{ name: 'Alpha' }, { id: 1 }], true)
```

## Merging Models

You can merge multiple models together using the `merge` method. When merging, the `merge` method handles conflicts between attribute names and types.

```javascript
const first = model().from([{ name: 'Alpha' }])
const second = model().from([{ id: 1 }])
const merged = first.merge(second)
```

## Handling Conflicts

When merging models with conflicting attribute names or types, you can specify how conflicts are resolved using the `merge` method.

```javascript
const first = model().from([{ id: 'Alpha', name: 'Alpha' }])
const second = model().from([{ id: 1, name: 'Beta' }])
const merged = first.merge(second, true)
```

Model provides a flexible and intuitive way to define and manipulate data structures, making it easier to work with diverse datasets and schemas.
