# Renamer

The `renamer` function is a versatile utility for renaming keys in JavaScript objects, offering various options for customization. It provides methods to set prefixes, suffixes, separators, and specific keys to be renamed. Below is an overview of how to use the `renamer` function:

## Creating a Renamer

You can create a renamer object using the `renamer` function, which initializes an instance with default settings.

```javascript
const renamerInstance = renamer()
```

## Available Methods

The renamer instance exposes several methods for configuring and performing key renaming operations:

- `get`: Retrieves the current configuration of the renamer instance.
- `setPrefix`: Sets the prefix to be added to keys during renaming.
- `setSuffix`: Sets the suffix to be added to keys during renaming.
- `setKeys`: Specifies the keys that should be renamed.
- `setSeparator`: Sets the separator to be used between prefix/suffix and key during renaming.

## Renaming Keys

The `rename` method within the renamer instance allows for renaming keys based on the configured settings. Here are some examples:

```javascript
const action = renamer().get()
action.rename('b') // Output: 'b'
action.rename('c') // Output: 'c'
```

## Renaming Keys in Objects

The `renameObject` method enables renaming keys in entire objects. It applies the configured renaming rules to all keys in the provided object.

```javascript
const obj = { b: 1, c: 2 }
const action = renamer().get()
action.renameObject(obj) // Output: { b: 1, c: 2 }
```

## Renaming with Prefixes, Suffixes, and Separators

You can configure the renamer instance to add prefixes, suffixes, and separators to keys during renaming operations. Here's how to achieve this:

```javascript
let action = renamer({ prefix: 'a' }).get()
action.rename('b') // Output: 'a_b'
action.rename('c') // Output: 'a_c'

action = renamer().setSuffix('a').get()
action.rename('b') // Output: 'b_a'
action.rename('c') // Output: 'c_a'

action = renamer({ separator: '-', suffix: 'a' }).get()
action.rename('b') // Output: 'b-a'
action.rename('c') // Output: 'c-a'
```

## Renaming Specific Keys

You can specify particular keys to be renamed using the `setKeys` method. This allows for more targeted renaming operations.

```javascript
const keys = ['b', 'c']
let action = renamer({ keys }).get()
action.renameObject(obj) // Output: { b: 1, c: 2 }

action = renamer().setKeys(keys).get()
action.renameObject(obj) // Output: { b: 1, c: 2 }
```
