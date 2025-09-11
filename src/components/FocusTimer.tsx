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
    <div className="text-center space-y-6">
      <h2 className="text-lg font-thin tracking-wider text-gray-400 uppercase">{getTimerTitle()}</h2>
      {getTimerMessage() && (
        <p className="text-sm text-gray-500 font-light">{getTimerMessage()}</p>
      )}
      
      <div className={cn(
        "text-8xl font-mono font-thin tracking-wider transition-colors duration-300",
        timeLeft === 0 ? 'text-gray-500' : 'text-white',
        getTimerAnimation()
      )}>
        {formatTime(timeLeft)}
      </div>

      <div className="flex gap-4 justify-center">
        {timerMode === 'focus' && (
          <>
            {!isRunning ? (
              <Button 
                onClick={startTimer} 
                disabled={timeLeft === 0}
                className="bg-white text-black hover:bg-gray-200 font-thin tracking-wider uppercase px-8 py-3"
              >
                {timeLeft === 0 ? 'Time Expired' : 'Start Focus'}
              </Button>
            ) : (
              <Button 
                onClick={pauseTimer}
                className="border border-gray-600 text-gray-400 hover:border-white hover:text-white font-thin tracking-wider uppercase px-8 py-3"
              >
                Pause
              </Button>
            )}
          </>
        )}
        
        {timerMode === 'cooldown' && (
          <div className="border border-gray-700 bg-gray-800 p-4">
            <p className="text-gray-400 font-light tracking-wider uppercase">
              Cooldown in progress...
            </p>
          </div>
        )}
      </div>

      {timerMode === 'focus' && timeLeft === 0 && (
        <div className="border border-gray-700 bg-gray-800 p-4">
          <p className="text-gray-400 font-light tracking-wider uppercase">
            Focus time complete! Starting cooldown...
          </p>
        </div>
      )}
    </div>
  );
}