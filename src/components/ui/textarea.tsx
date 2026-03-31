import * as React from 'react';
import { cn } from '@/utils/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      `flex min-h-[120px] w-full rounded-xl border bg-background dark:bg-neutral-900 
border-border dark:border-neutral-700 px-4 py-3 text-sm text-foreground dark:text-neutral-100 
transition-colors placeholder:text-muted-foreground dark:placeholder:text-neutral-500 
focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 
disabled:cursor-not-allowed disabled:opacity-50 resize-none`,
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
export { Textarea };