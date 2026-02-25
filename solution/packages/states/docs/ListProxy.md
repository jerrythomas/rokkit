# ListProxy

Manages a flat list of nodes.Handle single-level data structures with selection and focus

## State Properties

- data: Original data array
- nodes: Array of NodeProxy objects
- currentNode: Currently focused node
- selectedNodes: Map of selected nodes

## Methods

- moveNext(): Focus next node in list
- movePrev(): Focus previous node in list
- select(): Select current node
- extendSelection(): Toggle selection on current node (for multi-select)
- findByValue(): Locate node by value
- reset(): Reset selection state
- update(): Update underlying data
