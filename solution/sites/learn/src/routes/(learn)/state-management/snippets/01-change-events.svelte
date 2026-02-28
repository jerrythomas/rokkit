<Select
  items={options}
  {fields}
  onchange={(value) => console.log('Selected:', value)}
/>

<List
  items={users}
  {fields}
  onselect={(value, proxy) => {
    console.log('Value:', value)
    console.log('Item:', proxy.value)
  }}
/>
