import { useState, useEffect } from 'react';
import { FocusTimer } from '@/components/FocusTimer';
import { InstagramWebView } from '@/components/InstagramWebView';
import { Card } from '@/components/ui/card';

const Index = () => {
  const [isBlocked, setIsBlocked] = useState(false);

  const handleTimeExpired = () => {
    setIsBlocked(true);
  };

  const handleCooldownComplete = () => {
    setIsBlocked(false);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Timer Section */}
      <FocusTimer 
        initialMinutes={10/60}
        cooldownMinutes={5/60}
        onTimeExpired={handleTimeExpired}
        onCooldownComplete={handleCooldownComplete}
        isActive={true}
      />

      {/* Instagram WebView Section */}
      <InstagramWebView 
        isBlocked={isBlocked}
        className="flex-1"
      />

      {/* Footer */}
      <Card className="p-3 bg-muted/50">
        <p className="text-center text-sm text-muted-foreground">
          💡 Tip: Set intentional time limits to maintain a healthy relationship with social media
        </p>
      </Card>
    </div>
  );
};

export default Index;
