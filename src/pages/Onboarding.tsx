import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [focusMinutes, setFocusMinutes] = useState([15]);
  const [cooldownMinutes, setCooldownMinutes] = useState([5]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Set Your Focus Time</h2>
              <p className="text-muted-foreground">
                How long would you like to focus before taking a break?
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-medium">
                  Focus Duration: {focusMinutes[0]} minutes
                </Label>
                <Slider
                  value={focusMinutes}
                  onValueChange={setFocusMinutes}
                  max={60}
                  min={5}
                  step={5}
                  className="mt-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>5 min</span>
                  <span>60 min</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Set Your Cooldown Time</h2>
              <p className="text-muted-foreground">
                How long should your break be before you can access social media again?
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-medium">
                  Cooldown Duration: {cooldownMinutes[0]} minutes
                </Label>
                <Slider
                  value={cooldownMinutes}
                  onValueChange={setCooldownMinutes}
                  max={30}
                  min={1}
                  step={1}
                  className="mt-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>1 min</span>
                  <span>30 min</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">You're All Set!</h2>
              <p className="text-muted-foreground">
                Here's your personalized configuration:
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <h3 className="font-semibold text-accent-foreground mb-2">Focus Time</h3>
                <p className="text-2xl font-bold text-accent">{focusMinutes[0]} minutes</p>
              </div>
              
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <h3 className="font-semibold text-primary-foreground mb-2">Cooldown Time</h3>
                <p className="text-2xl font-bold text-primary">{cooldownMinutes[0]} minutes</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 max-w-lg w-full">
        <div className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between">
            {step > 1 ? (
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
            ) : (
              <div />
            )}
            
            {step < 3 ? (
              <Button onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button asChild>
                <Link to="/setup">Complete Setup</Link>
              </Button>
            )}
          </div>
          
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-2 h-2 rounded-full ${
                  stepNum <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;
