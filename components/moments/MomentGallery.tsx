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
  alt: string;
  fallback: React.CSSProperties;
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
    alt: 'Pre-dawn light over the private lagoon',
    fallback: {
      background:
        'linear-gradient(180deg, rgba(40,70,110,0.55) 0%, rgba(80,130,160,0.55) 50%, rgba(140,180,200,0.55) 100%), repeating-linear-gradient(92deg, transparent 0px, transparent 20px, rgba(255,255,255,0.04) 21px, rgba(255,255,255,0.04) 22px)',
    },
  },
  {
    type: 'content',
    slug: 'walk',
    index: '02',
    title: 'The Walk',
    sub: 'From villa to lagoon, barefoot.',
    alignment: 'image-left',
    alt: 'A path of palm shadows at golden hour',
    fallback: {
      background:
        'linear-gradient(180deg, rgba(180,150,100,0.55) 0%, rgba(220,190,140,0.55) 50%, rgba(170,140,90,0.55) 100%), repeating-linear-gradient(78deg, transparent 0px, transparent 30px, rgba(20,30,15,0.18) 31px, rgba(20,30,15,0.18) 35px)',
    },
  },
  {
    type: 'content',
    slug: 'bath',
    index: '03',
    title: 'The Bath',
    sub: 'Stone, sea, and last light.',
    alignment: 'image-right',
    alt: 'A stone bath at sunset',
    fallback: {
      background:
        'radial-gradient(circle at 35% 45%, rgba(255,200,140,0.4) 0%, transparent 50%), linear-gradient(180deg, rgba(140,80,50,0.5) 0%, rgba(200,130,80,0.55) 100%)',
    },
  },
  {
    type: 'content',
    slug: 'bonfire',
    index: '04',
    title: 'The Bonfire',
    sub: 'When the kitchen closes, embers stay.',
    alignment: 'image-left',
    alt: 'Beach embers at night',
    fallback: {
      background:
        'radial-gradient(circle at 50% 75%, rgba(255,140,60,0.45) 0%, rgba(180,80,30,0.25) 25%, transparent 55%), linear-gradient(180deg, rgba(10,15,30,0.7) 0%, rgba(20,25,45,0.65) 60%, rgba(15,20,35,0.7) 100%)',
    },
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
            Layout:
              • Mobile (<md): image full-width on top half, caption stacked
                below — both span left-[8%] right-[8%] (84vw).
              • Desktop (md+): asymmetric — image at one edge with explicit
                width (clamp 280-720px), caption at the opposite edge,
                alternating per panel for editorial rhythm. */}
        {CONTENT_PANELS.map((panel, i) => {
          const imageRight = panel.alignment === 'image-right';
          // Mobile: image full-width. Desktop: anchored to one side with explicit width.
          const imagePos = imageRight
            ? 'md:left-auto md:right-[10%]'
            : 'md:right-auto md:left-[10%]';
          // Mobile: caption full-width below. Desktop: opposite the image.
          const captionPos = imageRight
            ? 'md:bottom-auto md:top-[30%] md:right-auto md:left-[10%]'
            : 'md:bottom-auto md:top-[30%] md:left-auto md:right-[10%] md:text-right';
          return (
            <div key={panel.slug} className="w-screen h-full relative">
              {/* Image area */}
              <div
                className={`absolute top-[10%] md:top-[15%] left-[8%] right-[8%] h-[42vh] md:h-[65vh] md:w-[42vw] md:min-w-[280px] md:max-w-[720px] ${imagePos}`}
              >
                <AssetSlot
                  id={`gallery-${panel.slug}`}
                  alt={panel.alt}
                  className="w-full h-full overflow-hidden"
                >
                  <div className="w-full h-full" style={panel.fallback} />
                </AssetSlot>
              </div>

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
