import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[WasteWise ErrorBoundary Caught]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    this.props.onReset?.();
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/admin/dashboard';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 select-text">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Banner */}
            <div className="bg-red-500/10 border-b border-red-500/20 p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400">
                  Application Runtime Shield
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Something went wrong in this view
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A component encountered an unexpected error during rendering. The application state has been preserved.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-red-300 break-words">
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-1">
                  Error Details
                </span>
                {this.state.error?.message || 'An unknown render error occurred.'}
              </div>

              {/* Collapsible Stack Trace in Development */}
              {isDev && this.state.errorInfo && (
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
                  <button
                    type="button"
                    onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors border-none bg-transparent cursor-pointer"
                  >
                    <span>Component Stack Trace</span>
                    {this.state.showDetails ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {this.state.showDetails && (
                    <div className="p-4 border-t border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={this.handleReset}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border-none shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={this.handleReload}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <span>Reload App</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="px-3 py-2 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border-none bg-transparent"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
