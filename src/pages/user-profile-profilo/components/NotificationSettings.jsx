import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const NotificationSettings = ({ settings, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const notificationTypes = [
    {
      id: 'expirationAlerts',
      label: 'Avvisi di scadenza',
      description: 'Notifiche quando gli ingredienti stanno per scadere',
      icon: 'AlertTriangle'
    },
    {
      id: 'lowStockWarnings',
      label: 'Avvisi scorte basse',
      description: 'Notifiche quando gli ingredienti base stanno finendo',
      icon: 'Package'
    },
    {
      id: 'recipeSuggestions',
      label: 'Suggerimenti ricette',
      description: 'Ricette personalizzate basate sulla tua dispensa',
      icon: 'Lightbulb'
    },
    {
      id: 'shoppingReminders',
      label: 'Promemoria spesa',
      description: 'Ricordati di fare la spesa quando necessario',
      icon: 'ShoppingCart'
    },
    {
      id: 'cookingTips',
      label: 'Consigli di cucina',
      description: 'Suggerimenti e trucchi culinari personalizzati',
      icon: 'BookOpen'
    }
  ];

  const reminderTimes = [
    { value: '1', label: '1 giorno prima' },
    { value: '2', label: '2 giorni prima' },
    { value: '3', label: '3 giorni prima' },
    { value: '7', label: '1 settimana prima' }
  ];

  const handleNotificationChange = (id, checked) => {
    const updatedSettings = {
      ...settings,
      [id]: checked
    };
    onUpdate(updatedSettings);
  };

  const handleReminderTimeChange = (value) => {
    onUpdate({
      ...settings,
      expirationReminderDays: value
    });
  };

  const activeNotifications = Object.values(settings)?.filter(Boolean)?.length;

  return (
    <div className="glass-morphism rounded-2xl p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
            <Icon name="Bell" size={20} color="var(--color-warning)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Notifiche</h3>
            <p className="text-sm text-muted-foreground">
              {activeNotifications} notifiche attive
            </p>
          </div>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          color="var(--color-muted-foreground)" 
        />
      </button>
      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Notification Types */}
          <div className="space-y-4">
            {notificationTypes?.map((notification) => (
              <div key={notification?.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/10 transition-colors">
                <div className="mt-1">
                  <Icon name={notification?.icon} size={18} color="var(--color-muted-foreground)" />
                </div>
                <div className="flex-1">
                  <Checkbox
                    label={notification?.label}
                    description={notification?.description}
                    checked={settings?.[notification?.id] || false}
                    onChange={(e) => handleNotificationChange(notification?.id, e?.target?.checked)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Expiration Reminder Timing */}
          {settings?.expirationAlerts && (
            <div className="pt-4 border-t border-border">
              <Select
                label="Tempistica avvisi di scadenza"
                description="Quando vuoi essere avvisato prima della scadenza"
                options={reminderTimes}
                value={settings?.expirationReminderDays || '2'}
                onChange={handleReminderTimeChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;