import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TimerMode = 'focus' | 'cooldown';

interface FocusTimerProps {
  initialMinutes?: number;
  cooldownMinutes?: number;
  onTimeExpired: () => void;
  onCooldownComplete: () => void;
  isActive: boolean;
}

export function FocusTimer({ 
  initialMinutes = 15, 
  cooldownMinutes = 0.083, // 5 seconds for testing
  onTimeExpired, 
  onCooldownComplete,
  isActive 
}: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>('focus');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            if (timerMode === 'focus') {
              // Focus time expired, start cooldown
              onTimeExpired();
              setTimerMode('cooldown');
              setTimeLeft(cooldownMinutes * 60);
              setIsRunning(true);
            } else {
              // Cooldown completed, reset to focus mode
              onCooldownComplete();
              setTimerMode('focus');
              setTimeLeft(initialMinutes * 60);
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isActive, timeLeft, onTimeExpired, onCooldownComplete, timerMode, initialMinutes, cooldownMinutes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timerMode === 'cooldown') {
      const percentage = (timeLeft / (cooldownMinutes * 60)) * 100;
      if (timeLeft === 0) return 'text-accent';
      if (percentage <= 50) return 'text-accent';
      return 'text-accent';
    }
    
    const percentage = (timeLeft / (initialMinutes * 60)) * 100;
    if (timeLeft === 0) return 'text-timer-expired';
    if (percentage <= 10) return 'text-timer-critical';
    if (percentage <= 25) return 'text-timer-warning';
    return 'text-timer-active';
  };

  const getTimerAnimation = () => {
    if (timerMode === 'cooldown') {
      return timeLeft <= 3 ? 'animate-pulse-warning' : '';
    }
    
    const percentage = (timeLeft / (initialMinutes * 60)) * 100;
    if (timeLeft === 0) return 'animate-shake';
    if (percentage <= 10) return 'animate-pulse-warning';
    return '';
  };

  const startTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const getTimerTitle = () => {
    if (timerMode === 'cooldown') {
      return 'Cooldown Time Remaining';
    }
    return 'Focus Time Remaining';
  };

  const getTimerMessage = () => {
    if (timerMode === 'cooldown') {
      return 'Taking a break... Instagram will unlock soon!';
    }
    return '';
  };

  return (
    <Card className="p-6 bg-card border-border shadow-lg">
      <div className="text-center space-y-4">
        <h2 className="text-lg font-semibold text-foreground">{getTimerTitle()}</h2>
        {getTimerMessage() && (
          <p className="text-sm text-accent font-medium">{getTimerMessage()}</p>
        )}
        
        <div className={cn(
          "text-6xl font-mono font-bold transition-colors duration-300",
          getTimerColor(),
          getTimerAnimation()
        )}>
          {formatTime(timeLeft)}
        </div>

        <div className="flex gap-2 justify-center">
          {timerMode === 'focus' && (
            <>
              {!isRunning ? (
                <Button 
                  onClick={startTimer} 
                  disabled={timeLeft === 0}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {timeLeft === 0 ? 'Time Expired' : 'Start Focus'}
                </Button>
              ) : (
                <Button 
                  onClick={pauseTimer}
                  variant="secondary"
                >
                  Pause
                </Button>
              )}
            </>
          )}
          
          {timerMode === 'cooldown' && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
              <p className="text-accent font-medium">
                🧘‍♀️ Cooldown in progress...
              </p>
            </div>
          )}
        </div>

        {timerMode === 'focus' && timeLeft === 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-destructive font-medium">
              ⏰ Focus time complete! Starting cooldown...
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}