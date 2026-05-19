"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, SplitText } from '@/lib/gsap';

const FilmHomepage = () => {
    const containerRef = useRef<HTMLDivElement>(null);

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

        const ctx = gsap.context(() => {
            // Split Hero Text for word-by-word reveal
            const heroSplit = titleRef.current 
                ? new SplitText(titleRef.current, { 
                      type: "lines,words",
                      linesClass: "overflow-hidden inline-flex",
                      wordsClass: "word"
                  })
                : null;

            // Simple entry timeline for preview/compiling
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=100%",
                    pin: true,
                    pinSpacing: true,
                    scrub: 1.2,
                    anticipatePin: 1,
                }
            });

            if (heroSplit?.words) {
                gsap.set(heroSplit.words, { y: "100%", filter: "blur(4px)" });
                tl.to(heroSplit.words, {
                    y: "0%",
                    filter: "blur(0px)",
                    stagger: 0.1,
                    duration: 1,
                    ease: "power4.out",
                }, 0);
            }

            return () => {
                heroSplit?.revert();
            };
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleBegin = () => {
        document.getElementById('moment-02')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div
            ref={containerRef}
            className="relative w-screen h-screen overflow-hidden text-[#f5f0e8]"
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
                        fontSize: 'clamp(3.5rem, 13vw, 12rem)',
                        lineHeight: 0.92,
                        letterSpacing: '-0.02em',
                        color: 'rgba(255,250,240,0.96)',
                        textShadow: '0 4px 60px rgba(6,8,16,0.45)',
                    }}
                >
                    The Arrival
                </h1>
                <p
                    ref={subtitleRef}
                    className="mt-6 md:mt-8 max-w-[28em] font-light italic"
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(1rem, 1.5vw, 1.5rem)',
                        lineHeight: 1.5,
                        color: 'rgba(245,240,232,0.8)',
                    }}
                >
                    A private island restaurant, suspended above the lagoon.
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

