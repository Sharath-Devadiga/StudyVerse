'use client';

import React from 'react';

// Define the props the button will accept, extending standard button attributes
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // We can add variant props here in the future, e.g., variant?: 'primary' | 'secondary'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    // Base classes for the button
    const baseClasses =
      'inline-flex items-center justify-center rounded-md px-4 py-3 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800';
    
    // Classes for different states
    const stateClasses =
      'bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50';

    // Combine all classes
    const combinedClasses = `${baseClasses} ${stateClasses} ${className}`;

    return (
      <button ref={ref} className={combinedClasses} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
