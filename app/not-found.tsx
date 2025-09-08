import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="relative">
        {/* Large background icon */}
        <div className="absolute -z-10 opacity-5">
          <FileQuestion className="h-80 w-80 text-primary" />
        </div>
        
        {/* Content overlay */}
        <div className="text-center z-10 relative py-16">
          <h1 className="text-6xl font-bold mb-4 text-slate-800">404</h1>
          <h2 className="text-3xl font-medium mb-6 text-slate-700">Page Not Found</h2>
          
          <p className="text-muted-foreground mb-10 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex justify-center">
            <Button 
              variant="default" 
              asChild
              className="flex items-center gap-2"
              size="lg"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </div>
          
          <p className="mt-16 text-sm text-muted-foreground">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
