import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const RecipeGallery = ({ images, recipeName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images?.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images?.length) % images?.length);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  if (!images || images?.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          Galleria Immagini
        </h2>
        
        <div className="bg-card rounded-lg overflow-hidden">
          {/* Main Image */}
          <div className="relative aspect-video bg-muted">
            <Image
              src={images?.[currentImageIndex]?.url}
              alt={images?.[currentImageIndex]?.alt || `${recipeName} - Immagine ${currentImageIndex + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={openFullscreen}
            />
            
            {/* Navigation Arrows */}
            {images?.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white"
                >
                  <Icon name="ChevronLeft" size={20} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white"
                >
                  <Icon name="ChevronRight" size={20} />
                </Button>
              </>
            )}
            
            {/* Fullscreen Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={openFullscreen}
              className="absolute top-2 right-2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white"
            >
              <Icon name="Maximize" size={20} />
            </Button>
            
            {/* Image Counter */}
            {images?.length > 1 && (
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {currentImageIndex + 1} / {images?.length}
              </div>
            )}
          </div>
          
          {/* Image Description */}
          {images?.[currentImageIndex]?.description && (
            <div className="p-4">
              <p className="text-sm text-card-foreground">
                {images?.[currentImageIndex]?.description}
              </p>
            </div>
          )}
          
          {/* Thumbnail Strip */}
          {images?.length > 1 && (
            <div className="p-4 border-t border-border">
              <div className="flex space-x-2 overflow-x-auto custom-scrollbar">
                {images?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                      index === currentImageIndex
                        ? 'border-primary' :'border-transparent hover:border-muted-foreground'
                    }`}
                  >
                    <Image
                      src={image?.url}
                      alt={image?.alt || `Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-1000 bg-black/95 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 text-white"
            >
              <Icon name="X" size={24} />
            </Button>
            
            {/* Navigation Arrows */}
            {images?.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white"
                >
                  <Icon name="ChevronLeft" size={24} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white"
                >
                  <Icon name="ChevronRight" size={24} />
                </Button>
              </>
            )}
            
            {/* Main Image */}
            <div className="max-w-full max-h-full">
              <Image
                src={images?.[currentImageIndex]?.url}
                alt={images?.[currentImageIndex]?.alt || `${recipeName} - Immagine ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="bg-black/50 text-white px-4 py-2 rounded-lg inline-block">
                <p className="text-sm">
                  {images?.[currentImageIndex]?.description || `Immagine ${currentImageIndex + 1} di ${images?.length}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecipeGallery;