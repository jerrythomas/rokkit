# NodeProxy

Represents an individual node within a data structure. Provide a reference to original data with additional metadata and operations.

## State Properties

  - original: Reference to original data item
  - path: Array of indices representing path to the node
  - id: Unique identifier (derived from path or original data)
  - expanded: Boolean indicating expansion state
  - selected: Boolean indicating selection state
  - focused: Boolean indicating focus state
  - depth: Numeric depth in hierarchy
  - parent: Reference to parent NodeProxy (for navigation)
  - children: Array of child NodeProxy objects (for nested structures)
  - mapping: Reference to field mapper used for attribute resolution

## Attribute Access

  - attributes: Proxy object exposing mapped fields (text, icon, value, etc.)
  - get(fieldName): Method to retrieve mapped attributes

## Properties

  - value: Getter/setter for accessing and updating original data
  - text: Getter for display text using mapping
  - icon: Getter for node icon using mapping
  - id: Getter for unique identifier using mapping

## Methods

  - toggle(): Toggle expanded/collapsed state
  - hasChildren(): Check if node has children
  - isLeaf(): Check if node is a leaf node
  - getPath(): Get full path to node as an array
  - getKey(): Get string representation of path for use as a key
