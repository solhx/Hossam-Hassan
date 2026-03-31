import * as React from 'react';
import { cn } from '@/utils/utils';

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      `flex h-11 w-full rounded-xl border bg-background dark:bg-neutral-900 
border-border dark:border-neutral-700 px-4 py-2 text-sm text-foreground dark:text-neutral-100 
transition-colors placeholder:text-muted-foreground dark:placeholder:text-neutral-500 
focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 
disabled:cursor-not-allowed disabled:opacity-50`,
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';
export { Input };