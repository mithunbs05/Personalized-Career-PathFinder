import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PathAI Error Boundary caught:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F9F8F3] dark:bg-[#121211] flex items-center justify-center p-6 transition-colors duration-300">
          <div className="max-w-md w-full bg-white dark:bg-[#1A1A18] rounded-3xl p-8 sm:p-10 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xl text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-display font-bold text-[#1A1A1A] dark:text-white mb-2">
                {this.props.fallbackTitle || 'Something went wrong'}
              </h2>
              <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">
                PathAI encountered an unexpected error. You can try again or return to the home page.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8B7C] block mb-1">
                  Error Details
                </span>
                <p className="text-[11px] text-[#4A4A4A] dark:text-[#A0A09B] font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 py-3 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#FF4D31]/20"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 py-3 rounded-full border border-[#E8E6DE] dark:border-[#2C2C29] text-[#1A1A1A] dark:text-white font-bold text-sm hover:bg-[#F1EFE7] dark:hover:bg-[#252522] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
