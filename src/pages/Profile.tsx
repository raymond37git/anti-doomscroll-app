import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Profile = () => {
  // Mock data - in a real app, this would come from state management or API
  const userStats = {
    totalFocusTime: 120, // minutes
    sessionsCompleted: 8,
    streak: 5,
    platformsBlocked: ['Instagram', 'Facebook'],
    weeklyGoal: 300, // minutes
  };

  const recentSessions = [
    { date: '2024-01-15', duration: 25, platform: 'Instagram' },
    { date: '2024-01-14', duration: 30, platform: 'Instagram' },
    { date: '2024-01-13', duration: 20, platform: 'Facebook' },
    { date: '2024-01-12', duration: 35, platform: 'Instagram' },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
            <p className="text-muted-foreground">Track your mindful social media journey</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Back to App</Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{userStats.totalFocusTime}</div>
            <div className="text-sm text-muted-foreground">Minutes Focused</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{userStats.sessionsCompleted}</div>
            <div className="text-sm text-muted-foreground">Sessions Completed</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{userStats.streak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{userStats.platformsBlocked.length}</div>
            <div className="text-sm text-muted-foreground">Platforms Monitored</div>
          </Card>
        </div>

        {/* Weekly Progress */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Weekly Progress</h2>
              <Badge variant="secondary">
                {userStats.totalFocusTime} / {userStats.weeklyGoal} minutes
              </Badge>
            </div>
            <Progress 
              value={(userStats.totalFocusTime / userStats.weeklyGoal) * 100} 
              className="h-2"
            />
            <p className="text-sm text-muted-foreground">
              {userStats.weeklyGoal - userStats.totalFocusTime} minutes remaining to reach your weekly goal
            </p>
          </div>
        </Card>

        {/* Detailed Stats */}
        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sessions" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Focus Sessions</h3>
              <div className="space-y-3">
                {recentSessions.map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{session.platform}</div>
                      <div className="text-sm text-muted-foreground">{session.date}</div>
                    </div>
                    <Badge variant="outline">{session.duration} min</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="platforms" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Monitored Platforms</h3>
              <div className="space-y-3">
                {userStats.platformsBlocked.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm">📱</span>
                      </div>
                      <span className="font-medium">{platform}</span>
                    </div>
                    <Badge variant="destructive">Active</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
              <div className="space-y-4">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/onboarding">Update Focus Settings</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/setup">App Preferences</Link>
                </Button>
                <Button variant="destructive" className="w-full justify-start">
                  Reset All Data
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
