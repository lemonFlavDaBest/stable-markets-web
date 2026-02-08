"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary that catches rendering errors in its children.
 * Displays a minimal dark-themed error card instead of crashing the page.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="rounded-xl border border-error/30 bg-error/5 p-4">
          <p className="text-sm text-error">Something went wrong.</p>
          <p className="mt-1 text-xs text-text-muted">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
