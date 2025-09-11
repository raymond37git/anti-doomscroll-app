import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Minus, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const Setup = () => {
  const navigate = useNavigate();
  const [countdownMinutes, setCountdownMinutes] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [initialTime, setInitialTime] = useState(0);
  const [platforms, setPlatforms] = useState({
    instagram: { enabled: true, name: 'Instagram', icon: '■' },
    tiktok: { enabled: true, name: 'TikTok', icon: '●' },
    twitter: { enabled: true, name: 'Twitter', icon: '▲' },
    youtube: { enabled: true, name: 'YouTube', icon: '◆' },
  });

  useEffect(() => {
    // Check if countdown is active
    const savedTime = localStorage.getItem('countdownTime');
    const savedActive = localStorage.getItem('countdownActive');
    const savedPlatforms = localStorage.getItem('blockedPlatforms');
    
    if (savedTime && savedActive === 'true') {
      const time = parseInt(savedTime);
      setTimeLeft(time);
      setInitialTime(time);
      setIsActive(true);
      setIsLocked(true);
    }
    
    if (savedPlatforms) {
      setPlatforms(JSON.parse(savedPlatforms));
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1;
          localStorage.setItem('countdownTime', newTime.toString());
          
          if (newTime <= 0) {
            setIsActive(false);
            setIsLocked(false);
            localStorage.removeItem('countdownTime');
            localStorage.removeItem('countdownActive');
            localStorage.setItem('settingsLocked', 'false');
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const togglePlatform = (platformId: string) => {
    if (isLocked) return;
    
    setPlatforms(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId as keyof typeof prev],
        enabled: !prev[platformId as keyof typeof prev].enabled
      }
    }));
  };

  const adjustCountdown = (increment: boolean) => {
    if (isLocked) return;
    
    setCountdownMinutes(prev => {
      const newValue = increment ? prev + 1 : Math.max(1, prev - 1);
      return newValue;
    });
  };

  const handleStartBlocking = () => {
    if (isLocked) return;
    
    // Save settings to localStorage
    const totalSeconds = countdownMinutes * 60;
    localStorage.setItem('countdownTime', totalSeconds.toString());
    localStorage.setItem('countdownActive', 'true');
    localStorage.setItem('settingsLocked', 'true');
    localStorage.setItem('blockedPlatforms', JSON.stringify(platforms));
    
    // Start countdown
    setTimeLeft(totalSeconds);
    setInitialTime(totalSeconds);
    setIsActive(true);
    setIsLocked(true);
  };

  const handleStopBlocking = () => {
    setIsActive(false);
    setIsLocked(false);
    setTimeLeft(0);
    localStorage.removeItem('countdownTime');
    localStorage.removeItem('countdownActive');
    localStorage.setItem('settingsLocked', 'false');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (initialTime === 0) return 0;
    return ((initialTime - timeLeft) / initialTime) * 100;
  };

  return (
    <div className="min-h-screen bg-white text-black p-4">
      {/* Disclaimer */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 text-sm text-gray-600">
        <img src="/day-one-ai-logo.svg" alt="Day One AI" className="w-4 h-4" />
        <span className="font-light">Created by Day One AI</span>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-thin tracking-wider">The Anti-Doomscroll App</h1>
          <p className="text-gray-600 font-light">
            Configure your digital environment
          </p>
        </div>

        <div className="border border-black bg-white p-8 space-y-8">
          {/* Active Countdown Display */}
          {isActive && timeLeft > 0 && (
            <div className="text-center space-y-4 border-b border-black pb-8">
              <div className="text-6xl font-mono font-thin tracking-wider">
                {formatTime(timeLeft)}
              </div>
              <div className="space-y-2">
                <Progress value={getProgressPercentage()} className="h-1 bg-gray-200" />
                <p className="text-xs text-gray-600 uppercase tracking-wider">
                  Focus Session Active
                </p>
              </div>
            </div>
          )}

          {/* Platform Settings */}
          <div className="space-y-6">
            <h2 className="text-lg font-thin tracking-wider uppercase">Platforms</h2>
            
            <div className="space-y-2">
              {Object.entries(platforms).map(([id, platform]) => (
                <div
                  key={id}
                  className={`p-4 border transition-all ${
                    platform.enabled
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-gray-100 text-gray-600'
                  } ${isLocked ? 'opacity-50' : 'hover:border-gray-600'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-mono">{platform.icon}</span>
                      <span className="font-light tracking-wide">{platform.name}</span>
                    </div>
                    <Switch
                      checked={platform.enabled}
                      onCheckedChange={() => togglePlatform(id)}
                      disabled={isLocked}
                      className="data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="space-y-6">
            <h2 className="text-lg font-thin tracking-wider uppercase">Duration</h2>
            
            <div className="flex items-center justify-center space-x-8">
              <button
                onClick={() => adjustCountdown(false)}
                disabled={isLocked || countdownMinutes <= 1}
                className="w-12 h-12 border border-black hover:border-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <Minus className="h-6 w-6" />
              </button>
              
              <div className="text-center">
                <div className="text-5xl font-mono font-thin tracking-wider">
                  {countdownMinutes}
                </div>
                <div className="text-xs text-gray-600 uppercase tracking-wider">minutes</div>
              </div>
              
              <button
                onClick={() => adjustCountdown(true)}
                disabled={isLocked}
                className="w-12 h-12 border border-black hover:border-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Status Message */}
          {isLocked ? (
            <div className="border border-black bg-gray-100 p-4">
              <h3 className="font-thin tracking-wider mb-2 uppercase">Session Active</h3>
              <p className="text-sm text-gray-600">
                Settings locked during focus session
              </p>
            </div>
          ) : (
            <div className="border border-gray-300 bg-gray-50 p-4">
              <h3 className="font-thin tracking-wider mb-2 uppercase">Ready</h3>
              <p className="text-sm text-gray-600">
                Configure settings and begin focus session
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {isActive ? (
              <Button 
                onClick={handleStopBlocking}
                className="w-full bg-black text-white hover:bg-gray-800 font-thin tracking-wider uppercase"
              >
                Stop Session
              </Button>
            ) : (
              <Button 
                onClick={handleStartBlocking}
                className="w-full bg-black text-white hover:bg-gray-800 font-thin tracking-wider uppercase"
              >
                Start Session
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setup;
