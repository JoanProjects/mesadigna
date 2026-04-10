import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faRotateRight, faHome } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
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
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-danger-50 text-danger-500 rounded-full mb-6">
              <FontAwesomeIcon icon={faTriangleExclamation} size="2x" />
            </div>
            
            <h1 className="text-2xl font-bold text-text-primary mb-2">Algo salió mal</h1>
            <p className="text-text-secondary mb-8 leading-relaxed">
              Lo sentimos, ocurrió un error inesperado en la aplicación. Hemos sido notificados y estamos trabajando para solucionarlo.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-danger-600 font-semibold mb-1">Error:</p>
                <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                  {this.state.error?.message || 'Error desconocido'}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                <FontAwesomeIcon icon={faHome} className="mr-2" /> Inicio
              </Button>
              <Button onClick={this.handleReset} className="w-full">
                <FontAwesomeIcon icon={faRotateRight} className="mr-2" /> Reintentar
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function RouteErrorBoundary() {
  // This can be used as errorElement in React Router
  return <ErrorBoundary />;
}
