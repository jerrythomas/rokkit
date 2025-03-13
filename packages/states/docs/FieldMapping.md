# Field Mapping System

Manages how different data structures map to a standard format.

## Default Mapping

  - id: Field containing unique identifier
  - text: Field containing display text
  - value: Field containing actual value
  - children: Field containing child nodes
  - icon: Field containing icon information
  - isOpen: Field tracking expansion state
  - isSelected: Field tracking selection state

## Level-Specific Mapping

  - Allows different mappings based on node depth
  - Falls back to default mapping when level-specific mapping is not provided

## Attribute Resolution Methods

  - getTextFor(node): Get display text for node
  - getIconFor(node): Get icon for node
  - getValueFor(node): Get value for node
  - getChildrenFor(node): Get children for node
  - hasAttributeFor(node, attr): Check if node has specific attribute
