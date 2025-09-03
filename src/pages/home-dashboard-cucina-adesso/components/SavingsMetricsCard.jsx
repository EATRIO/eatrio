import React from 'react';
import Icon from '../../../components/AppIcon';

const SavingsMetricsCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  trend, 
  trendValue, 
  color = 'primary',
  className = '' 
}) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20'
  };

  return (
    <div className={`glass-morphism rounded-lg p-4 border ${colorClasses?.[color]} ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses?.[color]}`}>
            <Icon name={icon} size={16} color="currentColor" />
          </div>
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
        </div>
        {trend && (
          <div className="flex items-center space-x-1">
            <Icon 
              name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
              size={14} 
              color={trend === 'up' ? 'var(--color-success)' : 'var(--color-error)'} 
            />
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-success' : 'text-error'}`}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>
    </div>
  );
};

export default SavingsMetricsCard;