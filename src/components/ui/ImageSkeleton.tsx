// src/components/ui/ImageSkeleton.tsx
'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/utils/utils';

interface ImageWithSkeletonProps extends Omit<ImageProps, 'onLoad'> {
  skeletonClassName?: string;
}

export function ImageWithSkeleton({
  className,
  skeletonClassName,
  alt,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      {/* Skeleton */}
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0 bg-neutral-200 dark:bg-neutral-800',
            'animate-pulse',
            skeletonClassName
          )}
          aria-hidden="true"
        />
      )}

      {/* Actual Image */}
      <Image
        {...props}
        alt={alt}
        className={cn(
          className,
          'transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}