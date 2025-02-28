---
title: Connector
---

The Connector component is a versatile utility that helps display connecting lines in nested tree views. In this tutorial, we will explore the four types of connectors - 'last', 'child', 'sibling', and 'empty' - and how to use them with the optional right-to-left (RTL) support.

## Connector Types

The Connector component has four types of connectors, which can be used according to the specific requirements of your tree view:

1. **last**: Use this type for the last item in a branch.
2. **child**: Use this type for an item that has at least one child.
3. **sibling**: Use this type for an item that has a sibling below it.
4. **empty**: Use this type for a space in the tree view.

To use a specific connector type, pass the `type` prop to the Connector component:

```svelte
<Connector type="last" />
<Connector type="child" />
<Connector type="sibling" />
<Connector type="empty" />
```

## RTL Support

The Connector component also supports right-to-left (RTL) layouts, which can be enabled by setting the `rtl` prop to `true`:

```svelte
<Connector type="last" rtl={true} />
<Connector type="child" rtl={true} />
<Connector type="sibling" rtl={true} />
<Connector type="empty" rtl={true} />
```

This component is used in the Nested List and Tree components.
