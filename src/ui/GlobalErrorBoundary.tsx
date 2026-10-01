import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Game Error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('soa_game_save_v1');
    } catch {
      // Ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0d11] p-6 text-slate-100">
          <div className="max-w-md w-full bg-[#131720] border border-amber-600/30 rounded-xl p-6 shadow-2xl text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold font-cinzel text-amber-400 mb-2">
              The Aether Realm Wavered
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              A temporary disruption occurred in the game engine. No progress has been lost.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 font-semibold text-slate-950 transition-colors shadow-lg shadow-amber-900/30"
              >
                <RefreshCw className="w-4 h-4" />
                Resume Adventure
              </button>

              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors border border-slate-700"
              >
                <Home className="w-4 h-4" />
                Reset & Return to Menu
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
