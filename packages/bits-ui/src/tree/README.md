# Tree Component

A composable tree component system for building tree/hierarchy interfaces with nested items.

## Features

- Composable components for maximum flexibility
- Support for multi-selection
- Auto-close siblings option
- Customizable node rendering
- Header/footer support
- Empty state handling

## Structure

```svelte
<Tree.Root>
  <Tree.Viewport>
    <Tree.NodeList>
      <Tree.Node >
        <Tree.Item >
          Item 1
        </Tree.Item>
        <Tree.NodeList>
          <Tree.Node >
            <Tree.Item>
              Item 1.1
            </Tree.Item>
          </Tree.Node>
          <Tree.Node >
            <Tree.Item>
              Item 1.2
            </Tree.Item>
          </Tree.Node>
          <Tree.Node >
            <Tree.Item>
              Item 1.3
            </Tree.Item>
          </Tree.Node>
        </Tree.NodeList>
      </Tree.Node>
      <Tree.Node>
        <Tree.Item>
          Item 2
        </Tree.Item>
      </Tree.Node>
    </Tree.NodeList>
  </Tree.Viewport>
</Tree.Root>
```
