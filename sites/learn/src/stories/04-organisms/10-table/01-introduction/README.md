---
title: Introduction
---

The `Table` component allows you to visualize an object array in a table format. To get started you just need to provide the data.

```svelte
<script>
  import { Table } from '@rokkit/ui'
  const data = [
    { name: 'John Doe', age: 25, city: 'New York' },
    { name: 'Jane Doe', age: 22, city: 'Los Angeles' },
    { name: 'John Smith', age: 30, city: 'Chicago' }
  ]
</script>

<Table {data} />
```

The `Table` component will automatically generate the columns based on the object keys. If you want to customize the columns you can use the `columns` prop.

You can also provide caption for the table using the `caption` property.
