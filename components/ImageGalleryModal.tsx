'use client';

import { useState, useEffect, useRef } from 'react';

interface ImageGalleryModalProps {
  images: { id: number; url: string }[];
  initialIndex?: number;
  onClose: () => void;
}

export default function ImageGalleryModal({ images, initialIndex = 0, onClose }: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const modalRef = useRef<HTMLDivElement>(null);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  // Close modal when clicking outside the image
  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && e.target === modalRef.current) {
      onClose();
    }
  };

  // Add event listeners for keyboard navigation and outside clicks
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown as any);
    window.addEventListener('click', handleClickOutside);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown as any);
      window.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (images.length === 0) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Close"
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-6 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-30 rounded-full p-3 hover:bg-opacity-50"
            aria-label="Previous image"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-6 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-30 rounded-full p-3 hover:bg-opacity-50"
            aria-label="Next image"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Image counter */}
      <div className="absolute top-6 left-6 text-white text-lg font-bold bg-black bg-opacity-30 rounded-full px-4 py-2">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main image container */}
      <div className="flex items-center justify-center w-full h-full relative">
        <img
          src={images[currentIndex].url}
          alt={`Kanıt ${currentIndex + 1}`}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
        />
      </div>

      {/* Thumbnails for navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 max-w-[90vw] overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex 
                  ? 'border-indigo-500 shadow-lg scale-105' 
                  : 'border-white border-opacity-30 hover:border-opacity-60'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}