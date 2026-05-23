"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, SplitText } from '@/lib/gsap';
import { useWebGLContent } from '@/components/WebGL/WebGLContentLayer';
import { buildKineticWordsFor, KineticWord } from '@/lib/kineticWord';
import { useScroll } from '@/lib/context/ScrollContext';

const FilmHomepage = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    useWebGLContent({ id: 'film-homepage', src: '/assets/film-homepage/hero-aerial.mp4', poster: '/assets/film-homepage/hero-aerial.poster.jpg', triggerRef: containerRef });
    const { scrollToElement } = useScroll();

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
            const titleSplit = titleRef.current
                ? new SplitText(titleRef.current, {
                      type: 'lines,words',
                      linesClass: 'overflow-hidden inline-flex',
                      wordsClass: 'word',
                  })
                : null;
            const sentenceSplit = sentenceRef.current
                ? new SplitText(sentenceRef.current, {
                      type: 'lines,words',
                      linesClass: 'overflow-hidden inline-flex',
                      wordsClass: 'word',
                  })
                : null;
            // fragmentRef has no reveal-stagger, but we split it for word
            // lookup so the kinetic helper can target "lagoon" and "equator".
            const fragmentSplit = fragmentRef.current
                ? new SplitText(fragmentRef.current, {
                      type: 'words',
                      wordsClass: 'word',
                  })
                : null;

            // Kinetic controllers — populated past the reduced-motion gate.
            let kineticTitle: KineticWord[] = [];
            let kineticSentence: KineticWord[] = [];
            let kineticFragment: KineticWord[] = [];
            const playAll = (group: KineticWord[]) =>
                group.forEach((kw) => kw.play());

            // Initial states — everything hidden, ready to enter.
            // Coord is the exception: it starts visible at 0.6 because the
            // Preloader hands it off in-place — fading it in here would flicker.
            gsap.set(coordRef.current, { opacity: 0.6, y: 0 });
            gsap.set(
                [
                    subtitleRef.current,
                    fragmentRef.current,
                    invitationRef.current,
                    continueRef.current,
                ],
                { opacity: 0, y: 24 }
            );
            gsap.set(horizonRef.current, {
                scaleX: 0,
                transformOrigin: 'center center',
                opacity: 0,
            });
            if (titleSplit?.words) {
                gsap.set(titleSplit.words, { y: '110%', filter: 'blur(6px)', opacity: 0 });
            }
            if (sentenceSplit?.words) {
                gsap.set(sentenceSplit.words, {
                    y: '110%',
                    filter: 'blur(6px)',
                    opacity: 0,
                });
            }
            gsap.set(beginRef.current, { opacity: 0, y: 30 });

            // Reduced motion: settle Act I + CTA visible, skip timeline + pin entirely.
            // Coord already initialised at 0.6 above; only set the others here.
            if (reducedMotion) {
                gsap.set([subtitleRef.current, beginRef.current], { opacity: 1, y: 0 });
                gsap.set(continueRef.current, { opacity: 0.55, y: 0 });
                if (titleSplit?.words) {
                    gsap.set(titleSplit.words, { y: '0%', filter: 'none', opacity: 1 });
                }
                return;
            }

            // Past the gate: build kinetic-typography controllers for the six
            // anchor words. Skipped under reduced motion above.
            kineticTitle = buildKineticWordsFor(
                titleSplit?.words as Element[] | undefined
            );
            kineticSentence = buildKineticWordsFor(
                sentenceSplit?.words as Element[] | undefined
            );
            kineticFragment = buildKineticWordsFor(
                fragmentSplit?.words as Element[] | undefined
            );

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '+=400%', // 4 acts × ~100% scroll each
                    pin: true,
                    pinSpacing: true,
                    scrub: 1.2,
                    anticipatePin: 1,
                },
            });

            // === ACT I — Arrival (0.00 – 0.25) ===
            // Coord is already visible (handed off from Preloader); no fade-in beat.
            if (titleSplit?.words) {
                tl.to(
                    titleSplit.words,
                    {
                        y: '0%',
                        filter: 'blur(0px)',
                        opacity: 1,
                        stagger: 0.04,
                        duration: 0.10,
                        ease: 'cinematic',
                    },
                    0.05
                );
            }
            // Kinetic breath on "Arrival" — fires once after the title settles.
            tl.call(() => playAll(kineticTitle), [], 0.18);
            tl.to(
                subtitleRef.current,
                { opacity: 1, y: 0, duration: 0.06, ease: 'cinematic' },
                0.16
            );
            // HOLD 0.20 – 0.25

            // === ACT II — Horizon reveals (0.25 – 0.50) ===
            // Act I dims to ambient, drifts up, soft blur
            tl.to(
                [coordRef.current, titleRef.current, subtitleRef.current],
                {
                    y: -80,
                    opacity: 0.18,
                    filter: 'blur(3px)',
                    duration: 0.08,
                    ease: 'cinematic',
                },
                0.27
            );
            // Horizon line draws across
            tl.to(
                horizonRef.current,
                { scaleX: 1, opacity: 1, duration: 0.14, ease: 'cinematic' },
                0.30
            );
            // Editorial fragment reveals right-aligned
            tl.to(
                fragmentRef.current,
                { opacity: 0.88, y: 0, duration: 0.08, ease: 'cinematic' },
                0.40
            );
            // Kinetic breath on "lagoon" + "equator" after the fragment settles.
            tl.call(() => playAll(kineticFragment), [], 0.46);
            // HOLD 0.46 – 0.50

            // === ACT III — The promise (0.50 – 0.75) ===
            tl.to(
                [horizonRef.current, fragmentRef.current],
                { opacity: 0, duration: 0.05, ease: 'power2.in' },
                0.50
            );
            tl.to(
                [coordRef.current, titleRef.current, subtitleRef.current],
                { opacity: 0, duration: 0.05, ease: 'power2.in' },
                0.50
            );
            // Sentence: "An island for those who prefer to be invisible." (9 words)
            // Tightened to land the final word ("invisible.") at 0.72 — leaving a
            // 0.04 dwell before Act IV exit fires at 0.76. Previous timing
            // (start 0.56, stagger 0.025, duration 0.10) put the last word's
            // reveal at 0.76, colliding with the exit and cutting it off.
            // New math: last word starts at 0.52 + 8*0.015 = 0.64, completes at 0.72.
            if (sentenceSplit?.words) {
                tl.to(
                    sentenceSplit.words,
                    {
                        y: '0%',
                        filter: 'blur(0px)',
                        opacity: 1,
                        stagger: 0.015,
                        duration: 0.08,
                        ease: 'cinematic',
                    },
                    0.52
                );
            }
            // Kinetic breath on "invisible" after the sentence settles.
            tl.call(() => playAll(kineticSentence), [], 0.66);
            tl.to(
                invitationRef.current,
                { opacity: 0.5, y: 0, duration: 0.06, ease: 'cinematic' },
                0.68
            );
            // HOLD 0.72 – 0.75

            // === ACT IV — The invitation (0.75 – 1.00) ===
            tl.to(
                [sentenceRef.current, invitationRef.current],
                { opacity: 0, y: -40, duration: 0.05, ease: 'power2.in' },
                0.76
            );
            tl.to(
                continueRef.current,
                { opacity: 0.55, y: 0, duration: 0.06, ease: 'cinematic' },
                0.82
            );
            tl.to(
                beginRef.current,
                { opacity: 1, y: 0, duration: 0.10, ease: 'cinematic' },
                0.86
            );
            // HOLD 0.96 – 1.00 then unpin into Moment02

            return () => {
                kineticTitle.forEach((kw) => kw.revert());
                kineticSentence.forEach((kw) => kw.revert());
                kineticFragment.forEach((kw) => kw.revert());
                titleSplit?.revert();
                sentenceSplit?.revert();
                fragmentSplit?.revert();
            };
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleBegin = () => {
        scrollToElement('#moment-02');
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
