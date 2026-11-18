'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  alt: string;
}

/**
 * SafeImage gracefully handles:
 * - base64 data URIs (user uploaded files) via native <img> without Next.js optimizer preload crashes
 * - blob URLs
 * - local static assets (/assets/...)
 * - remote URLs
 * - empty/null sources
 */
export default function SafeImage({
  src,
  alt,
  className = '',
  fill = false,
  priority = false,
  unoptimized = true,
  sizes,
  ...props
}: SafeImageProps) {
  if (!src) {
    return (
      <div
        className={`bg-secondary/60 flex items-center justify-center text-[10px] text-muted-foreground select-none ${className}`}
      >
        <span>No Photo</span>
      </div>
    );
  }

  const isDataOrBlob = typeof src === 'string' && (src.startsWith('data:') || src.startsWith('blob:'));

  if (isDataOrBlob) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`${fill ? 'absolute inset-0 w-full h-full object-cover' : ''} ${className}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...props}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      priority={priority}
      unoptimized={unoptimized}
      sizes={sizes}
      className={className}
      {...props}
    />
  );
}
