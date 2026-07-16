import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-vault-bg p-4">
          <div className="vault-card p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-vault-warn/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-vault-warn" />
            </div>
            <h2 className="text-xl font-semibold text-vault-text mb-2">
              出现了一些问题
            </h2>
            <p className="text-sm text-vault-text-secondary mb-4">
              页面运行时遇到了意外错误。您可以尝试刷新页面或返回首页。
            </p>
            {this.state.error && (
              <div className="bg-vault-hover/50 rounded-lg p-3 mb-4 text-left">
                <p className="text-xs text-vault-text-muted font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-vault-surface text-vault-text hover:bg-vault-hover transition-colors text-sm"
              >
                <RotateCcw size={16} />
                重试
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-vault-accent text-vault-bg hover:bg-vault-accent-hover transition-colors text-sm font-medium"
              >
                <Home size={16} />
                刷新页面
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
