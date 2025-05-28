<script>
  let {
    layout = {},
    fieldSchema = {},
    value = $bindable(null),
    error = null,
    onchange = $bindable(null)
  } = $props();
  
  // Extract field properties
  let fieldType = $derived(layout.type || fieldSchema.type || 'text');
  let fieldLabel = $derived(layout.label || '');
  let fieldKey = $derived(layout.key || '');
  let fieldId = $derived(layout.id || fieldKey || 'field-' + Math.random().toString(36).substring(2, 9));
  let fieldPlaceholder = $derived(layout.placeholder || '');
  let fieldHelpText = $derived(layout.helpText || layout.help || '');
  let fieldRequired = $derived(layout.required === true || (fieldSchema.required && fieldSchema.required.includes(fieldKey)));
  let fieldReadonly = $derived(layout.readonly === true);
  let fieldDisabled = $derived(layout.disabled === true);
  
  // Handle input properties based on schema
  let inputProps = $derived(() => {
    const props = {};
    
    // Add basic props
    props.type = mapTypeToInputType(fieldType);
    props.id = fieldId;
    props.name = fieldKey;
    props.placeholder = fieldPlaceholder;
    props.required = fieldRequired;
    props.readonly = fieldReadonly;
    props.disabled = fieldDisabled;
    
    // Add schema-based constraints
    if (fieldSchema) {
      if (fieldSchema.min !== undefined) props.min = fieldSchema.min;
      if (fieldSchema.max !== undefined) props.max = fieldSchema.max;
      if (fieldSchema.step !== undefined) props.step = fieldSchema.step;
      if (fieldSchema.pattern !== undefined) props.pattern = fieldSchema.pattern;
      if (fieldSchema.minLength !== undefined) props.minLength = fieldSchema.minLength;
      if (fieldSchema.maxLength !== undefined) props.maxLength = fieldSchema.maxLength;
    }
    
    return props;
  });
  
  // Map schema type to HTML input type
  function mapTypeToInputType(type) {
    const typeMap = {
      string: 'text',
      number: 'number',
      integer: 'number',
      boolean: 'checkbox',
      date: 'date',
      time: 'time',
      'datetime-local': 'datetime-local',
      email: 'email',
      url: 'url',
      tel: 'tel',
      password: 'password',
      color: 'color',
      file: 'file',
      range: 'range',
      month: 'month',
      week: 'week',
      textarea: 'textarea',
      select: 'select',
      'radio-group': 'radio',
      'checkbox-group': 'checkbox'
    };
    
    return typeMap[type] || 'text';
  }
  
  // Get input options for select, radio, etc.
  let options = $derived(() => {
    if (fieldSchema.enum) {
      return fieldSchema.enum.map(item => ({ value: item, label: item }));
    }
    return layout.options || [];
  });
  
  // Handle value changes
  function handleChange() {
    onchange?.();
  }
  
  // Handle specific input types
  function handleCheckboxChange(e) {
    value = e.target.checked;
    handleChange();
  }
  
  function handleMultiSelectChange(e) {
    const selected = Array.from(e.target.options)
      .filter(option => option.selected)
      .map(option => option.value);
    value = selected;
    handleChange();
  }
</script>

<div 
  data-input-field
  data-field-type={fieldType}
  data-field-id={fieldId}
  data-field-key={fieldKey}
  data-error={error ? "true" : "false"}
  data-required={fieldRequired ? "true" : "false"}
  data-disabled={fieldDisabled ? "true" : "false"}
  data-readonly={fieldReadonly ? "true" : "false"}
>
  {#if fieldType !== 'checkbox' && fieldType !== 'switch' && fieldLabel}
    <label 
      for={fieldId} 
      data-field-label
    >
      {fieldLabel}
      {#if fieldRequired}
        <span data-required-indicator>*</span>
      {/if}
    </label>
  {/if}
  
  <div data-field-input-container>
    {#if fieldType === 'textarea'}
      <textarea 
        {...inputProps}
        bind:value
        rows={layout.rows || 3}
        onchange={handleChange}
        data-field-input
      ></textarea>
    {:else if fieldType === 'select'}
      <select 
        {...inputProps}
        bind:value
        onchange={handleChange}
        data-field-input
        multiple={layout.multiple}
      >
        {#each options as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    {:else if fieldType === 'radio-group'}
      <div data-radio-group>
        {#each options as option}
          <label data-radio-option>
            <input
              type="radio"
              name={fieldId}
              value={option.value}
              checked={value === option.value}
              onchange={() => { value = option.value; handleChange(); }}
              disabled={fieldDisabled}
              data-field-input
            />
            <span data-option-label>{option.label}</span>
          </label>
        {/each}
      </div>
    {:else if fieldType === 'checkbox-group'}
      <div data-checkbox-group>
        {#each options as option}
          {@const isChecked = Array.isArray(value) && value.includes(option.value)}
          <label data-checkbox-option>
            <input
              type="checkbox"
              name={`${fieldId}[${option.value}]`}
              value={option.value}
              checked={isChecked}
              onchange={(e) => {
                if (!Array.isArray(value)) value = [];
                if (e.target.checked) {
                  value = [...value, option.value];
                } else {
                  value = value.filter(v => v !== option.value);
                }
                handleChange();
              }}
              disabled={fieldDisabled}
              data-field-input
            />
            <span data-option-label>{option.label}</span>
          </label>
        {/each}
      </div>
    {:else if fieldType === 'checkbox'}
      <label data-checkbox-container>
        <input
          {...inputProps}
          type="checkbox"
          checked={!!value}
          onchange={handleCheckboxChange}
          data-field-input
        />
        {#if fieldLabel}
          <span data-field-label>
            {fieldLabel}
            {#if fieldRequired}
              <span data-required-indicator>*</span>
            {/if}
          </span>
        {/if}
      </label>
    {:else if fieldType === 'range'}
      <div data-range-container>
        <input
          {...inputProps}
          type="range"
          bind:value
          onchange={handleChange}
          oninput={handleChange}
          data-field-input
        />
        {#if layout.marks && Array.isArray(layout.marks)}
          <div data-range-marks>
            {#each layout.marks as mark}
              <span 
                data-range-mark 
                style={`left: ${((mark.value - (inputProps.min || 0)) / ((inputProps.max || 100) - (inputProps.min || 0)) * 100)}%`}
              >
                <span data-mark-label>{mark.label}</span>
              </span>
            {/each}
          </div>
        {/if}
        <div data-range-value>{value}</div>
      </div>
    {:else}
      <input
        {...inputProps}
        bind:value
        onchange={handleChange}
        data-field-input
      />
    {/if}
  </div>
  
  {#if fieldHelpText}
    <div data-field-help>{fieldHelpText}</div>
  {/if}
  
  {#if error}
    <div data-field-error>{error}</div>
  {/if}
</div>

<style>
  [data-input-field] {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    width: 100%;
  }
  
  [data-field-label] {
    font-size: 0.875rem;
    font-weight: 500;
    color: #212529;
  }
  
  [data-required-indicator] {
    color: #dc3545;
    margin-left: 0.25rem;
  }
  
  [data-field-input-container] {
    width: 100%;
  }
  
  [data-field-input] {
    width: 100%;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #212529;
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s