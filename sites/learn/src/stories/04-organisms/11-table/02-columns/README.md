---
title: Columns
---

You can customize the columns of the `Table` component by using the `columns` prop. The `columns` prop is an array of objects where each object represents a column. The object can have the following properties:

- name: The name of the column. This is the key of the object that will be displayed in the column.
- sortable: A boolean value that indicates if the column is sortable. The default value is `false`.
- label: The label of the column. This is the text that will be displayed in the header of the column.
- formatter: A function that formats the value of the column. The function receives the value of the column and should return the formatted value.

You can exclude columns from the table by not including them in the `columns` array.

```svelte
<script>
  const columns = [
    { name: 'name', label: 'Person', sortable: true },
    { name: 'city', label: 'Residing in' },
    { name: 'gender', label: 'Gender', formatter: (value) => (value === 'M' ? 'Male' : 'Female') }
  ]
</script>
```

In the example you can see that the `name` and `city` columns are displayed as they are in the data array. The `gender` column is formatted using the `formatter` function. The `formatter` function checks if the value is `M` and returns `Male` if it is, otherwise it returns `Female`.

Sorting is enabled only on the `name` column. The `city` and `gender` columns are not sortable.
