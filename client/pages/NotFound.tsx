import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center py-12 px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-primary/60 mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        <p className="text-2xl font-bold text-foreground mb-3">Page Not Found</p>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
