"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText, CustomEase } from '@/lib/gsap';

const FilmHomepage = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const backgroundRef = useRef<HTMLDivElement>(null);
    const cardsContainerRef = useRef<HTMLDivElement>(null);
    const cardsRefs = useRef<(HTMLDivElement | null)[]>([]);
    const quoteRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!typeof window) return;

        const ctx = gsap.context(() => {
            // Register plugins if not already
            gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

            // Split Hero Text for word-by-word reveal (Scene 1)
            const heroSplit = new SplitText(heroRef.current, { type: "words" });

            // Split Quote Text for character-by-character reveal (Scene 4)
            const quoteSplit = new SplitText(quoteRef.current, { type: "chars" });

            // Create Master Timeline pinned to scroll
            const mainTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "500%", // 5 scenes total
                    pin: true,
                    pinSpacing: true,
                    scrub: 1.2,
                    anticipatePin: 1,
                }
            });

            // Initial State setup
            gsap.set(heroSplit.words, { opacity: 0, y: 100, rotateX: -90 });
            gsap.set(subtitleRef.current, { opacity: 0, y: 30 });
            gsap.set(cardsRefs.current, { opacity: 0, y: 150 });
            gsap.set(quoteSplit.chars, { opacity: 0, scale: 0, filter: 'blur(10px)' });
            gsap.set(ctaRef.current, { opacity: 0, y: 200, scale: 0.9 });

            // --- Scene 1: Hero Slam (0% - 20%) ---
            // 0 -> 0.2
            mainTimeline.to(heroSplit.words, {
                opacity: 1,
                y: 0,
                rotateX: 0,
                stagger: 0.1,
                duration: 1,
                ease: "power4.out"
            }, 0);

            mainTimeline.to(backgroundRef.current, {
                scale: 1.2,
                y: "-10vh",
                duration: 1,
                ease: "none"
            }, 0);

            // --- Scene 2: Subtitle Fade & Hero Shrink (20% - 40%) ---
            // 0.2 -> 0.4
            mainTimeline.to(subtitleRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "cinematic"
            }, 1);

            mainTimeline.to(heroRef.current, {
                scale: 0.6,
                transformOrigin: "center top",
                y: "-10vh",
                duration: 1,
                ease: "cinematic"
            }, 1.2);

            mainTimeline.to(subtitleRef.current, {
                opacity: 0,
                y: -50,
                duration: 0.5,
                ease: "power2.in"
            }, 1.8);

            // --- Scene 3: Feature Cards Stagger (40% - 60%) ---
            // 0.4 -> 0.6
            mainTimeline.to(heroRef.current, {
                opacity: 0.2,
                filter: "blur(4px)",
                duration: 0.5
            }, 2);

            mainTimeline.to(cardsRefs.current, {
                opacity: 1,
                y: 0,
                stagger: 0.08, // 80ms delay between each (conceptual 0.08)
                duration: 1,
                ease: "power3.out"
            }, 2.2);

            mainTimeline.to(cardsRefs.current, {
                opacity: 0,
                y: -100,
                stagger: 0.05,
                duration: 0.8,
                ease: "power2.in"
            }, 3.2);

            // --- Scene 4: Quote Characters (60% - 80%) ---
            // 0.6 -> 0.8
            mainTimeline.to(quoteSplit.chars, {
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
                stagger: 0.02, // 20ms delay
                duration: 1,
                ease: "back.out(1.7)"
            }, 4);

            mainTimeline.to(quoteRef.current, {
                opacity: 0,
                y: -50,
                duration: 0.8,
                ease: "power2.in"
            }, 5.5);

            // --- Scene 5: Luxury CTA Rise (80% - 100%) ---
            // 0.8 -> 1.0 (relative end point)
            mainTimeline.to(ctaRef.current, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.5,
                ease: "cinematic" // Using custom luxury ease
            }, 6);

            // Cleanup function for ScrollTrigger and SplitText
            return () => {
                heroSplit.revert();
                quoteSplit.revert();
            };
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Feature data for Scene 3
    const features = [
        { title: "Exclusive Reach", desc: "Private island dining beyond the horizon." },
        { title: "Master Craftsmanship", desc: "Every plate a masterpiece of local harvest." },
        { title: "Oceanic Serenity", desc: "Whispers of waves on midnight beaches." },
    ];

    return (
        <div ref={containerRef} className="relative w-screen h-screen overflow-hidden bg-[#060810] text-[#dcd7c8]">
            {/* Dynamic Atmospheric Background (Parallax Layer) */}
            <div 
                ref={backgroundRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 50% 100%, #1a1e2b 0%, #060810 70%)',
                    zIndex: 0
                }}
            >
                <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(200, 210, 240, 0.1) 0%, transparent 40%)',
                    }}
                />
            </div>

            <main className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center p-8">
                
                {/* Scenes Layering: Everything is rendered and animated via timeline */}

                {/* SCENE 1 & 2: HERO & SUBTITLE */}
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

                {/* SCENE 3: FEATURE CARDS */}
                <div 
                    ref={cardsContainerRef}
                    className="absolute inset-0 flex items-center justify-center gap-12 px-12 pointer-events-none"
                >
                    {features.map((feature, i) => (
                        <div 
                            key={i}
                            ref={el => { cardsRefs.current[i] = el; }}
                            className="w-[320px] p-8 aspect-[3/4] flex flex-col justify-end bg-white/5 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl"
                        >
                            <h3 className="text-2xl font-serif italic mb-4">{feature.title}</h3>
                            <p className="text-sm font-light text-[#dcd7c8]/60 tracking-wide line-height-[1.6]">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* SCENE 4: QUOTE SECTION */}
                <div className="absolute inset-0 flex items-center justify-center px-12 pointer-events-none">
                    <p 
                        ref={quoteRef}
                        className="text-[clamp(1.5rem,4vw,3.5rem)] font-serif italic font-light max-w-[1000px] leading-snug"
                    >
                        &ldquo;True luxury is the ability to lose track of time while finding yourself.&rdquo;
                    </p>
                </div>

                {/* SCENE 5: CTA RISING */}
                <div 
                    ref={ctaRef}
                    className="absolute bottom-[20%] flex flex-col items-center gap-12 pointer-events-auto"
                >
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-[10px] tracking-[0.5em] uppercase opacity-40 font-light">Your Journey Begins Here</span>
                        <h2 className="text-4xl md:text-6xl font-serif italic">Secure Your Passage</h2>
                    </div>
                    <button className="px-12 py-4 border border-white/20 text-white/90 hover:bg-white hover:text-black transition-all duration-1000 uppercase tracking-[0.3em] text-xs backdrop-blur-sm rounded-sm">
                        Request Reservation
                    </button>
                </div>

            </main>
        </div>
    );
};

export default FilmHomepage;
