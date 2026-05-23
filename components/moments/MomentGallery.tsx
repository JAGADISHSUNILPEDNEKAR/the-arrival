"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';
import AssetSlot from '@/components/AssetSlot';

interface ContentPanel {
  type: 'content';
  slug: string;
  index: string;
  title: string;
  sub: string;
  alignment: 'image-right' | 'image-left';
  clip?: { mp4: string; poster: string };
}

interface TitlePanel {
  type: 'title';
}

type Panel = TitlePanel | ContentPanel;

const PANELS: Panel[] = [
  { type: 'title' },
  {
    type: 'content',
    slug: 'morning-swim',
    index: '01',
    title: 'The Morning Swim',
    sub: 'An hour before anyone else.',
    alignment: 'image-right',
    clip: {
      mp4: '/assets/gallery/morning-swim.mp4',
      poster: '/assets/gallery/morning-swim.poster.jpg',
    },
  },
  {
    type: 'content',
    slug: 'walk',
    index: '02',
    title: 'The Walk',
    sub: 'From villa to lagoon, barefoot.',
    alignment: 'image-left',
    clip: {
      mp4: '/assets/gallery/walk.mp4',
      poster: '/assets/gallery/walk.poster.jpg',
    },
  },
  {
    type: 'content',
    slug: 'bath',
    index: '03',
    title: 'The Bath',
    sub: 'Stone, sea, and last light.',
    alignment: 'image-right',
    // No clip for "bath" in source video — the procedural slate
    // gradient fallback inside AssetSlot stands in.
  },
  {
    type: 'content',
    slug: 'bonfire',
    index: '04',
    title: 'The Bonfire',
    sub: 'When the kitchen closes, embers stay.',
    alignment: 'image-left',
    clip: {
      mp4: '/assets/gallery/bonfire.mp4',
      poster: '/assets/gallery/bonfire.poster.jpg',
    },
  },
];

const CONTENT_PANELS = PANELS.slice(1) as ContentPanel[];

