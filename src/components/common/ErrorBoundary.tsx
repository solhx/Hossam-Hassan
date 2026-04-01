// src/components/common/ErrorBoundary.tsx
'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  section?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[ErrorBoundary] Section "${this.props.section ?? 'unknown'}" crashed:`,
      error,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          className="flex items-center justify-center py-24 px-4"
        >
          <div className="text-center max-w-md">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              This section failed to load.{' '}
              <button
                onClick={() => this.setState({ hasError: false })}
                className="text-emerald-600 dark:text-emerald-400 underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}