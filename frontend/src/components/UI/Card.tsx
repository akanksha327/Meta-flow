import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: 'amber' | 'none';
  elevation?: 'sm' | 'md' | 'none';
}

export function Card({ 
  className, 
  children, 
  accent = 'none', 
  elevation = 'sm', 
  ...props 
}: CardProps) {
  return (
    <div
      className={cn(
        "relative bg-surface-card dark:bg-surface-cardDark rounded-2xl overflow-hidden transition-all duration-300",
        {
          'shadow-soft': elevation === 'sm',
          'shadow-soft-lg': elevation === 'md',
          'border border-primary-200 dark:border-primary-800': elevation === 'none',
        },
        className
      )}
      {...props}
    >
      {accent === 'amber' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
      )}
      {children}
    </div>
  );
}
