import React from 'react';
import Icon from '../../../components/AppIcon';

const ProfileHeader = ({ userStats }) => {
  return (
    <div className="space-y-4">
      {/* User Avatar & Basic Info */}
      <div className="glass-morphism rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Icon name="User" size={32} color="var(--color-primary-foreground)" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Marco Rossi</h1>
            <p className="text-muted-foreground">Chef domestico da 2 anni</p>
            <div className="flex items-center space-x-2 mt-1">
              <Icon name="MapPin" size={14} color="var(--color-muted-foreground)" />
              <span className="text-sm text-muted-foreground">Milano, Italia</span>
            </div>
          </div>
        </div>
      </div>
      {/* Monthly Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-morphism rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
              <Icon name="PiggyBank" size={20} color="var(--color-success)" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">€{userStats?.monthlySavings}</p>
              <p className="text-sm text-muted-foreground">Risparmiati questo mese</p>
            </div>
          </div>
        </div>

        <div className="glass-morphism rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Icon name="Leaf" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{userStats?.wasteReduced}kg</p>
              <p className="text-sm text-muted-foreground">Spreco evitato</p>
            </div>
          </div>
        </div>

        <div className="glass-morphism rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <Icon name="ChefHat" size={20} color="var(--color-accent)" />
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{userStats?.recipesCooked}</p>
              <p className="text-sm text-muted-foreground">Ricette cucinate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;