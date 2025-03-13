# NestedProxy

Extends ListProxy to handle hierarchical data. Navigate and manipulate tree-like structures

## Additional State Properties
  - expansionMap: Track expanded state of nodes
  - mappingConfig: Field mapping configuration

## Additional Methods

  - moveToChild(): Move to first child of current node
  - moveToParent(): Move to parent of current node
  - expand(): Expand current node
  - collapse(): Collapse current node
  - toggleExpansion(): Toggle expansion state
  - moveTo(path): Focus node at specified path
  - findPathToValue(): Find path to a specific value
  - autoExpandTo(): Expand nodes to reveal a specific node
  - getVisibleNodes(): Get flattened list of currently visible nodes
