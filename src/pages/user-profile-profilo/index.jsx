import React, { useState, useEffect } from 'react';
import HeaderWithLogo from '../../components/ui/HeaderWithLogo';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import ProfileHeader from './components/ProfileHeader';
import DietaryPreferences from './components/DietaryPreferences';
import CookingPreferences from './components/CookingPreferences';
import NotificationSettings from './components/NotificationSettings';
import AppearanceSettings from './components/AppearanceSettings';
import AnalyticsInsights from './components/AnalyticsInsights';
import ExportSection from './components/ExportSection';
import FeedbackSection from './components/FeedbackSection';

const UserProfile = () => {
  const [userStats, setUserStats] = useState({
    monthlySavings: 89,
    wasteReduced: 12.5,
    recipesCooked: 25
  });

  const [dietaryPreferences, setDietaryPreferences] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: true,
    lactoseFree: false,
    nutFree: false,
    lowSodium: false,
    customRestrictions: "Evitare peperoncino piccante"
  });

  const [cookingPreferences, setCookingPreferences] = useState({
    skillLevel: 'intermediate',
    maxCookingTime: '30',
    availableTools: {
      oven: true,
      microwave: true,
      airFryer: false,
      slowCooker: false,
      blender: true,
      foodProcessor: false,
      grill: true,
      steamer: false
    }
  });

  const [notificationSettings, setNotificationSettings] = useState({
    expirationAlerts: true,
    lowStockWarnings: true,
    recipeSuggestions: true,
    shoppingReminders: false,
    cookingTips: true,
    expirationReminderDays: '2'
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    language: 'it',
    enableAnimations: true,
    enableHaptics: true
  });

  const [analytics] = useState({
    totalRecipes: 127,
    totalSavings: 342,
    wasteAvoided: 23,
    averageRating: 4.8
  });

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('eatrio-user-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setDietaryPreferences(prev => ({ ...prev, ...parsed?.dietary }));
        setCookingPreferences(prev => ({ ...prev, ...parsed?.cooking }));
        setNotificationSettings(prev => ({ ...prev, ...parsed?.notifications }));
        setAppearanceSettings(prev => ({ ...prev, ...parsed?.appearance }));
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = () => {
    const preferences = {
      dietary: dietaryPreferences,
      cooking: cookingPreferences,
      notifications: notificationSettings,
      appearance: appearanceSettings
    };
    localStorage.setItem('eatrio-user-preferences', JSON.stringify(preferences));
  };

  useEffect(() => {
    savePreferences();
  }, [dietaryPreferences, cookingPreferences, notificationSettings, appearanceSettings]);

  const handleFloatingAction = (action) => {
    switch (action) {
      case 'quick-settings':
        // Scroll to appearance settings
        document.querySelector('[data-section="appearance"]')?.scrollIntoView({ 
          behavior: 'smooth' 
        });
        break;
      default:
        console.log('Quick settings action:', action);
    }
  };

  const handleExport = (exportType) => {
    console.log('Exporting:', exportType);
    // In a real app, this would trigger the actual export process
  };

  const handleFeedbackSubmit = (feedback) => {
    console.log('Feedback submitted:', feedback);
    // In a real app, this would send feedback to the server
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderWithLogo 
        title="Profilo" 
        className="lg:pr-64"
      />
      <main className="pt-16 pb-24 lg:pb-6 lg:pl-64">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Profile Header with Stats */}
          <ProfileHeader userStats={userStats} />

          {/* Desktop Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Settings */}
            <div className="space-y-6">
              <DietaryPreferences 
                preferences={dietaryPreferences}
                onUpdate={setDietaryPreferences}
              />
              
              <CookingPreferences 
                preferences={cookingPreferences}
                onUpdate={setCookingPreferences}
              />
              
              <NotificationSettings 
                settings={notificationSettings}
                onUpdate={setNotificationSettings}
              />
              
              <div data-section="appearance">
                <AppearanceSettings 
                  settings={appearanceSettings}
                  onUpdate={setAppearanceSettings}
                />
              </div>
            </div>

            {/* Right Column - Analytics & Actions */}
            <div className="space-y-6">
              <AnalyticsInsights analytics={analytics} />
              
              <ExportSection onExport={handleExport} />
              
              <FeedbackSection onSubmitFeedback={handleFeedbackSubmit} />
            </div>
          </div>

          {/* Footer Info */}
          <div className="glass-morphism rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">E</span>
              </div>
              <span className="text-lg font-bold text-foreground">EATRIO</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Versione 1.0.0 • © {new Date()?.getFullYear()} EATRIO
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Cucina intelligente per un futuro sostenibile
            </p>
          </div>
        </div>
      </main>
      <BottomTabNavigation />
      <FloatingActionButton onClick={handleFloatingAction} />
    </div>
  );
};

export default UserProfile;