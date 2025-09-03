import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const HeaderWithLogo = ({
  showBackButton = false,
  title = '',
  actions = [],
  className = '',
}) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/home-dashboard-cucina-adesso');
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <header
      className={
        // via “bg-background/95 + backdrop-blur-sm” niente fascia bianca
        // tolta qualsiasi ombra/gradiente custom
        `fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-sm border-b border-border ${className}`
      }
    >
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left */}
        <div className="flex items-center space-x-3">
          {showBackButton ? (
            <button
              onClick={handleBackClick}
              className="touch-target flex items-center justify-center rounded-lg hover:bg-muted/20 transition-colors"
              aria-label="Torna indietro"
            >
              <Icon name="ArrowLeft" size={24} color="var(--color-foreground)" />
            </button>
          ) : (
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              aria-label="Vai alla home"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="ChefHat" size={20} color="var(--color-primary-foreground)" />
              </div>
              <span className="text-xl font-bold text-foreground font-sans">
                EATRIO
              </span>
            </button>
          )}

          {/* Titolo: lo teniamo sulla singola riga, senza riga extra mobile sotto */}
          {title && (
            <h1 className="hidden sm:block text-lg font-semibold text-foreground truncate max-w-48">
              {title}
            </h1>
          )}
        </div>

        {/* Right actions */}
        {actions?.length > 0 && (
          <div className="flex items-center space-x-2">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action?.onClick}
                className="touch-target flex items-center justify-center rounded-lg hover:bg-muted/20 transition-colors disabled:opacity-60"
                aria-label={action?.label}
                disabled={action?.disabled}
              >
                <Icon
                  name={action?.icon}
                  size={24}
                  color={action?.disabled ? 'var(--color-muted-foreground)' : 'var(--color-foreground)'}
                />
              </button>
            ))}
          </div>
        )}
      </div>
      {/* rimosso il blocco “Mobile Title” che creava la fascia bianca */}
    </header>
  );
};

export default HeaderWithLogo;