const MomentGallery = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useScroll();

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const trackEl = trackRef.current;
    if (!sectionEl || !trackEl) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Captions are looked up via a stable class name + sorted by index so
    // the forEach order matches the panels' visual order regardless of
    // querySelector return order. Per-caption gsap.set + fromTo means every
    // caption gets its own initial state and tween, with no reliance on
    // batch-target behavior or array initial-state inheritance.
    const captionEls = Array.from(
      sectionEl.querySelectorAll<HTMLDivElement>('.gallery-caption')
    ).sort((a, b) => {
      const ai = parseInt(a.dataset.captionIndex ?? '0', 10);
      const bi = parseInt(b.dataset.captionIndex ?? '0', 10);
      return ai - bi;
    });

    const ctx = gsap.context(() => {
      gsap.set(titleRef.current, { opacity: 1, y: 0 });

      // Reduced motion: drop pin + horizontal track. Section reads as the
      // title card only; user scrolls past at normal pace.
      if (reducedMotion) {
        sectionEl.classList.add('active');
        gsap.set(sectionEl, { opacity: 1 });
        captionEls.forEach((cap) => gsap.set(cap, { opacity: 1, y: 0 }));
        return;
      }

      // Explicit per-caption initial state (rather than batched set).
      captionEls.forEach((cap) => {
        gsap.set(cap, { opacity: 0, y: 30 });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: 'top top',
          end: '+=400%',
          pin: true,
          pinSpacing: true,
          scrub: isMobile ? 0.8 : 1.2,
          onToggle: (self) => {
            sectionEl.classList.toggle('active', self.isActive);
          },
        },
      });

      // Section entry — matches every other moment's opacity reveal.
      tl.fromTo(
        sectionEl,
        { opacity: 0 },
        { opacity: 1, duration: 0.04, ease: 'cinematic' },
        0
      );

      // Hold horizontal track stationary 0 → 0.20, then translate
      // 0 → -400vw across 0.20 → 1.00. The 0.20 stationary window gives the
      // title card a proper editorial dwell beat before the gallery moves.
      tl.to(
        trackEl,
        { x: '-400vw', ease: 'none', duration: 0.80 },
        0.20
      );

      // Title fades while perfectly centered and stationary (track hasn't
      // started moving yet at 0.12 → 0.20).
      tl.to(
        titleRef.current,
        { opacity: 0, y: -40, duration: 0.08, ease: 'cinematic' },
        0.12
      );

      // Per-panel caption reveals, re-timed to align with the new track
      // motion: each content panel is fully centered at 0.40, 0.60, 0.80,
      // 1.00. Captions enter as their panel nears center and exit as the
      // next panel begins arriving.
      //
      // BOTH enter and exit are fromTo with immediateRender:false — so the
      // timeline only applies state when the playhead actually crosses each
      // tween, never on creation. This eliminates the gsap.set→.to
      // interaction that was leaving captions silently invisible.
      captionEls.forEach((cap, i) => {
        const enterAt = 0.32 + i * 0.20;
        const exitAt = 0.40 + i * 0.20;
        tl.fromTo(
          cap,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.08,
            ease: 'cinematic',
            immediateRender: false,
          },
          enterAt
        );
        if (i < CONTENT_PANELS.length - 1) {
          tl.fromTo(
            cap,
            { opacity: 1, y: 0 },
            {
              opacity: 0,
              y: -30,
              duration: 0.08,
              ease: 'power2.in',
              immediateRender: false,
            },
            exitAt
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="moment relative w-screen h-screen h-dvh overflow-hidden"
      id="moment-gallery"
      aria-label="Four other arrivals beyond the table"
    >
      <div
        ref={trackRef}
        className="absolute top-0 left-0 h-full flex"
        style={{ width: '500vw' }}
      >
        {/* === Panel 0 — Title card =================================== */}
        <div className="w-screen h-full relative flex items-center justify-center px-[10%]">
          <div ref={titleRef} className="text-center max-w-[42em] pointer-events-none">
            <span
              className="block uppercase mb-6"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(0.625rem, 0.75vw, 0.8rem)',
                letterSpacing: '0.45em',
                color: 'rgba(245,240,232,0.55)',
              }}
            >
              Four other arrivals
            </span>
            <h2
              className="italic font-light"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
                color: 'rgba(255,250,240,0.95)',
                textShadow: '0 4px 50px rgba(6,8,16,0.55)',
              }}
            >
              Beyond the table.
            </h2>
          </div>
        </div>

        {/* === Panels 1..4 — Content panels ===========================
            Each panel has its image area on the alternating side
            (image-right / image-left) for editorial rhythm. The image
            slot renders the encoded clip via HTML <video> — the gallery
            sits inside its own horizontal-pan world, so it does not
            register with WebGLContentLayer (which assumes vertical
            stacking). The WebGL layer fades out during this section
            and AtmosphereLayer carries the surrounding atmosphere. */}
        {CONTENT_PANELS.map((panel, i) => {
          const imageRight = panel.alignment === 'image-right';
          const imageSide = imageRight ? 'right-0' : 'left-0';
          const captionPos = imageRight
            ? 'md:bottom-auto md:top-[30%] md:right-auto md:left-[6%]'
            : 'md:bottom-auto md:top-[30%] md:left-auto md:right-[6%] md:text-right';
          return (
            <div key={panel.slug} className="w-screen h-full relative">
              {/* Image side — half-width on desktop, full underlay on
                  mobile. Wrapped so the caption can sit beside it. */}
              <div
                className={`absolute top-0 ${imageSide} h-full w-full md:w-1/2 pointer-events-none`}
              >
                <AssetSlot
                  id={`gallery-${panel.slug}`}
                  alt={`${panel.title} — ${panel.sub}`}
                  src={panel.clip ? { video: panel.clip.mp4, poster: panel.clip.poster } : undefined}
                  fit="cover"
                  className="w-full h-full"
                >
                  <div
                    className="w-full h-full"
                    style={{
                      background:
                        panel.slug === 'bath'
                          ? 'linear-gradient(160deg, #1a2230 0%, #2a3a4a 45%, #4a5a68 100%)'
                          : 'linear-gradient(160deg, #0e2038 0%, #1a3045 50%, #2a4055 100%)',
                    }}
                  />
                </AssetSlot>
              </div>

              {/* Caption area — class + index for stable lookup in effect */}
              <div
                className={`gallery-caption absolute z-10 max-w-[26em] pointer-events-none bottom-[8%] left-[8%] right-[8%] ${captionPos}`}
                data-caption-index={i}
              >
                <span
                  className="block italic font-light mb-2"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2.25rem, 5vw, 4.5rem)',
                    lineHeight: 1,
                    color: 'rgba(245,240,232,0.35)',
                    textShadow: '0 2px 18px rgba(6,8,16,0.6)',
                  }}
                >
                  {panel.index}
                </span>
                <h3
                  className="italic font-light mb-3"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1.5rem, 3.5vw, 3rem)',
                    lineHeight: 1.1,
                    letterSpacing: '-0.01em',
                    color: 'rgba(255,250,240,0.95)',
                    textShadow: '0 4px 40px rgba(6,8,16,0.5)',
                  }}
                >
                  {panel.title}
                </h3>
                <p
                  className="italic font-light"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(0.9rem, 1.2vw, 1.2rem)',
                    lineHeight: 1.5,
                    color: 'rgba(245,240,232,0.75)',
                  }}
                >
                  {panel.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MomentGallery;
