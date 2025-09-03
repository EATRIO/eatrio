import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const SearchHeader = ({ 
  searchQuery, 
  onSearchChange, 
  onVoiceSearch,
  className = '' 
}) => {
  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'it-IT';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript;
        onSearchChange(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event?.error);
      };
      
      recognition?.start();
    } else {
      onVoiceSearch?.();
    }
  };

  return (
    <div className={`glass-morphism px-4 py-3 ${className}`}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <Icon name="Search" size={20} color="var(--color-muted-foreground)" />
        </div>
        
        <Input
          type="search"
          placeholder="Cerca ricette, ingredienti, cucine..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e?.target?.value)}
          className="pl-12 pr-12 bg-background/50 backdrop-blur-sm border-border/50"
        />
        
        <button
          onClick={handleVoiceSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/20 transition-colors duration-150"
          aria-label="Ricerca vocale"
        >
          <Icon name="Mic" size={18} color="var(--color-muted-foreground)" />
        </button>
      </div>
    </div>
  );
};

export default SearchHeader;