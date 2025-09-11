
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
      <div className={cn("p-8 border border-gray-800 bg-gray-900", className)}>
        <div className="text-center space-y-6 h-full flex flex-col justify-center items-center min-h-[400px]">
          <div className="text-8xl mb-6 font-mono">■</div>
          <h2 className="text-3xl font-thin tracking-wider text-white uppercase">Instagram Blocked</h2>
          <p className="text-gray-400 max-w-md font-light">
            Your focus time has expired. Take a break and come back when you're ready to set a new timer!
          </p>
          <div className="border border-gray-700 bg-gray-800 p-6 mt-6">
            <p className="text-gray-300 font-light tracking-wider uppercase">
              Use this time to be mindful and present
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-0 border border-gray-800 bg-gray-900 overflow-hidden", className)}>
      <div className="bg-gray-800 text-white p-4 text-center border-b border-gray-700">
        <p className="font-thin tracking-wider uppercase">Instagram - Use mindfully</p>
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
        <div className="absolute inset-0 pointer-events-none border-2 border-gray-600" />
      </div>
    </div>
  );
}