import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-slate-200 animate-pulse rounded-lg ${className}`}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={i === lines - 1 ? 'w-3/4 h-4' : 'w-full h-4'} />
      ))}
    </div>
  );
}

export function SkeletonCard({ count = 1, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border border-slate-200 rounded-lg">
          <Skeleton className="h-5 w-1/3 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
