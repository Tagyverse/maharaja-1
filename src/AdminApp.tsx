'use client';

import { Component, ReactNode } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { PublishedDataProvider } from './contexts/PublishedDataContext';
import { ClientConfigProvider } from './contexts/ClientConfigContext';
import { FeaturesProvider } from './contexts/FeaturesContext';
import { AppInitializer } from './components/AppInitializer';
import Admin from './pages/Admin';

type ErrorBoundaryState = { hasError: boolean; error: Error | null };

class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 border-2 border-red-200 text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-100 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-green-200 transition-colors border border-green-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AdminAppContent() {
  return (
    <>
      <AppInitializer />
      <Admin />
    </>
  );
}

export default function AdminApp() {
  return (
    <ErrorBoundary>
      <ClientConfigProvider>
        <AuthProvider>
          <PublishedDataProvider>
            <FeaturesProvider>
              <AdminAppContent />
            </FeaturesProvider>
          </PublishedDataProvider>
        </AuthProvider>
      </ClientConfigProvider>
    </ErrorBoundary>
  );
}
