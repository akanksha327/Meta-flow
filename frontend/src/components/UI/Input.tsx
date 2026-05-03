import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-textPrimary dark:text-textPrimary-dark ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 rounded-xl border bg-surface-card dark:bg-surface-cardDark transition-colors duration-200",
            "text-textPrimary dark:text-textPrimary-dark placeholder:text-textSecondary dark:placeholder:text-textSecondary-dark",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
            {
              'border-primary-200 dark:border-primary-800': !error,
              'border-red-500 focus:ring-red-500 focus:border-red-500': error,
            },
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500 ml-1">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
