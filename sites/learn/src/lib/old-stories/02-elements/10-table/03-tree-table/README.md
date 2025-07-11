---
title: Tree Table
---

The `Table` component can be used to display hierarchical data in a tree-like structure. Use the property hierarchyField to specify the field that contains the hierarchy information. The hierarchyField should be a string that represents the key of the object that contains the hierarchy information.

The hierarchy column is placed on the left side of the table. The hierarchy column contains expand/collapse buttons that allow the user to expand or collapse the rows of the table.

In a the tree table, sorting is done within the hierarchy of the table. Children are sorted within a parent. You can see this by trying the sort on various columns. Collapse the parent and observe that the values are sorted for siblings.
