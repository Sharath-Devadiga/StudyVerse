'use client';

import React from 'react';

// Define the props the component will accept
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { id: string; name: string | number }[]; // Accepts an array of objects with id and name
  placeholder: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, ...props }, ref) => {
    // This ensures the component is always controlled.
    // If the parent component passes a `value` that is null or undefined,
    // we default it to an empty string to prevent the error.
    const controlledValue = props.value ?? '';

    return (
      <div className="w-full">
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-200 mb-1">
          {label}
        </label>
        <select
          ref={ref}
          {...props}
          value={controlledValue} // Use the guaranteed string value here
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';

