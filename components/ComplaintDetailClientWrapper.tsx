'use client';

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import ImageGalleryModal from '@/components/ImageGalleryModal';
import dynamic from 'next/dynamic';

const MarkAsSolvedButton = dynamic(() => import('@/components/MarkAsSolvedButton'));

export default function ComplaintDetailClientWrapper({ 
  children, 
  isCompanyRep,
  isComplaintOwner,
  complaintId,
  complaintStatus
}: { 
  children: React.ReactNode;
  isCompanyRep: boolean;
  isComplaintOwner: boolean;
  complaintId: string;
  complaintStatus: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ images: { id: number; url: string }[]; initialIndex: number } | null>(null);
  const viewCountIncremented = useRef(false);

  useEffect(() => {
    // Only increment view count once per complaint ID
    if (viewCountIncremented.current) {
      return;
    }
    
    viewCountIncremented.current = true;
    
    // Always increment view count on server - server will handle deduplication via cookies
    fetch(`/api/complaints/${complaintId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Dispatch a custom event to update the view count in the DOM
        window.dispatchEvent(new CustomEvent('viewCountUpdated', { detail: data.viewCount }));
      }
    })
    .catch(error => {
      console.error('Failed to increment view count:', error);
      viewCountIncremented.current = false; // Reset on error to allow retry
    });
  }, [complaintId]);

  useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      setModalData(event.detail);
      setIsModalOpen(true);
    };

    // Add event listener for custom event
    window.addEventListener('openImageModal', handleOpenModal as EventListener);

    // Handle image clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const parent = target.closest('[data-image-index]');
      
      if (parent) {
        const index = parent.getAttribute('data-image-index');
        if (index !== null) {
          // Get all images from the page
          const imageElements = document.querySelectorAll('[data-image-id]');
          const images = Array.from(imageElements).map(el => {
            const imgEl = el.querySelector('img');
            return {
              id: parseInt(el.getAttribute('data-image-id') || '0'),
              url: imgEl?.src || ''
            };
          });
          
          setModalData({
            images,
            initialIndex: parseInt(index)
          });
          setIsModalOpen(true);
        }
      }
    };

    // Add click listener to the document
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('openImageModal', handleOpenModal as EventListener);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      {children}
      {isModalOpen && modalData && (
        <ImageGalleryModal
          images={modalData.images}
          initialIndex={modalData.initialIndex}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {isComplaintOwner && complaintStatus !== 'SOLVED' && (
        <div className="fixed bottom-6 right-6 z-50">
          <MarkAsSolvedButton complaintId={complaintId} isSolved={complaintStatus === 'SOLVED'} />
        </div>
      )}
    </>
  );
}