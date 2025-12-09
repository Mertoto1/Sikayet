'use client';

import { useState, useEffect } from 'react';

export default function ViewCountUpdater({ initialCount }: { initialCount: number }) {
  const [viewCount, setViewCount] = useState(initialCount);

  useEffect(() => {
    const handleViewCountUpdate = (event: CustomEvent) => {
      setViewCount(event.detail);
    };

    window.addEventListener('viewCountUpdated', handleViewCountUpdate as EventListener);

    return () => {
      window.removeEventListener('viewCountUpdated', handleViewCountUpdate as EventListener);
    };
  }, []);

  return <span>{viewCount} görüntülenme</span>;
}