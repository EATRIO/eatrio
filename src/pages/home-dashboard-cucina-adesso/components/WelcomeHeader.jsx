import React from 'react';
import Icon from '../../../components/AppIcon';

const WelcomeHeader = ({ 
  userName = 'Chef', 
  currentTime = new Date(),
  className = '' 
}) => {
  const getGreeting = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  const getTimeBasedIcon = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return 'Sun';
    if (hour < 18) return 'Sun';
    return 'Moon';
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <Icon 
          name={getTimeBasedIcon()} 
          size={20} 
          color="var(--color-primary)" 
        />
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {userName}!
        </h1>
      </div>
      
      <p className="text-muted-foreground capitalize">
        {formatDate(currentTime)}
      </p>
      
      <p className="text-sm text-muted-foreground">
        Cosa cuciniamo oggi? Ecco le ricette perfette per la tua dispensa.
      </p>
    </div>
  );
};

export default WelcomeHeader;