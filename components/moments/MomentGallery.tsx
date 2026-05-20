"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

interface ContentPanel {
  type: 'content';
  slug: string;
  index: string;
  title: string;
  sub: string;
  alignment: 'image-right' | 'image-left';
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
  },
  {
    type: 'content',
    slug: 'walk',
    index: '02',
    title: 'The Walk',
    sub: 'From villa to lagoon, barefoot.',
    alignment: 'image-left',
  },
  {
    type: 'content',
    slug: 'bath',
    index: '03',
    title: 'The Bath',
    sub: 'Stone, sea, and last light.',
    alignment: 'image-right',
  },
  {
    type: 'content',
    slug: 'bonfire',
    index: '04',
    title: 'The Bonfire',
    sub: 'When the kitchen closes, embers stay.',
    alignment: 'image-left',
  },
];

const CONTENT_PANELS = PANELS.slice(1) as ContentPanel[];

const MomentGallery = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { isMobile } = useScroll();

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const trackEl = trackRef.current;
    if (!sectionEl || !trackEl) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      gsap.set(captionRefs.current, { opacity: 0, y: 30 });
      gsap.set(titleRef.current, { opacity: 1, y: 0 });

      // Reduced motion: drop pin + horizontal track. Section reads as the
      // title card only; user scrolls past at normal pace. (Captions would
      // require horizontal scroll to be discoverable, which contradicts the
      // user preference.) Override the .moment CSS so the section is visible.
      if (reducedMotion) {
        sectionEl.classList.add('active');
        gsap.set(sectionEl, { opacity: 1 });
        return;
      }

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

      // Horizontal track translation: 0 → -400vw over full scrub.
      tl.to(trackEl, { x: '-400vw', ease: 'none' }, 0);

      // Title fades out as we leave Panel 0.
      tl.to(
        titleRef.current,
        { opacity: 0, y: -40, duration: 0.04, ease: 'cinematic' },
        0.16
      );

      // Per-panel caption reveals. captionRefs[i] corresponds to content panel
      // (i+1) in the track. Content panel i is dominant from progress
      // 0.2*(i+1) to 0.2*(i+2). Caption enters just inside, exits just before
      // the next takes over. The last caption holds until unpin.
      captionRefs.current.forEach((cap, i) => {
        if (!cap) return;
        const enterAt = (i + 1) * 0.2 + 0.02;
        const exitAt = (i + 2) * 0.2 - 0.04;
        tl.to(
          cap,
          { opacity: 1, y: 0, duration: 0.05, ease: 'cinematic' },
          enterAt
        );
        if (i < CONTENT_PANELS.length - 1) {
          tl.to(
            cap,
            { opacity: 0, y: -30, duration: 0.05, ease: 'power2.in' },
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
    >
      <div
        ref={trackRef}
        className="absolute top-0 left-0 h-full flex"
        style={{ width: '500vw', willChange: 'transform' }}
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
            Image areas have been removed — JourneyScene's orbital camera
            shows different sides of the island as the user scrolls through
            this section. The captions remain, sliding past the camera-
            driven world below them. Caption position alternates per panel
            (left/right) for editorial rhythm. */}
        {CONTENT_PANELS.map((panel, i) => {
          const imageRight = panel.alignment === 'image-right';
          // Caption position: opposite of where the image would have been,
          // so the panel's gaze direction still alternates left/right.
          const captionPos = imageRight
            ? 'md:bottom-auto md:top-[30%] md:right-auto md:left-[10%]'
            : 'md:bottom-auto md:top-[30%] md:left-auto md:right-[10%] md:text-right';
          return (
            <div key={panel.slug} className="w-screen h-full relative">
              {/* Caption area */}
              <div
                ref={(el) => {
                  captionRefs.current[i] = el;
                }}
                className={`absolute z-10 max-w-[26em] pointer-events-none bottom-[8%] left-[8%] right-[8%] ${captionPos}`}
              >
                <span
                  className="block italic font-light mb-2"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2.25rem, 5vw, 4.5rem)',
                    lineHeight: 1,
                    color: 'rgba(245,240,232,0.35)',
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
