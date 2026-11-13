'use client';

// src/components/event/EventCardSkeleton.tsx

import React from 'react';

export const EventCardSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="bg-white rounded-xl border border-[#E4E4E7] overflow-hidden flex flex-col animate-pulse"
    >
      {/* Banner Skeleton 16:9 */}
      <div className="w-full aspect-video bg-[#F4F4F5] relative">
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="h-6 w-16 bg-[#E4E4E7] rounded-md" />
          <div className="h-6 w-20 bg-[#E4E4E7] rounded-full" />
        </div>
      </div>

      {/* Conteudo Skeleton */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="h-6 w-4/5 bg-[#E4E4E7] rounded" />
          <div className="h-4 w-1/2 bg-[#F4F4F5] rounded" />
          <div className="h-4 w-2/3 bg-[#F4F4F5] rounded" />
        </div>

        <div className="space-y-3 pt-3 border-t border-[#F4F4F5]">
          <div className="h-2 w-full bg-[#E4E4E7] rounded-full" />
          <div className="h-12 w-full bg-[#E4E4E7] rounded-lg" />
        </div>
      </div>
    </div>
  );
};
