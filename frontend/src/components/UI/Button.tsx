import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-surface-dark active:scale-[0.98]",
        {
          'bg-primary text-white hover:bg-primary-800 dark:bg-white dark:text-primary dark:hover:bg-primary-100': variant === 'primary',
          'bg-accent text-white hover:bg-accent-dark': variant === 'secondary',
          'border border-primary-200 dark:border-primary-700 bg-transparent hover:bg-primary-50 dark:hover:bg-primary-800 text-textPrimary dark:text-textPrimary-dark': variant === 'outline',
          'bg-transparent hover:bg-primary-50 dark:hover:bg-primary-800 text-textSecondary dark:text-textSecondary-dark hover:text-textPrimary dark:hover:text-textPrimary-dark': variant === 'ghost',
          
          'px-4 py-2 text-sm': size === 'sm',
          'px-6 py-2.5 text-base': size === 'md',
          'px-8 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
