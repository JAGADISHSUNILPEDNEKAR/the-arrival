"use client";

import React, { forwardRef, useEffect, useState } from 'react';

export interface AssetSources {
  /** Static image (jpg/webp/avif). Used as primary when no video, also as video poster fallback. */
  image?: string;
  /** Video (mp4/webm). Takes precedence over image when both are provided. */
  video?: string;
  /** Optional explicit poster URL. Falls back to `image` if omitted. */
  poster?: string;
}

export interface AssetSlotProps {
  /** Semantic identifier (e.g. "moment-02-island"). Surfaced as data-asset-slot for inspection. */
  id: string;
  /** Asset sources. When omitted, the procedural fallback children render unchanged. */
  src?: AssetSources;
  /** Alt text. Required for accessibility when an image renders. */
  alt?: string;
  /** Object-fit on the rendered media. Default "cover". */
  fit?: 'cover' | 'contain' | 'fill';
  /** Whether to fade the asset in once it has loaded. Default true. */
  fadeIn?: boolean;
  /** Loading hint for images. Default "lazy". Use "eager" above the fold. */
  loading?: 'lazy' | 'eager';
  /** Tailwind / class names applied to the wrapper div. */
  className?: string;
  /** Inline styles applied to the wrapper div. */
  style?: React.CSSProperties;
  /** Procedural fallback. Renders verbatim when no src is supplied. */
  children?: React.ReactNode;
}

/**
 * AssetSlot — swappable image/video region with a procedural fallback.
 *
 * Use the children as the fallback rendering today; when real photography or
 * footage exists tomorrow, pass `src` and the slot fades the asset in over the
 * fallback. The wrapper stays at the same DOM position so GSAP refs on the
 * outer positioned ancestor keep animating correctly.
 *
 * Asset path convention: `public/assets/{moment-id}/{slot-id}.{ext}`.
 */
const AssetSlot = forwardRef<HTMLDivElement, AssetSlotProps>(function AssetSlot(
  {
    id,
    src,
    alt,
    fit = 'cover',
    fadeIn = true,
    loading = 'lazy',
    className,
    style,
    children,
  },
  ref
) {
  const hasVideo = !!src?.video;
  const hasImage = !!src?.image;
  const hasAsset = hasVideo || hasImage;

  // SSR-safe: first paint always renders the image. After mount, swap to
  // video only if the user has not asked for reduced motion. This avoids a
  // hydration mismatch and keeps autoplay accessible.
  const [useVideo, setUseVideo] = useState(false);
  const [loaded, setLoaded] = useState(!fadeIn);

  useEffect(() => {
    if (!hasVideo) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // rAF defers the state flip out of the effect body to satisfy
    // react-hooks/set-state-in-effect.
    const rafId = requestAnimationFrame(() => setUseVideo(true));
    return () => cancelAnimationFrame(rafId);
  }, [hasVideo]);

  if (!hasAsset) {
    return (
      <div
        ref={ref}
        className={className}
        style={style}
        data-asset-slot={id}
        data-asset-state="fallback"
      >
        {children}
      </div>
    );
  }

  const fadeStyle: React.CSSProperties = fadeIn
    ? {
        opacity: loaded ? 1 : 0,
        transition: 'opacity 700ms ease-out',
      }
    : {};

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      data-asset-slot={id}
      data-asset-state={useVideo ? 'video' : 'image'}
    >
      {useVideo ? (
        <video
          src={src!.video}
          poster={src!.poster || src!.image}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onLoadedData={() => setLoaded(true)}
          className="w-full h-full"
          style={{ objectFit: fit, ...fadeStyle }}
          aria-label={alt}
        />
      ) : (
        // next/image needs explicit width/height or fill + relative parent.
        // For a generic procedural-fallback primitive that may receive remote
        // URLs of unknown dimensions, raw <img> is the simpler contract.
        // When real curated assets arrive, migrate per-slot to <Image fill>.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!.poster || src!.image}
          alt={alt || ''}
          loading={loading}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className="w-full h-full"
          style={{ objectFit: fit, ...fadeStyle }}
        />
      )}
    </div>
  );
});

export default AssetSlot;
