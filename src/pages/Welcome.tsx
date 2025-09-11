import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome to Anti-Doomscroll</h1>
          <p className="text-muted-foreground">
            Take control of your social media habits with mindful time management
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <h3 className="font-semibold text-accent-foreground mb-2">🎯 Focus Mode</h3>
            <p className="text-sm text-muted-foreground">
              Set intentional time limits for social media usage
            </p>
          </div>
          
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h3 className="font-semibold text-primary-foreground mb-2">🧘‍♀️ Mindful Breaks</h3>
            <p className="text-sm text-muted-foreground">
              Take cooldown periods to reflect and reset
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/onboarding">Get Started</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/">Skip to App</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Welcome;
