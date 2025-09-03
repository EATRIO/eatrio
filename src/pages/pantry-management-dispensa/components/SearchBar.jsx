import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const SearchBar = ({ onSearch, placeholder = "Cerca ingredienti..." }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch?.('');
  };

  return (
    <div className="px-4 py-3">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Icon name="Search" size={20} color="var(--color-muted-foreground)" />
        </div>
        
        <Input
          type="search"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10 pr-10"
        />
        
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 touch-target flex items-center justify-center rounded-full hover:bg-muted/20 transition-colors duration-150"
            aria-label="Cancella ricerca"
          >
            <Icon name="X" size={16} color="var(--color-muted-foreground)" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;