const items = [
  {
    component: PlaceHolder,
    name: 'Dashboard',
    props: {
      content: 'Dashboard',
      class: 'bg-pink-500 h-32'
    }
  },
  {
    component: PlaceHolder,
    name: 'Analytics',
    props: { 
      content: 'Analytics', 
      class: 'bg-sky-500 h-32' 
    }
  },
  {
    component: PlaceHolder,
    name: 'Reports',
    props: {
      content: 'Reports',
      class: 'bg-teal-500 h-32'
    }
  }
]

// Usage
<ResponsiveGrid 
  {items} 
  small={false} 
  class="grid grid-cols-2 gap-4" 
/>