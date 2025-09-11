import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InstagramWebViewProps {
  isBlocked: boolean;
  className?: string;
}

export function InstagramWebView({ isBlocked, className }: InstagramWebViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isBlocked && iframeRef.current) {
      // Block the iframe by setting src to empty
      iframeRef.current.src = 'about:blank';
    } else if (!isBlocked && iframeRef.current) {
      // Load Instagram when not blocked
      iframeRef.current.src = 'https://www.instagram.com/';
    }
  }, [isBlocked]);

  if (isBlocked) {
    return (
      <Card className={cn("p-8 bg-card border-border shadow-lg", className)}>
        <div className="text-center space-y-4 h-full flex flex-col justify-center items-center min-h-[400px]">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-foreground">Instagram Blocked</h2>
          <p className="text-muted-foreground max-w-md">
            Your focus time has expired. Take a break and come back when you're ready to set a new timer!
          </p>
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mt-6">
            <p className="text-accent-foreground font-medium">
              🧘‍♀️ Use this time to be mindful and present
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-0 bg-card border-border shadow-lg overflow-hidden", className)}>
      <div className="bg-gradient-focus text-white p-3 text-center">
        <p className="font-medium">📱 Instagram - Use mindfully</p>
      </div>
      <div className="relative h-full min-h-[500px]">
        <iframe
          ref={iframeRef}
          src="https://www.instagram.com/"
          className="w-full h-full border-0"
          title="Instagram Feed"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          loading="lazy"
        />
        <div className="absolute inset-0 pointer-events-none border-2 border-primary/20 rounded-lg" />
      </div>
    </Card>
  );
}