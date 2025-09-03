import React from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const FloatingActionButton = ({ 
  onClick, 
  className = '',
  disabled = false 
}) => {
  const location = useLocation();

  const getContextualAction = () => {
    switch (location?.pathname) {
      case '/home-dashboard-cucina-adesso':
        return {
          icon: 'Mic',
          label: 'Ricerca vocale',
          action: () => onClick?.('voice-search')
        };
      case '/pantry-management-dispensa':
        return {
          icon: 'Plus',
          label: 'Aggiungi ingrediente',
          action: () => onClick?.('add-ingredient')
        };
      case '/recipe-collection-ricette':
        return {
          icon: 'Search',
          label: 'Cerca ricette',
          action: () => onClick?.('search-recipes')
        };
      case '/shopping-list-spesa':
        return {
          icon: 'Plus',
          label: 'Aggiungi alla lista',
          action: () => onClick?.('add-to-list')
        };
      case '/user-profile-profilo':
        return {
          icon: 'Settings',
          label: 'Impostazioni rapide',
          action: () => onClick?.('quick-settings')
        };
      default:
        return {
          icon: 'Plus',
          label: 'Azione rapida',
          action: () => onClick?.('default-action')
        };
    }
  };

  const contextualAction = getContextualAction();

  const handleClick = () => {
    if (!disabled && contextualAction?.action) {
      contextualAction?.action();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-90
        kitchen-safe w-14 h-14 
        bg-primary hover:bg-primary/90 
        text-primary-foreground 
        rounded-full shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-150
        active:scale-95 hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${className}
      `}
      aria-label={contextualAction?.label}
      title={contextualAction?.label}
    >
      <Icon 
        name={contextualAction?.icon} 
        size={24} 
        color="var(--color-primary-foreground)" 
      />
    </button>
  );
};

export default FloatingActionButton;