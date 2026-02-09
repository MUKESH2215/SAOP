import { Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";

interface PlaceholderProps {
  title?: string;
  description?: string;
}

export default function Placeholder({
  title = "Coming Soon",
  description = "This page is being developed.",
}: PlaceholderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center py-12 px-4">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <Zap className="w-16 h-16 mx-auto text-primary/60 mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="p-6 rounded-lg bg-white border border-border mb-6">
          <p className="text-sm text-muted-foreground mb-4">
            This section is under development. Continue prompting in the chat to
            help build out this feature!
          </p>
        </div>

        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
