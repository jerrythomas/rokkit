<script>
	// @ts-nocheck
  import { Plot } from '@rokkit/chart'
  
  const salesData = [
    { month: 'Jan', revenue: 45000, profit: 12000, department: 'Sales' },
    { month: 'Feb', revenue: 52000, profit: 15000, department: 'Sales' },
    { month: 'Mar', revenue: 48000, profit: 13500, department: 'Sales' }
  ]
  
  // Custom styling and advanced configuration
  const customLabels = {
    x: 'Month',
    y: 'Revenue ($)',
    title: 'Monthly Sales Performance'
  }
  
  const plotOptions = {
    grid: true,
    marginTop: 40,
    marginBottom: 60,
    width: 640,
    height: 400
  }
</script>

<Plot 
  data={salesData}
  x="month"
  y="revenue"
  fill="department"
  labels={customLabels}
  options={plotOptions}
  legend
/>