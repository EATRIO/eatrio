import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AnalyticsInsights = ({ analytics }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const monthlyData = [
    { month: 'Gen', savings: 45, recipes: 12 },
    { month: 'Feb', savings: 52, recipes: 15 },
    { month: 'Mar', savings: 38, recipes: 10 },
    { month: 'Apr', savings: 67, recipes: 18 },
    { month: 'Mag', savings: 73, recipes: 22 },
    { month: 'Giu', savings: 89, recipes: 25 }
  ];

  const favoriteIngredients = [
    { name: 'Pomodori', count: 45, color: '#EF4444' },
    { name: 'Pasta', count: 38, color: '#F59E0B' },
    { name: 'Basilico', count: 32, color: '#10B981' },
    { name: 'Aglio', count: 28, color: '#8B5CF6' },
    { name: 'Olio EVO', count: 25, color: '#06B6D4' }
  ];

  const cookingPatterns = [
    { day: 'Lun', meals: 2 },
    { day: 'Mar', meals: 3 },
    { day: 'Mer', meals: 1 },
    { day: 'Gio', meals: 2 },
    { day: 'Ven', meals: 4 },
    { day: 'Sab', meals: 3 },
    { day: 'Dom', meals: 2 }
  ];

  return (
    <div className="glass-morphism rounded-2xl p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
            <Icon name="BarChart3" size={20} color="var(--color-accent)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Statistiche Personali</h3>
            <p className="text-sm text-muted-foreground">
              I tuoi progressi culinari e di risparmio
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
        <div className="mt-6 space-y-8">
          {/* Monthly Savings Trend */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4 flex items-center space-x-2">
              <Icon name="TrendingUp" size={16} color="var(--color-success)" />
              <span>Andamento Risparmi Mensili</span>
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Bar 
                    dataKey="savings" 
                    fill="var(--color-success)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Favorite Ingredients */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4 flex items-center space-x-2">
              <Icon name="Heart" size={16} color="var(--color-error)" />
              <span>Ingredienti Più Utilizzati</span>
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={favoriteIngredients}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="count"
                    >
                      {favoriteIngredients?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry?.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {favoriteIngredients?.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: ingredient?.color }}
                      />
                      <span className="text-sm text-foreground">{ingredient?.name}</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {ingredient?.count} volte
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cooking Patterns */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4 flex items-center space-x-2">
              <Icon name="Calendar" size={16} color="var(--color-primary)" />
              <span>Pattern di Cucina Settimanale</span>
            </h4>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cookingPatterns}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Bar 
                    dataKey="meals" 
                    fill="var(--color-primary)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/10 rounded-lg">
              <p className="text-2xl font-bold text-primary">127</p>
              <p className="text-xs text-muted-foreground">Ricette totali</p>
            </div>
            <div className="text-center p-4 bg-muted/10 rounded-lg">
              <p className="text-2xl font-bold text-success">€342</p>
              <p className="text-xs text-muted-foreground">Risparmi totali</p>
            </div>
            <div className="text-center p-4 bg-muted/10 rounded-lg">
              <p className="text-2xl font-bold text-accent">23kg</p>
              <p className="text-xs text-muted-foreground">Spreco evitato</p>
            </div>
            <div className="text-center p-4 bg-muted/10 rounded-lg">
              <p className="text-2xl font-bold text-warning">4.8</p>
              <p className="text-xs text-muted-foreground">Rating medio</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsInsights;