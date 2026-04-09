"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from "@/lib/gsap";

const Moment02 = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const islandRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current || !islandRef.current || !overlayRef.current || !backgroundRef.current) return;

      // --- Scroll-In Animation (from Moment01) ---
      gsap.fromTo(islandRef.current, 
        { x: 40, opacity: 0 },
        { 
          x: 0, 
          opacity: 1,
          force3D: true,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "top top",
            scrub: 2,
            onEnter: () => { gsap.set(islandRef.current, { willChange: "transform, opacity" }); },
            onLeave: () => { gsap.set(islandRef.current, { clearProps: "willChange" }); },
            onEnterBack: () => { gsap.set(islandRef.current, { willChange: "transform, opacity" }); },
            onLeaveBack: () => { gsap.set(islandRef.current, { clearProps: "willChange" }); },
          }
        }
      );

      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        {
          opacity: 0.6,
          force3D: true,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "top top",
            scrub: 2,
          }
        }
      );

      // --- Scroll-Out Animation (toward Moment03) ---
      const exitTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 2.5,
        },
        onStart: () => { gsap.set([islandRef.current, backgroundRef.current], { willChange: "transform, opacity" }); },
        onComplete: () => { gsap.set([islandRef.current, backgroundRef.current], { clearProps: "willChange" }); }
      });

      exitTl.to(islandRef.current, {
        scale: 1.6,
        x: "-8vw",
        force3D: true,
        ease: "none"
      }, 0);

      exitTl.to(backgroundRef.current, {
        y: "8%",
        force3D: true,
        ease: "none"
      }, 0);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="moment relative min-h-[100svh] w-screen overflow-hidden" 
      id="moment-02"
    >
      {/* Background Base */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 w-full h-[110%] -top-[5%]" // Extra height for Y translation
        style={{
          background: 'linear-gradient(180deg, #0e2038 0%, #1c4d70 30%, #3a8aaa 60%, #89c0d0 82%, #d4eaf0 100%)'
        }}
      />

      {/* Warm Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(210,160,80,0.08) 0%, transparent 50%)'
        }}
      />

      {/* Island Silhouette Container for Shadow */}
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

      {/* Water Shimmer */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[45%] z-[1] pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(92deg, transparent, transparent 60px, rgba(255,255,255,0.025) 61px, rgba(255,255,255,0.025) 62px)',
          animation: 'waterMove 5s linear infinite'
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes waterMove {
          from { background-position-x: 0px; }
          to { background-position-x: 120px; }
        }
      ` }} />
    </section>
  );
};

export default Moment02;
