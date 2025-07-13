<!-- Successful validation -->
<InputField 
  name="email" 
  type="email" 
  label="Email Address" 
  value="user@example.com"
  status="pass"
  message="Valid email format"
  required
/>

<!-- Failed validation -->
<InputField 
  name="password" 
  type="password" 
  label="Password" 
  value="123"
  status="fail"
  message="Password must be at least 8 characters"
  required
/>

<!-- Warning validation -->
<InputField 
  name="username" 
  type="text" 
  label="Username" 
  value="user"
  status="warn"
  message="Username might be too short"
/>