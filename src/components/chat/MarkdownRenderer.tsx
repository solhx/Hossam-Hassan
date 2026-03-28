'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/utils/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose-chat', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/90">{children}</em>
          ),
          code: ({ children, className: codeClassName }) => {
            const isBlock = codeClassName?.includes('language-');
            if (isBlock) {
              return (
                <code
                  className={cn(
                    'block bg-neutral-200/50 dark:bg-neutral-900/50 rounded-lg p-3 text-xs font-mono overflow-x-auto my-2',
                    codeClassName
                  )}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className="px-1.5 py-0.5 rounded-md bg-neutral-200/50 dark:bg-neutral-900/50 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-neutral-200/50 dark:bg-neutral-900/50 rounded-lg overflow-hidden my-2">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-2 ml-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-2 ml-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed">{children}</li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              {children}
            </a>
          ),
          h1: ({ children }) => (
            <h4 className="font-bold text-foreground mb-1 mt-2">{children}</h4>
          ),
          h2: ({ children }) => (
            <h5 className="font-bold text-foreground mb-1 mt-2">{children}</h5>
          ),
          h3: ({ children }) => (
            <h6 className="font-semibold text-foreground mb-1 mt-2">{children}</h6>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-emerald-500/30 pl-3 my-2 text-neutral-500 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3 border-neutral-200 dark:border-neutral-700" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}