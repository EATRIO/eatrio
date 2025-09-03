import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const BottomTabNavigation = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Cucina',
      path: '/home-dashboard-cucina-adesso',
      icon: 'Home',
      tooltip: 'Dashboard principale con ricette suggerite'
    },
    {
      label: 'Dispensa',
      path: '/pantry-management-dispensa',
      icon: 'Package',
      tooltip: 'Gestisci gli ingredienti della tua dispensa'
    },
    {
      label: 'Ricette',
      path: '/recipe-collection-ricette',
      icon: 'BookOpen',
      tooltip: 'Esplora la collezione di ricette'
    },
    {
      label: 'Spesa',
      path: '/shopping-list-spesa',
      icon: 'ShoppingCart',
      tooltip: 'Lista della spesa intelligente'
    },
    {
      label: 'Profilo',
      path: '/user-profile-profilo',
      icon: 'User',
      tooltip: 'Impostazioni e preferenze personali'
    }
  ];

  const handleTabClick = (path) => {
    navigate(path);
  };

  const isActiveTab = (path) => {
    return location?.pathname === path;
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-100 bg-surface border-t border-border ${className}`}>
        <div className="flex items-center justify-around h-20 px-2 safe-area-bottom">
          {navigationItems?.map((item) => {
            const isActive = isActiveTab(item?.path);
            return (
              <button
                key={item?.path}
                onClick={() => handleTabClick(item?.path)}
                className={`kitchen-safe flex flex-col items-center justify-center space-y-1 rounded-lg transition-all duration-150 ${
                  isActive 
                    ? 'text-primary bg-primary/10 scale-105' :'text-muted-foreground hover:text-foreground hover:bg-muted/20 active:scale-98'
                }`}
                aria-label={item?.tooltip}
                title={item?.tooltip}
              >
                <Icon 
                  name={item?.icon} 
                  size={22} 
                  color={isActive ? 'var(--color-primary)' : 'currentColor'} 
                />
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item?.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
      {/* Desktop Sidebar Navigation */}
      <nav className={`hidden lg:flex fixed left-0 top-16 bottom-0 w-64 z-90 bg-surface border-r border-border flex-col ${className}`}>
        <div className="flex-1 py-6 px-4 space-y-2 custom-scrollbar overflow-y-auto">
          {navigationItems?.map((item) => {
            const isActive = isActiveTab(item?.path);
            return (
              <button
                key={item?.path}
                onClick={() => handleTabClick(item?.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-150 text-left ${
                  isActive 
                    ? 'text-primary bg-primary/10 border border-primary/20' :'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                }`}
                title={item?.tooltip}
              >
                <Icon 
                  name={item?.icon} 
                  size={20} 
                  color={isActive ? 'var(--color-primary)' : 'currentColor'} 
                />
                <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item?.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 px-4 py-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="ChefHat" size={16} color="var(--color-primary-foreground)" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">EATRIO</p>
              <p className="text-xs text-muted-foreground">Cucina intelligente</p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomTabNavigation;