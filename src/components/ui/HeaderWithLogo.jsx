// src/components/ui/HeaderWithLogo.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

// === Branding logo persistente (localStorage) ===
const BRANDING_KEY = 'eatrio:branding:logoDataUrl';
const loadBrandLogo = () => {
  try { return localStorage.getItem(BRANDING_KEY) || null; } catch { return null; }
};

const HeaderWithLogo = ({
  showBackButton = false,
  title = 'EATRIO',
  actions = [],
  className = '',
  variant = 'glass', // 'glass' | 'solid'
  motto = '',        // motto opzionale
}) => {
  const navigate = useNavigate();
  const [brandLogo, setBrandLogo] = useState(() => loadBrandLogo());
  const fileRef = useRef(null);

  useEffect(() => {
    // aggiorna se un’altra tab cambia il logo
    const onStorage = (e) => {
      if (e && e.key === BRANDING_KEY) setBrandLogo(e.newValue || null);
    };
    // hotkeys: Alt+L carica logo — Alt+Shift+L resetta
    const onHotkey = (e) => {
      if (!e.altKey) return;
      const k = e.key?.toLowerCase?.();
      if (k === 'l' && !e.shiftKey) {
        e.preventDefault();
        fileRef.current?.click();
      } else if (k === 'l' && e.shiftKey) {
        e.preventDefault();
        localStorage.removeItem(BRANDING_KEY);
        setBrandLogo(null);
        alert('Logo ripristinato al default.');
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('keydown', onHotkey);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('keydown', onHotkey);
    };
  }, []);

  const handlePickLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        localStorage.setItem(BRANDING_KEY, reader.result);
        setBrandLogo(reader.result);
        alert('Logo aggiornato! (Alt+Shift+L per ripristinare)');
      } catch {
        alert('Impossibile salvare il logo (dimensione troppo grande?)');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoClick = () => navigate('/home-dashboard-cucina-adesso');
  const handleBackClick = () => navigate(-1);

  const baseStyle =
    'fixed top-0 left-0 right-0 z-100 ' +
    (variant === 'solid' ? 'bg-background border-b border-border' : 'glass-morphism');

  // Brand (logo + fallback)
  const BrandBlock = ({ size = 'lg' }) => {
    const logoClass = size === 'lg'
      ? 'h-10 sm:h-12 w-auto'
      : 'h-8 w-auto';
    return (
      <button
        onClick={handleLogoClick}
        className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        aria-label="Vai alla Home"
        title="Vai alla Home"
      >
        {brandLogo ? (
          <img
            src={brandLogo}
            alt="Logo"
            className={`${logoClass} object-contain rounded-sm`}
            draggable={false}
          />
        ) : (
          <>
            <div className={`${size === 'lg' ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-8 h-8'} bg-primary rounded-lg flex items-center justify-center`}>
              <Icon name="ChefHat" size={size === 'lg' ? 24 : 20} color="var(--color-primary-foreground)" />
            </div>
            <span className={`${size === 'lg' ? 'text-2xl' : 'text-xl'} font-bold text-foreground font-sans`}>
              EATRIO
            </span>
          </>
        )}
      </button>
    );
  };

  return (
    <header className={`${baseStyle} ${className}`}>
      {/* input nascosto per caricare il logo (Alt+L) */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handlePickLogo}
        style={{ display: 'none' }}
      />

      {/* Header a 3 colonne: brand/back | centro (titolo+motto) | azioni */}
      <div className="h-18 sm:h-20 px-4 grid grid-cols-[auto,1fr,auto] items-center gap-3">
        {/* Colonna sinistra */}
        <div className="flex items-center gap-2 min-w-0">
          {showBackButton && (
            <button
              onClick={handleBackClick}
              className="touch-target flex items-center justify-center rounded-lg hover:bg-muted/20 transition-colors duration-150"
              aria-label="Torna indietro"
            >
              <Icon name="ArrowLeft" size={24} color="var(--color-foreground)" />
            </button>
          )}
          {/* Logo sempre visibile (grande se non c’è back, compatto se c’è) */}
          <div className="flex items-center">
            <BrandBlock size={showBackButton ? 'sm' : 'lg'} />
          </div>
        </div>

        {/* Colonna centrale: Title + Motto (usa lo spazio, niente buco a destra) */}
        <div className="min-w-0 text-center sm:text-left">
          {title ? (
            <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
              {title}
            </h1>
          ) : null}
          {motto ? (
            <p className={`truncate ${title ? 'text-xs' : 'text-sm sm:text-base'} text-muted-foreground`}>
              {motto}
            </p>
          ) : null}
        </div>

        {/* Colonna destra: Actions */}
        <div className="flex items-center justify-end gap-2">
          {actions?.length > 0 && actions.map((action, index) => (
            <button
              key={index}
              onClick={action?.onClick}
              className="touch-target flex items-center justify-center rounded-lg hover:bg-muted/20 transition-colors duration-150"
              aria-label={action?.label}
              disabled={action?.disabled}
              title={action?.label}
            >
              <Icon
                name={action?.icon}
                size={24}
                color={
                  action?.disabled
                    ? 'var(--color-muted-foreground)'
                    : 'var(--color-foreground)'
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Mobile title (non più necessario: il centro già gestisce tutto) */}
    </header>
  );
};

export default HeaderWithLogo;
