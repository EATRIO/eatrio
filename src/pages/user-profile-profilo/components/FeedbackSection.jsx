import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FeedbackSection = ({ onSubmitFeedback }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState({
    type: '',
    rating: '',
    message: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { value: 'bug', label: 'Segnalazione Bug' },
    { value: 'feature', label: 'Richiesta Funzionalità' },
    { value: 'recipe', label: 'Feedback su Ricetta' },
    { value: 'general', label: 'Feedback Generale' },
    { value: 'improvement', label: 'Suggerimento Miglioramento' }
  ];

  const ratingOptions = [
    { value: '5', label: '⭐⭐⭐⭐⭐ Eccellente' },
    { value: '4', label: '⭐⭐⭐⭐ Buono' },
    { value: '3', label: '⭐⭐⭐ Discreto' },
    { value: '2', label: '⭐⭐ Scarso' },
    { value: '1', label: '⭐ Pessimo' }
  ];

  const handleInputChange = (field, value) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!feedback?.type || !feedback?.message) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSubmitFeedback?.(feedback);
      
      // Reset form
      setFeedback({
        type: '',
        rating: '',
        message: '',
        email: ''
      });
      
      console.log('Feedback inviato con successo');
    } catch (error) {
      console.error('Errore nell\'invio del feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = feedback?.type && feedback?.message?.trim()?.length > 10;

  return (
    <div className="glass-morphism rounded-2xl p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
            <Icon name="MessageSquare" size={20} color="var(--color-accent)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Aiutaci a migliorare EATRIO
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
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Feedback Type */}
          <Select
            label="Tipo di feedback"
            placeholder="Seleziona il tipo di feedback"
            options={feedbackTypes}
            value={feedback?.type}
            onChange={(value) => handleInputChange('type', value)}
            required
          />

          {/* Rating */}
          <Select
            label="Valutazione generale (opzionale)"
            placeholder="Come valuti la tua esperienza?"
            options={ratingOptions}
            value={feedback?.rating}
            onChange={(value) => handleInputChange('rating', value)}
          />

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Messaggio *
            </label>
            <textarea
              className="w-full min-h-24 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Descrivi il tuo feedback, suggerimento o problema..."
              value={feedback?.message}
              onChange={(e) => handleInputChange('message', e?.target?.value)}
              required
              minLength={10}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimo 10 caratteri ({feedback?.message?.length}/10)
            </p>
          </div>

          {/* Email */}
          <Input
            label="Email per risposta (opzionale)"
            type="email"
            placeholder="tuo@email.com"
            value={feedback?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            description="Lascia la tua email se vuoi ricevere una risposta"
          />

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Icon name="Shield" size={14} />
              <span>Il tuo feedback è anonimo e sicuro</span>
            </div>
            <Button
              type="submit"
              variant="default"
              disabled={!isFormValid || isSubmitting}
              loading={isSubmitting}
              iconName="Send"
              iconPosition="right"
            >
              Invia Feedback
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FeedbackSection;