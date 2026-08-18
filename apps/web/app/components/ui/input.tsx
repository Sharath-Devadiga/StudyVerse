import React from "react";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-50 dark:placeholder:text-gray-500 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-950 ${className || ""}`}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
