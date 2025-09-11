import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/welcome', label: 'Welcome', icon: '👋' },
    { path: '/auth', label: 'Auth', icon: '🔐' },
    { path: '/onboarding', label: 'Onboarding', icon: '⚙️' },
    { path: '/setup', label: 'Setup', icon: '🛠️' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {navItems.map((item) => (
          <Button
            key={item.path}
            asChild
            variant={location.pathname === item.path ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'flex items-center space-x-2',
              location.pathname === item.path && 'bg-primary text-primary-foreground'
            )}
          >
            <Link to={item.path}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default Navigation;
