# Tabs Design

## Properties

- `items`: An array of tab items (string, or object).
- `fields`: a field mapping object.
- `value`: the currently selected tab item.
- `onchange`: a function to be called when the selected tab changes.
- `orientation`: the orientation of the tabs (horizontal or vertical). optional default horizontal
- `position`: the position of the tabs (before/after). optional default before
- `align`: the alignment of the tabs (start, center, end). optional default start
- `editable`: an optional boolean indicating whether the tabs can be removed/added. default false
- `icons`: an optional object with icons for remove, add.

## Structure

```svelte
<div data-tab-root data-tab-orientation="horizontal" data-tab-position="before" data-tab-align="start">
  <div data-tab-list>
     {#each items as item, index(index)}
      <div data-tab-item>
        {@render childItem(item)}
        {#if editable}
          <button data-tab-remove onclick={handleRemove}>
            <Icon name={icons.remove} />
          </button>
        {/if}
      </div>
     {/each}
     {#if editable}
      <div data-tab-item>
        <button data-tab-add onclick={handleAdd}><Icon name={icons.add} /></button>
      </div>
     {/if}
  </div>
  <div data-tab-content>
    {@render children?.()}
  </div>
</div>
```
