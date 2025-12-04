import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-kaviNavy p-4 text-white">
      <h1 className="mb-2 text-6xl font-bold text-kaviBlue">404</h1>
      <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mb-8 text-center text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button>
          <Home className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
}
