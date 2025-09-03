import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const CookingInstructions = ({ 
  steps, 
  checkedSteps,
  onStepCheck,
  onStartTimer 
}) => {
  const [expandedSteps, setExpandedSteps] = useState(new Set());

  const toggleStepExpansion = (stepId) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded?.has(stepId)) {
      newExpanded?.delete(stepId);
    } else {
      newExpanded?.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepIcon = (step) => {
    switch (step?.type) {
      case 'prep':
        return 'Knife';
      case 'cook':
        return 'Flame';
      case 'mix':
        return 'Shuffle';
      case 'wait':
        return 'Clock';
      default:
        return 'ChefHat';
    }
  };

  const getStepColor = (step) => {
    switch (step?.type) {
      case 'prep':
        return 'var(--color-accent)';
      case 'cook':
        return 'var(--color-warning)';
      case 'mix':
        return 'var(--color-primary)';
      case 'wait':
        return 'var(--color-secondary)';
      default:
        return 'var(--color-foreground)';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
        Istruzioni di Cottura
      </h2>
      <div className="space-y-4">
        {steps?.map((step, index) => {
          const isChecked = checkedSteps?.includes(step?.id);
          const isExpanded = expandedSteps?.has(step?.id);
          
          return (
            <div
              key={step?.id}
              className={`bg-card rounded-lg border transition-all duration-150 ${
                isChecked ? 'border-primary/30 bg-primary/5' : 'border-border'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  {/* Step Number & Checkbox */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      isChecked 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) => onStepCheck(step?.id, e?.target?.checked)}
                    />
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon 
                          name={getStepIcon(step)} 
                          size={16} 
                          color={getStepColor(step)} 
                        />
                        <h3 className={`font-medium ${
                          isChecked ? 'line-through text-muted-foreground' : 'text-card-foreground'
                        }`}>
                          {step?.title}
                        </h3>
                      </div>
                      
                      {step?.duration && (
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Icon name="Clock" size={14} />
                          <span className="text-sm">{step?.duration}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Step Description */}
                    <p className={`text-sm leading-relaxed ${
                      isChecked ? 'line-through text-muted-foreground' : 'text-card-foreground'
                    }`}>
                      {step?.description}
                    </p>
                    
                    {/* Step Details */}
                    {(step?.temperature || step?.tips || step?.equipment) && (
                      <div className="space-y-2">
                        {step?.temperature && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Icon name="Thermometer" size={14} />
                            <span>Temperatura: {step?.temperature}</span>
                          </div>
                        )}
                        
                        {step?.equipment && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Icon name="Wrench" size={14} />
                            <span>Attrezzatura: {step?.equipment}</span>
                          </div>
                        )}
                        
                        {step?.tips && (
                          <div className="bg-accent/10 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                              <Icon name="Lightbulb" size={14} color="var(--color-accent)" />
                              <p className="text-sm text-card-foreground">
                                <span className="font-medium text-accent">Consiglio:</span> {step?.tips}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {step?.timerMinutes && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStartTimer(step?.timerMinutes, step?.title)}
                          className="text-xs"
                        >
                          <Icon name="Timer" size={14} className="mr-1" />
                          Timer {step?.timerMinutes}m
                        </Button>
                      )}
                      
                      {step?.hasDetails && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStepExpansion(step?.id)}
                          className="text-xs"
                        >
                          <Icon 
                            name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                            size={14} 
                            className="mr-1" 
                          />
                          {isExpanded ? 'Meno dettagli' : 'Più dettagli'}
                        </Button>
                      )}
                    </div>
                    
                    {/* Expanded Details */}
                    {isExpanded && step?.detailedInstructions && (
                      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                        <h4 className="text-sm font-medium text-card-foreground">
                          Istruzioni dettagliate:
                        </h4>
                        <p className="text-sm text-card-foreground leading-relaxed">
                          {step?.detailedInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Progress Summary */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} color="var(--color-success)" />
            <span className="text-sm font-medium text-foreground">
              Progresso: {checkedSteps?.length}/{steps?.length} passi completati
            </span>
          </div>
          <div className="w-24 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(checkedSteps?.length / steps?.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookingInstructions;