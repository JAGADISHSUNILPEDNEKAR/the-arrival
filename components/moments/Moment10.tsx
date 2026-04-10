"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

interface Star {
  id: number;
  top: string;
  left: string;
  size: string;
  color: string;
  hasGlow: boolean;
}

const Moment10 = ({}: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const starRefs = useRef<(HTMLDivElement | null)[]>([]);
  const silhouetteRef = useRef<HTMLDivElement>(null);
  const nebulaRef = useRef<HTMLDivElement>(null);
  const [starsData, setStarsData] = useState<Star[]>([]);
  const { isMobile } = useScroll();


  useEffect(() => {
    // Generate stars with random properties only on client to avoid hydration mismatch
    const count = isMobile ? 25 : 55;
    const newStars = Array.from({ length: count }).map((_, i) => {
      const size = i < (count * 0.7) ? 1 : i < (count * 0.9) ? 2 : 3;
      const isBlueTint = Math.random() > 0.7;
      const color = isBlueTint ? 'rgba(220, 230, 255, 0.6)' : `rgba(255, 255, 255, ${0.4 + Math.random() * 0.5})`;
      const hasGlow = size >= 2 && Math.random() > 0.5;

      return {
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: `${size}px`,
        color,
        hasGlow
      };
    });
    
    // Wrap in rAF to avoid "setState synchronously within an effect" warning in React 19 / strict lint
    const rafId = requestAnimationFrame(() => {
        setStarsData(newStars);
    });

    return () => cancelAnimationFrame(rafId);
  }, [isMobile]);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const textEl = textRef.current;
    
    if (!sectionEl || !starsData.length) return;

    // Split text for cinematic reveals - guard against missing elements
    const pElement = textEl?.querySelector('p');
    const splitBody = pElement ? new SplitText(pElement, { 
      type: "words,chars",
      wordsClass: "overflow-hidden inline-flex",
      charsClass: "char"
    }) : null;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: "top top",
        end: isMobile ? "+=150%" : "+=250%",
        pin: true,
        pinSpacing: true,
        scrub: isMobile ? 0.8 : 1.2,
        onToggle: self => {
          if (self.isActive) {
            sectionEl.classList.add('active');
          } else {
            sectionEl.classList.remove('active');
          }
        }
      }
    });

    // 100ms kinetic threshold
    tl.set({}, {}, 0.1);

    // 1. Entry Reveal - standardized fade + transform
    tl.fromTo(sectionEl,
      { opacity: 0, scale: 1.02, willChange: "transform, opacity" },
      { 
        opacity: 1, 
        scale: 1,
        ease: "cinematic",
        duration: 0.5,
        clearProps: "willChange"
      }, 0.1);

    // 2. Camera Depth & Environment - 0.3x ratio
    if (contentRef.current) {
        tl.fromTo(contentRef.current, 
          { scale: 1.05, y: "5vh" },
          {
            scale: 1,
            y: 0,
            force3D: true,
            ease: "none",
          }, 0.1);
    }

    if (nebulaRef.current) {
        tl.to(nebulaRef.current, {
            rotate: 45,
            opacity: 0.6,
            scale: 1.6,
            y: "-15vh",
            ease: "none"
        }, 0.1);
    }

    // 3. Cinematic Narrative Text Reveal
    if (splitBody?.chars) {
      tl.fromTo(splitBody.chars, {
        y: "100%",
        filter: "blur(4px)",
        willChange: "transform, filter",
      }, {
        y: "0%",
        filter: "blur(0px)",
        opacity: 0.6, // keeping the original text max opacity level from the CSS
        stagger: 0.02,
        duration: 1,
        ease: "cinematic",
        clearProps: "willChange,filter"
      }, 0.2);
    }

    // 4. Stars Celestial Kinetics
    starRefs.current.forEach((star, i) => {
      if (star) {
        tl.to(star, {
          opacity: 0.9,
          scale: 1.8,
          x: (i % 2 === 0 ? 80 : -80),
          y: (i % 3 === 0 ? 60 : -60),
          ease: "none",
        }, 0.1);
      }
    });

    // 5. Silhouette kinetic reveal (+40px)
    if (silhouetteRef.current) {
        tl.fromTo(silhouetteRef.current, {
            opacity: 0,
            y: 60,
            scale: 0.9,
        }, {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "cinematic",
            duration: 1
        }, 0.3);

        tl.to(silhouetteRef.current, {
            y: "-15vh",
            scale: 1.2,
            x: "3vw",
            ease: "none"
        }, 0.5);
    }

    // 6. Exit transition
    if (textEl) {
        tl.to(textEl, {
            opacity: 0,
            y: -150,
            scale: 1.2,
            force3D: true,
            ease: "cinematic"
        }, 0.8);
    }

    tl.to(sectionEl, {
      opacity: 0,
      scale: 0.98,
      y: -40,
      ease: "cinematic",
    }, 0.9);

    return () => {
      tl.kill();
      if (splitBody) splitBody.revert();
      ScrollTrigger.getAll().filter(st => st.vars.trigger === sectionEl).forEach(st => st.kill());
    };
  }, [starsData, isMobile]);


  return (
    <section 
      ref={sectionRef}
      className="moment relative w-full overflow-hidden bg-[#060810]" 
      id="moment-10"
    >
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 100%, #060a12 0%, #080c18 40%, #060810 100%)'
        }}
      />

      <div ref={contentRef} className="absolute inset-0 w-full h-full">
        <div 
          ref={nebulaRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[40%] origin-center pointer-events-none opacity-40"
          style={{
            transform: 'translate(-50%, -70%) rotate(25deg)',
          }}
        >
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              background: 'repeating-linear-gradient(92deg, transparent 0%, rgba(180,190,220,0.015) 1%, rgba(200,210,240,0.025) 2%, transparent 3%, transparent 6%)',
              filter: 'blur(30px)'
            }}
          />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {starsData.map((star, i) => (
            <div 
              key={star.id}
              ref={el => { starRefs.current[i] = el; }}
              className="absolute rounded-full"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                backgroundColor: star.color,
                boxShadow: star.hasGlow ? '0 0 3px rgba(220, 230, 255, 0.4)' : 'none',
              }}
            />
          ))}
        </div>

        <div 
          ref={silhouetteRef}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[clamp(100px,18vw,240px)] h-[25%] z-20"
        >
          <div 
            className="absolute inset-0"
            style={{
              background: 'rgba(15,35,20,0.85)',
              clipPath: 'ellipse(50% 40% at 50% 80%)',
              boxShadow: '0 0 40px 15px rgba(255,185,80,0.15)'
            }}
          >
            <div className="absolute top-[20%] left-[20%] w-[10%] h-[30%] bg-black/40 blur-[2px] rotate-[15deg] rounded-full" />
            <div className="absolute top-[15%] right-[25%] w-[8%] h-[35%] bg-black/40 blur-[2px] rotate-[-10deg] rounded-full" />
            <div className="absolute top-[35%] left-[45%] w-[12%] h-[25%] bg-black/40 blur-[2px] rotate-[5deg] rounded-full" />
          </div>

          <div 
            className="absolute top-[65%] left-[48%] -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full z-30"
            style={{
              background: 'rgba(255,200,100,0.7)',
              boxShadow: '0 0 15px 5px rgba(255,180,70,0.3)'
            }}
          />
        </div>
      </div>

      <div 
        ref={textRef}
        className="absolute top-[35%] left-1/2 -translate-x-1/2 z-40 w-full text-center px-6 pointer-events-none"
      >
        <p className="font-serif italic font-light tracking-[0.2em] text-[#dcd7c8]"
           style={{
             fontSize: 'clamp(0.9rem, 2.2vw, 1.5rem)',
             fontFamily: '"Cormorant Garamond", serif',
             opacity: 0.6
           }}
        >
          Some tables are remembered longer than others.
        </p>
      </div>
    </section>
  );
};

export default Moment10;
