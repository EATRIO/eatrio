import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const CookModeOverlay = ({ 
  isOpen = false, 
  onClose, 
  recipe = null,
  currentStep = 0,
  onStepChange,
  className = '' 
}) => {
  const [step, setStep] = useState(currentStep);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    setStep(currentStep);
  }, [currentStep]);

  useEffect(() => {
    let interval = null;
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => {
          if (seconds <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timerSeconds]);

  const handleNextStep = () => {
    if (recipe && step < recipe?.steps?.length - 1) {
      const newStep = step + 1;
      setStep(newStep);
      onStepChange?.(newStep);
    }
  };

  const handlePrevStep = () => {
    if (step > 0) {
      const newStep = step - 1;
      setStep(newStep);
      onStepChange?.(newStep);
    }
  };

  const handleStartTimer = (minutes = 5) => {
    setTimerSeconds(minutes * 60);
    setIsTimerActive(true);
  };

  const handleStopTimer = () => {
    setIsTimerActive(false);
    setTimerSeconds(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  if (!isOpen || !recipe) return null;

  const currentStepData = recipe?.steps?.[step];
  const progress = ((step + 1) / recipe?.steps?.length) * 100;

  return (
    <div className={`fixed inset-0 z-1000 bg-background ${className}`}>
      {/* Header */}
      <div className="glass-morphism px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="kitchen-safe"
          >
            <Icon name="X" size={24} />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground truncate max-w-48">
              {recipe?.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Passo {step + 1} di {recipe?.steps?.length}
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center space-x-2">
          {isTimerActive && (
            <div className="flex items-center space-x-2 bg-warning/20 px-3 py-1 rounded-full">
              <Icon name="Clock" size={16} color="var(--color-warning)" />
              <span className="text-sm font-mono font-medium text-warning">
                {formatTime(timerSeconds)}
              </span>
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => isTimerActive ? handleStopTimer() : handleStartTimer()}
            className="kitchen-safe"
          >
            <Icon name={isTimerActive ? "Pause" : "Timer"} size={20} />
          </Button>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Step Content */}
          <div className="bg-card rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-card-foreground">
              {currentStepData?.title || `Passo ${step + 1}`}
            </h2>
            <p className="text-lg text-card-foreground leading-relaxed">
              {currentStepData?.description || 'Descrizione del passo non disponibile.'}
            </p>
            
            {currentStepData?.duration && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Icon name="Clock" size={16} />
                <span className="text-sm">Tempo stimato: {currentStepData?.duration}</span>
              </div>
            )}

            {currentStepData?.temperature && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Icon name="Thermometer" size={16} />
                <span className="text-sm">Temperatura: {currentStepData?.temperature}</span>
              </div>
            )}
          </div>

          {/* Quick Timer Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 5, 10]?.map((minutes) => (
              <Button
                key={minutes}
                variant="outline"
                onClick={() => handleStartTimer(minutes)}
                className="kitchen-safe"
              >
                <Icon name="Timer" size={16} className="mr-2" />
                {minutes}m
              </Button>
            ))}
          </div>
        </div>
      </div>
      {/* Navigation Controls */}
      <div className="glass-morphism px-4 py-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={step === 0}
          className="kitchen-safe"
        >
          <Icon name="ChevronLeft" size={20} className="mr-2" />
          Precedente
        </Button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground font-mono">
            {step + 1}/{recipe?.steps?.length}
          </span>
        </div>

        <Button
          variant={step === recipe?.steps?.length - 1 ? "success" : "default"}
          onClick={step === recipe?.steps?.length - 1 ? onClose : handleNextStep}
          className="kitchen-safe"
        >
          {step === recipe?.steps?.length - 1 ? (
            <>
              <Icon name="Check" size={20} className="mr-2" />
              Completa
            </>
          ) : (
            <>
              Successivo
              <Icon name="ChevronRight" size={20} className="ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CookModeOverlay;