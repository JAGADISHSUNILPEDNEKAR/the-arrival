"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, SplitText } from '@/lib/gsap';

const FilmHomepage = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Split Hero Text for word-by-word reveal
            const heroSplit = heroRef.current 
                ? new SplitText(heroRef.current, { 
                      type: "lines,words",
                      linesClass: "overflow-hidden inline-flex",
                      wordsClass: "word"
                  })
                : null;

            // Create Master Timeline pinned to scroll
            const mainTimeline = gsap.timeline({
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

            // Initial State setup
            if (heroSplit?.words) {
                gsap.set(heroSplit.words, { y: "100%", filter: "blur(4px)" });
            }
            gsap.set(subtitleRef.current, { opacity: 0, y: 30 });

            // --- Act I: Hero Entry ---
            if (heroSplit?.words) {
                mainTimeline.to(heroSplit.words, {
                    y: "0%",
                    filter: "blur(0px)",
                    stagger: 0.1,
                    duration: 1,
                    ease: "power4.out",
                }, 0);
            }

            mainTimeline.to(subtitleRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "cinematic"
            }, 0.5);

            // Cleanup function for SplitText
            return () => {
                heroSplit?.revert();
            };
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="relative w-screen h-screen overflow-hidden text-[#dcd7c8]">
            <main className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center p-8">
                <div className="absolute top-[40%] flex flex-col items-center">
                    <h1 
                        ref={heroRef}
                        className="text-[clamp(3rem,10vw,8rem)] font-serif italic tracking-tight leading-none uppercase mb-8"
                        style={{ fontFamily: 'var(--font-serif)' }}
                    >
                        THE ARRIVAL
                    </h1>
                    <p 
                        ref={subtitleRef}
                        className="text-[clamp(0.9rem,1.5vw,1.4rem)] font-light tracking-[0.4em] uppercase opacity-0"
                        style={{ fontFamily: 'var(--font-sans)' }}
                    >
                        Beyond the Horizon of Expectations
                    </p>
                </div>
            </main>
        </div>
    );
};

export default FilmHomepage;

