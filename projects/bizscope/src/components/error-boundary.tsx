'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-8 py-6 text-center">
            <p className="text-sm font-semibold text-destructive">
              {this.props.sectionTitle
                ? `${this.props.sectionTitle} 렌더링 오류`
                : '렌더링 오류'}
            </p>
            {this.state.error && (
              <p className="mt-2 text-xs text-destructive/80">
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
