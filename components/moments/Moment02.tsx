"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

const Moment02 = ({ index }: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const islandRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const waterShimmerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useScroll();

  useEffect(() => {
    if (!sectionRef.current) return;

    // Split text for cinematic reveals
    const splitTitle = new SplitText(textRef.current?.querySelector('h2'), { type: "chars,words", charsClass: "char" });
    const splitBody = new SplitText(textRef.current?.querySelector('p'), { type: "words,lines" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: isMobile ? "+=150%" : "+=250%", 
        pin: true,
        pinSpacing: true,
        scrub: isMobile ? 0.8 : 1.2,
        onToggle: self => {
          if (self.isActive) {
            sectionRef.current?.classList.add('active');
          } else {
            sectionRef.current?.classList.remove('active');
          }
        }
      }
    });

    // 100ms kinetic threshold
    tl.set({}, {}, 0.1);

    // 1. Entry Reveal - standardized fade + transform
    tl.fromTo(sectionRef.current,
      { opacity: 0, scale: 1.02 },
      { 
        opacity: 1, 
        scale: 1,
        ease: "cinematic",
        duration: 0.5 
      }, 0.1);

    // 2. Cinematic Typography Reveal
    if (splitTitle.chars) {
      tl.fromTo(splitTitle.chars, {
        opacity: 0,
        y: 30,
        rotateX: -15,
      }, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.02,
        duration: 0.8,
        ease: "cinematic"
      }, 0.2);
    }

    if (splitBody.words) {
      tl.fromTo(splitBody.words, {
        opacity: 0,
        y: 20,
      }, {
        opacity: 1,
        y: 0,
        stagger: 0.005,
        duration: 0.6,
        ease: "cinematic"
      }, 0.4);
    }

    // 3. Background parallax - 0.3x ratio
    tl.to(backgroundRef.current, {
      y: "12vh", 
      scale: 1.15,
      force3D: true,
      ease: "none",
    }, 0.1);

    // 4. Island Midground kinetic
    tl.fromTo(islandRef.current, 
      { x: 60, opacity: 0, scale: 0.9, y: 40 },
      { 
        x: 0, 
        opacity: 1,
        scale: 1,
        y: 0,
        force3D: true,
        duration: 1,
        ease: "cinematic"
      }, 0.2);

    tl.to(islandRef.current, {
      scale: 1.8,
      x: "-10vw",
      y: "10vh",
      force3D: true,
      ease: "none",
    }, 0.5);

    // 5. Water Shimmer & Overlay
    tl.to(waterShimmerRef.current, {
      backgroundPositionX: "300px",
      y: "5%",
      ease: "none",
    }, 0.1);

    tl.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 0.8, ease: "cinematic", duration: 1 }, 0.1);

    // 6. Exit transition
    tl.to([textRef.current, islandRef.current], {
        opacity: 0,
        y: -100, 
        scale: 1.1,
        force3D: true,
        ease: "cinematic",
        stagger: 0.1
    }, 0.8);

    tl.to(sectionRef.current, {
      opacity: 0,
      scale: 0.98,
      y: -40,
      ease: "cinematic",
    }, 0.9);

    return () => {
      tl.kill();
      splitTitle.revert();
      splitBody.revert();
      ScrollTrigger.getAll().filter(st => st.vars.trigger === sectionRef.current).forEach(st => st.kill());
    };
  }, [isMobile]);


  return (
    <section 
      ref={sectionRef}
      className="moment relative w-full overflow-hidden" 
      id="moment-02"
    >
      <div 
        ref={backgroundRef}
        className="absolute inset-0 w-full h-[120%] -top-[10%]" 
        style={{
          background: 'linear-gradient(180deg, #0e2038 0%, #1c4d70 30%, #3a8aaa 60%, #89c0d0 82%, #d4eaf0 100%)'
        }}
      />

      <div 
        ref={overlayRef}
        className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(210,160,80,0.12) 0%, transparent 50%)'
        }}
      />

      <div 
        ref={textRef}
        className="absolute top-[25%] left-[8%] md:left-[12%] z-10 max-w-[420px] pr-4 pointer-events-none"
      >
        <h2 
          className="italic font-light mb-6 drop-shadow-md"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            color: 'rgba(240, 232, 210, 0.95)',
            letterSpacing: '0.05em',
            lineHeight: '1.2'
          }}
        >
          A sanctuary,<br/>woven into the shoreline.
        </h2>
        <p
          className="font-light drop-shadow-sm"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.85rem, 1vw, 1rem)',
            color: 'rgba(240, 232, 210, 0.7)',
            letterSpacing: '0.05em',
            lineHeight: '1.8'
          }}
        >
          Far from the noise, suspended above the turquoise sea. Every detail of this secluded retreat is designed to foster deep stillness and effortless luxury. Your arrival changes everything.
        </p>
      </div>

      <div 
        ref={islandRef}
        className="absolute bottom-[38%] right-[28%] z-[2]"
        style={{
          width: 'clamp(80px, 12vw, 160px)',
          height: 'clamp(30px, 5vw, 65px)',
          filter: 'drop-shadow(0 15px 25px rgba(15,35,55,0.4))'
        }}
      >
        <div 
          className="w-full h-full"
          style={{
            background: 'rgba(15, 35, 55, 0.75)',
            clipPath: 'polygon(0% 100%, 8% 60%, 15% 75%, 22% 40%, 30% 65%, 38% 30%, 45% 55%, 52% 20%, 58% 50%, 65% 35%, 72% 60%, 80% 45%, 88% 65%, 95% 55%, 100% 100%)',
          }}
        />
      </div>

      <div 
        ref={waterShimmerRef}
        className="absolute bottom-0 left-0 w-full h-[45%] z-[1] pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(92deg, transparent, transparent 60px, rgba(255,255,255,0.025) 61px, rgba(255,255,255,0.025) 62px)',
        }}
      />
    </section>
  );
};

export default Moment02;
