import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

function normalizeSteps(steps) {
  const arr = Array.isArray(steps) ? steps : [];
  return arr.map((s, idx) => {
    const safeId = (s && (s.id ?? null)) ?? (idx + 1);
    const tRaw = Number(s?.timerMinutes);
    const timerMinutes = Number.isFinite(tRaw) && tRaw > 0 ? tRaw : null;

    return {
      id: safeId,
      title: s?.title || `Step ${idx + 1}`,
      description: s?.description || '',
      type: s?.type || 'step',
      duration: s?.duration || null,
      timerMinutes,
      temperature: s?.temperature || null,
      equipment: s?.equipment || null,
      tips: s?.tips || null,
      hasDetails: !!s?.hasDetails,
      detailedInstructions: s?.detailedInstructions || '',
    };
  });
}

const CookingInstructions = ({
  steps,
  checkedSteps = [],
  onStepCheck = () => {},
  onStartTimer = () => {},
}) => {
  const safeSteps = useMemo(() => normalizeSteps(steps), [steps]);
  const [expandedSteps, setExpandedSteps] = useState(new Set());

  const toggleStepExpansion = (stepId) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const getStepIcon = (step) => {
    switch (step?.type) {
      case 'prep': return 'Knife';
      case 'cook': return 'Flame';
      case 'mix':  return 'Shuffle';
      case 'wait': return 'Clock';
      default:     return 'ChefHat';
    }
  };

  const getStepColor = (step) => {
    switch (step?.type) {
      case 'prep': return 'var(--color-accent)';
      case 'cook': return 'var(--color-warning)';
      case 'mix':  return 'var(--color-primary)';
      case 'wait': return 'var(--color-secondary)';
      default:     return 'var(--color-foreground)';
    }
  };

  const total = safeSteps.length;
  const completed = safeSteps.reduce((acc, s) => acc + (checkedSteps?.includes(s.id) ? 1 : 0), 0);
  const progress = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Istruzioni di Cottura</h2>

      <div className="space-y-4">
        {safeSteps.map((step, index) => {
          const isChecked = checkedSteps?.includes(step.id);
          const isExpanded = expandedSteps.has(step.id);

          return (
            <div
              key={`step-${step.id}-${index}`}
              className={`bg-card rounded-lg border transition-all duration-150 ${
                isChecked ? 'border-primary/30 bg-primary/5' : 'border-border'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  {/* Step Number & Checkbox */}
                  <div className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isChecked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <Checkbox
                      checked={!!isChecked}
                      onChange={(e) => {
                        try {
                          onStepCheck(step.id, !!e?.target?.checked);
                        } catch {}
                      }}
                    />
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon name={getStepIcon(step)} size={16} color={getStepColor(step)} />
                        <h3
                          className={`font-medium ${
                            isChecked ? 'line-through text-muted-foreground' : 'text-card-foreground'
                          }`}
                        >
                          {step.title}
                        </h3>
                      </div>

                      {step.duration && (
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Icon name="Clock" size={14} />
                          <span className="text-sm">{step.duration}</span>
                        </div>
                      )}
                    </div>

                    {/* Step Description */}
                    {step.description && (
                      <p
                        className={`text-sm leading-relaxed ${
                          isChecked ? 'line-through text-muted-foreground' : 'text-card-foreground'
                        }`}
                      >
                        {step.description}
                      </p>
                    )}

                    {/* Step Details */}
                    {(step.temperature || step.tips || step.equipment) && (
                      <div className="space-y-2">
                        {step.temperature && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Icon name="Thermometer" size={14} />
                            <span>Temperatura: {step.temperature}</span>
                          </div>
                        )}

                        {step.equipment && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Icon name="Wrench" size={14} />
                            <span>Attrezzatura: {step.equipment}</span>
                          </div>
                        )}

                        {step.tips && (
                          <div className="bg-accent/10 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                              <Icon name="Lightbulb" size={14} color="var(--color-accent)" />
                              <p className="text-sm text-card-foreground">
                                <span className="font-medium text-accent">Consiglio:</span> {step.tips}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {Number.isFinite(step.timerMinutes) && step.timerMinutes > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            try {
                              onStartTimer(step.timerMinutes, step.title);
                            } catch {}
                          }}
                          className="text-xs"
                        >
                          <Icon name="Timer" size={14} className="mr-1" />
                          Timer {step.timerMinutes}m
                        </Button>
                      )}

                      {step.hasDetails && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStepExpansion(step.id)}
                          className="text-xs"
                        >
                          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={14} className="mr-1" />
                          {isExpanded ? 'Meno dettagli' : 'Più dettagli'}
                        </Button>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && step.detailedInstructions && (
                      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                        <h4 className="text-sm font-medium text-card-foreground">Istruzioni dettagliate:</h4>
                        <p className="text-sm text-card-foreground leading-relaxed">{step.detailedInstructions}</p>
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
              Progresso: {completed}/{total} passi completati
            </span>
          </div>
          <div className="w-24 bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookingInstructions;
