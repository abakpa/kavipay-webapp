import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden md:flex" />

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
