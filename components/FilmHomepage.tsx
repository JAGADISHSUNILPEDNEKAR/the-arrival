"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, SplitText } from '@/lib/gsap';
import { buildKineticWordsFor, KineticWord } from '@/lib/kineticWord';
import { useScroll } from '@/lib/context/ScrollContext';
import { useWebGLContent } from '@/components/WebGL/WebGLContentLayer';

const FilmHomepage = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollToElement } = useScroll();

    useWebGLContent({
        id: 'chapter-01-arrival',
        src: '/assets/chapter-01-arrival/photo.webp',
        poster: '/assets/chapter-01-arrival/photo.poster.jpg',
        triggerRef: containerRef,
    });

    // Act I
    const coordRef = useRef<HTMLSpanElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);

    // Act II
    const horizonRef = useRef<HTMLDivElement>(null);
    const fragmentRef = useRef<HTMLParagraphElement>(null);

    // Act III
    const sentenceRef = useRef<HTMLParagraphElement>(null);
    const invitationRef = useRef<HTMLSpanElement>(null);

    // Act IV
    const continueRef = useRef<HTMLSpanElement>(null);
    const beginRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const reducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const ctx = gsap.context(() => {
            // Title is split into BOTH lines and words: lines drive the reveal
            // (one opacity fade per visual line, with a slow tracking settle on
            // the parent) and words exist purely so the kinetic-breath helper
            // can find the "Arrival" word. The brand signature survives at the
            // door; nothing else in the site uses kinetic typography.
            const titleSplit = titleRef.current
                ? new SplitText(titleRef.current, {
                      type: 'lines,words',
                      linesClass: 'film-line',
                      wordsClass: 'word',
                  })
                : null;
            // Sentence is split into lines only — no per-word reveal, no
            // kinetic breath.
            const sentenceSplit = sentenceRef.current
                ? new SplitText(sentenceRef.current, {
                      type: 'lines',
                      linesClass: 'film-line',
                  })
                : null;

            // Single kinetic-breath consumer — only "Arrival" on the title.
            let kineticTitle: KineticWord[] = [];

            // Initial state. Coord is the exception: pre-positioned at 0.6
            // because the Preloader hands it off in-place — fading it in here
            // would flicker.
            gsap.set(coordRef.current, { opacity: 0.6 });
            gsap.set(
                [
                    subtitleRef.current,
                    fragmentRef.current,
                    invitationRef.current,
                    continueRef.current,
                ],
                { opacity: 0 }
            );
            gsap.set(horizonRef.current, {
                scaleX: 0,
                transformOrigin: 'center center',
                opacity: 0,
            });
            if (titleSplit?.lines) {
                gsap.set(titleSplit.lines, { opacity: 0 });
            }
            if (sentenceSplit?.lines) {
                gsap.set(sentenceSplit.lines, { opacity: 0 });
            }
            // Tracking starts wide on the two serif-italic reveals. Soft
            // focus-pull as they settle into their final letter-spacing.
            if (titleRef.current) {
                gsap.set(titleRef.current, { letterSpacing: '0.04em' });
            }
            if (sentenceRef.current) {
                gsap.set(sentenceRef.current, { letterSpacing: '0.03em' });
            }
            gsap.set(beginRef.current, { opacity: 0 });

            // Reduced motion: settle Act I + CTA visible, skip timeline + pin.
            if (reducedMotion) {
                gsap.set([subtitleRef.current, beginRef.current], { opacity: 1 });
                gsap.set(continueRef.current, { opacity: 0.55 });
                if (titleSplit?.lines) {
                    gsap.set(titleSplit.lines, { opacity: 1 });
                }
                if (titleRef.current) {
                    gsap.set(titleRef.current, { letterSpacing: '-0.025em' });
                }
                return;
            }

            // Past the gate: build the single kinetic-breath controller. It
            // only matches the literal word "Arrival" (KINETIC_TARGETS in
            // lib/kineticWord.ts); the other anchor words ('lagoon', 'equator',
            // 'invisible') still exist in the target list for symmetry but
            // none of their parent SplitText words are passed in here.
            kineticTitle = buildKineticWordsFor(
                titleSplit?.words as Element[] | undefined
            );

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '+=500%', // 4 acts with real silence between
                    pin: true,
                    pinSpacing: true,
                    scrub: 1.6, // higher scrub = more settled, less twitchy
                    anticipatePin: 1,
                },
            });

            // === ACT I — Arrival (0.00 – 0.28) ============================
            // Slow line reveal + tracking settle on the title. Single
            // dominant motion idea: the type comes into focus.
            if (titleSplit?.lines) {
                tl.to(
                    titleSplit.lines,
                    {
                        opacity: 1,
                        stagger: 0.04,
                        duration: 0.08,
                        ease: 'cinematic',
                    },
                    0.04
                );
            }
            tl.to(
                titleRef.current,
                { letterSpacing: '-0.025em', duration: 0.16, ease: 'cinematic' },
                0.04
            );
            // The one kinetic-breath signature on the entire site. Fires
            // once on "Arrival" after the title has settled.
            tl.call(() => kineticTitle.forEach((kw) => kw.play()), [], 0.18);
            tl.to(
                subtitleRef.current,
                { opacity: 1, duration: 0.10, ease: 'cinematic' },
                0.20
            );
            // Long silence — 0.24 → 0.32. The hero sits.

            // === ACT II — The horizon (0.32 – 0.55) ========================
            // Act I dims to ambient. Opacity only — no blur, no translate.
            // The text recedes into the world; it doesn't fly away.
            tl.to(
                [coordRef.current, titleRef.current, subtitleRef.current],
                {
                    opacity: (i: number) => (i === 0 ? 0.18 : 0.12),
                    duration: 0.10,
                    ease: 'cinematic',
                },
                0.32
            );
            // Horizon line draws across — the dominant motion of Act II.
            // Slower than before (0.14 → 0.20 duration) so the line feels
            // drawn, not snapped.
            tl.to(
                horizonRef.current,
                { scaleX: 1, opacity: 1, duration: 0.20, ease: 'cinematic' },
                0.38
            );
            // Editorial fragment reveals right-aligned. Single opacity fade.
            tl.to(
                fragmentRef.current,
                { opacity: 0.88, duration: 0.14, ease: 'cinematic' },
                0.46
            );
            // Long silence — 0.50 → 0.58. The fragment breathes.

            // === ACT III — The promise (0.58 – 0.82) =======================
            tl.to(
                [horizonRef.current, fragmentRef.current],
                { opacity: 0, duration: 0.10, ease: 'cinematic' },
                0.58
            );
            tl.to(
                [coordRef.current, titleRef.current, subtitleRef.current],
                { opacity: 0, duration: 0.10, ease: 'cinematic' },
                0.58
            );
            // Sentence reveals as lines, not words. Two beats max (the line
            // wraps to two visual lines on most viewports), no per-word
            // stagger. Tracking settles in parallel.
            if (sentenceSplit?.lines) {
                tl.to(
                    sentenceSplit.lines,
                    {
                        opacity: 1,
                        stagger: 0.10,
                        duration: 0.16,
                        ease: 'cinematic',
                    },
                    0.62
                );
            }
            tl.to(
                sentenceRef.current,
                { letterSpacing: '-0.01em', duration: 0.30, ease: 'cinematic' },
                0.62
            );
            tl.to(
                invitationRef.current,
                { opacity: 0.5, duration: 0.10, ease: 'cinematic' },
                0.74
            );
            // Long silence — 0.78 → 0.84. The sentence sits.

            // === ACT IV — The invitation (0.84 – 1.00) =====================
            tl.to(
                [sentenceRef.current, invitationRef.current],
                { opacity: 0, duration: 0.08, ease: 'cinematic' },
                0.84
            );
            tl.to(
                continueRef.current,
                { opacity: 0.55, duration: 0.10, ease: 'cinematic' },
                0.88
            );
            tl.to(
                beginRef.current,
                { opacity: 1, duration: 0.14, ease: 'cinematic' },
                0.92
            );
            // HOLD 0.98 → 1.00 then unpin into ChapterShore

            return () => {
                kineticTitle.forEach((kw) => kw.revert());
                titleSplit?.revert();
                sentenceSplit?.revert();
            };
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleBegin = () => {
        scrollToElement('#chapter-02-shore');
    };

    return (
        <div
            ref={containerRef}
            className="relative w-screen h-screen h-dvh overflow-hidden text-[#f5f0e8]"
        >
            {/* Editorial vignettes — ground type against the WebGL world below */}
            <div
                className="absolute top-0 left-0 right-0 h-[35%] pointer-events-none z-[1]"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(6,8,16,0.55) 0%, rgba(6,8,16,0.15) 60%, transparent 100%)',
                }}
            />
            <div
                className="absolute bottom-0 left-0 right-0 h-[45%] pointer-events-none z-[1]"
                style={{
                    background:
                        'linear-gradient(0deg, rgba(6,8,16,0.6) 0%, rgba(6,8,16,0.2) 60%, transparent 100%)',
                }}
            />

            {/* === ACT I ====================================================== */}
            <div className="absolute top-[26%] md:top-[28%] left-[8%] md:left-[10%] z-10 max-w-[90vw] pointer-events-none">
                <span
                    ref={coordRef}
                    className="block uppercase mb-8 md:mb-10"
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'clamp(0.625rem, 0.75vw, 0.8rem)',
                        letterSpacing: '0.45em',
                        color: 'rgba(245,240,232,0.6)',
                    }}
                >
                    From the Maldives
                </span>
                <h1
                    ref={titleRef}
                    className="italic font-light"
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(4rem, 19vw, 19rem)',
                        lineHeight: 0.88,
                        letterSpacing: '-0.025em',
                        color: 'rgba(255,250,240,0.96)',
                        textShadow: '0 4px 60px rgba(6,8,16,0.45)',
                    }}
                >
                    The Arrival
                </h1>
                <p
                    ref={subtitleRef}
                    className="mt-8 md:mt-10 max-w-[34em] font-light uppercase"
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'clamp(0.7rem, 0.95vw, 1rem)',
                        lineHeight: 1.7,
                        letterSpacing: '0.35em',
                        color: 'rgba(245,240,232,0.65)',
                    }}
                >
                    A private island restaurant
                </p>
            </div>

            {/* === ACT II ===================================================== */}
            <div
                ref={horizonRef}
                className="absolute left-[10%] right-[10%] z-[2] pointer-events-none"
                style={{
                    top: '52%',
                    height: '1px',
                    background:
                        'linear-gradient(90deg, transparent 0%, rgba(245,240,232,0.45) 25%, rgba(245,240,232,0.45) 75%, transparent 100%)',
                }}
            />
            <p
                ref={fragmentRef}
                className="absolute right-[8%] md:right-[12%] z-10 italic font-light text-right max-w-[22em] pointer-events-none"
                style={{
                    top: '58%',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1rem, 1.7vw, 1.6rem)',
                    lineHeight: 1.5,
                    color: 'rgba(245,240,232,0.88)',
                }}
            >
                Where the lagoon meets the equator,<br />time slows to a single breath.
            </p>

            {/* === ACT III ==================================================== */}
            <div className="absolute top-1/2 -translate-y-1/2 left-[8%] md:left-[10%] z-10 max-w-[70vw] pointer-events-none">
                <p
                    ref={sentenceRef}
                    className="italic font-light"
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                        lineHeight: 1.05,
                        letterSpacing: '-0.01em',
                        color: 'rgba(255,250,240,0.94)',
                        textShadow: '0 4px 50px rgba(6,8,16,0.5)',
                    }}
                >
                    An island for those who prefer to be invisible.
                </p>
                <span
                    ref={invitationRef}
                    className="block mt-10 md:mt-12 uppercase"
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'clamp(0.625rem, 0.75vw, 0.8rem)',
                        letterSpacing: '0.45em',
                        color: 'rgba(245,240,232,0.5)',
                    }}
                >
                    By Invitation
                </span>
            </div>

            {/* === ACT IV ===================================================== */}
            <div className="absolute bottom-[12%] md:bottom-[14%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-auto">
                <span
                    ref={continueRef}
                    className="block mb-5 md:mb-6 uppercase"
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'clamp(0.625rem, 0.7vw, 0.75rem)',
                        letterSpacing: '0.5em',
                        color: 'rgba(245,240,232,0.55)',
                    }}
                >
                    Continue
                </span>
                <button
                    ref={beginRef}
                    onClick={handleBegin}
                    data-cursor="cta"
                    className="group italic font-light bg-transparent border-0 cursor-pointer p-0"
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(2.5rem, 7vw, 7rem)',
                        letterSpacing: '-0.01em',
                        color: 'rgba(255,250,240,0.95)',
                        textShadow: '0 4px 40px rgba(6,8,16,0.5)',
                    }}
                    aria-label="Begin the journey — scroll to the first moment"
                >
                    <span className="relative inline-block">
                        Begin
                        <span
                            aria-hidden
                            className="absolute left-0 right-0 -bottom-[0.05em] h-[1px] origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-[1200ms] ease-out"
                            style={{ background: 'rgba(255,250,240,0.65)' }}
                        />
                    </span>
                </button>
            </div>
        </div>
    );
};

export default FilmHomepage;
