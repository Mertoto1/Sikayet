'use client';

import { useState, useEffect } from 'react';

export default function SidebarViewCount({ initialCount }: { initialCount: number }) {
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

  return <span className="text-gray-900 font-medium">{viewCount} kez</span>;
}