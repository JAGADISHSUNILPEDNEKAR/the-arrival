"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from "@/lib/gsap";

const Moment11 = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const backgroundWrapperRef = useRef<HTMLDivElement>(null);
  const horizonRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [starsData, setStarsData] = useState<any[]>([]);

  useEffect(() => {
    // Generate 15 stars only on client
    setStarsData(Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 30}%`, // Concentrated in upper 30%
      left: `${Math.random() * 100}%`,
      opacity: 0.15 + Math.random() * 0.2, // 0.15-0.35
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    })));

    const ctx = gsap.context(() => {
      if (!sectionRef.current || !horizonRef.current || !textRef.current || !backgroundWrapperRef.current) return;

      // Initial states
      gsap.set(sectionRef.current, { opacity: 0 });
      gsap.set(textRef.current, { opacity: 0 });
      gsap.set(horizonRef.current, { scaleX: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top 30%",
          scrub: 1,
          onEnter: () => { gsap.set([sectionRef.current, backgroundWrapperRef.current], { willChange: "opacity, transform" }); },
          onLeave: () => { gsap.set([sectionRef.current, backgroundWrapperRef.current], { clearProps: "willChange" }); },
        }
      });

      // Section fades in over first 30% of scroll entry
      tl.to(sectionRef.current, {
        opacity: 1,
        force3D: true,
        ease: "power2.out",
        duration: 1
      }, 0);

      // Horizon line draws in from center over 2s
      gsap.to(horizonRef.current, {
        scaleX: 1,
        duration: 2,
        force3D: true,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          onEnter: () => { gsap.set(horizonRef.current, { willChange: "transform" }); },
          onLeave: () => { gsap.set(horizonRef.current, { clearProps: "willChange" }); },
        }
      });

      // Text fades in separately, delayed 0.5s after section appears
      gsap.to(textRef.current, {
        opacity: 1,
        duration: 1.5,
        delay: 0.5,
        force3D: true,
        ease: "power1.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          onEnter: () => { gsap.set(textRef.current, { willChange: "opacity" }); },
          onLeave: () => { gsap.set(textRef.current, { clearProps: "willChange" }); },
        }
      });

    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);



  return (
    <section 
      ref={sectionRef}
      className="moment relative h-screen w-screen overflow-hidden" 
      id="moment-11"
    >
      {/* Background Wrapper with Breathe animation */}
      <div 
        ref={backgroundWrapperRef}
        className="absolute inset-0 w-full h-full"
        style={{ animation: 'breatheFinal 8s ease-in-out infinite' }}
      >
        {/* Layer 1: Pre-dawn Sky Gradient */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'linear-gradient(180deg, #050810 0%, #0a1020 20%, #0d1828 45%, #152235 65%, #1a2d42 80%, #1e3450 92%, #223858 100%)'
          }}
        />

        {/* Layer 2: Residual Stars */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {starsData.map((star) => (
            <div 
              key={star.id}
              className="absolute w-[1px] h-[1px] bg-white rounded-full"
              style={{
                top: star.top,
                left: star.left,
                opacity: star.opacity,
                animation: `twinkleDim ${star.duration}s ease-in-out ${star.delay}s infinite alternate`
              }}
            />
          ))}
        </div>

        {/* Layer 3: Horizon Line */}
        <div 
          ref={horizonRef}
          className="absolute left-0 w-full h-[1px] z-10 origin-center"
          style={{
            top: '55%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(100,140,170,0.25) 20%, rgba(130,165,190,0.35) 50%, rgba(100,140,170,0.25) 80%, transparent 100%)'
          }}
        />

        {/* Layer 4: Water (Pre-dawn Lagoon) */}
        <div 
          className="absolute bottom-0 left-0 w-full h-[45%] z-5 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(20,45,70,0.8) 0%, rgba(15,35,55,0.9) 40%, rgba(10,25,40,0.95) 100%)'
          }}
        >
          {/* Subtle Surface Texture */}
          <div 
            className="absolute inset-0 w-full h-full opacity-30"
            style={{
              background: 'repeating-linear-gradient(92deg, transparent 0%, rgba(255,255,255,0.008) 50%, transparent 100%)',
              backgroundSize: '80px 100%',
              animation: 'preDawnWater 12s linear infinite'
            }}
          />
        </div>
      </div>

      {/* CALL TO ACTION TEXT & FORM */}
      <div 
        ref={textRef}
        className="absolute top-[50%] md:top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center w-full max-w-lg px-6 w-full"
      >
        <div 
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(1.5rem, 4vw, 2.8rem)',
            color: 'rgba(220,235,245,0.95)',
            letterSpacing: '0.05em',
            textAlign: 'center',
            marginBottom: '0.5rem',
            lineHeight: '1.2'
          }}
        >
          Reserve Your Island Experience.
        </div>
        
        <p 
          className="text-center font-light mb-8 text-[rgba(200,215,230,0.7)] tracking-wider text-xs md:text-sm"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Your table at the edge of the world awaits.
        </p>

        {/* Glass Form */}
        <form className="w-full bg-[rgba(10,20,35,0.5)] backdrop-blur-xl border border-[rgba(100,140,170,0.2)] p-6 md:p-8 flex flex-col gap-6 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm pointer-events-auto">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-[rgba(200,215,230,0.6)]" style={{ fontFamily: 'var(--font-sans)' }}>Guest Name</label>
            <input type="text" className="w-full bg-transparent border-b border-[rgba(100,140,170,0.3)] pb-2 text-[rgba(230,240,250,0.9)] focus:outline-none focus:border-[rgba(230,240,250,0.6)] transition-colors font-light" placeholder="Your Name" />
          </div>
          
          <div className="flex gap-6">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="text-[10px] uppercase tracking-widest text-[rgba(200,215,230,0.6)]" style={{ fontFamily: 'var(--font-sans)' }}>Arrival Date</label>
              <input type="date" className="w-full bg-transparent border-b border-[rgba(100,140,170,0.3)] pb-2 text-[rgba(230,240,250,0.9)] focus:outline-none focus:border-[rgba(230,240,250,0.6)] transition-colors font-light appearance-none" style={{ colorScheme: 'dark' }} />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="text-[10px] uppercase tracking-widest text-[rgba(200,215,230,0.6)]" style={{ fontFamily: 'var(--font-sans)' }}>Party Size</label>
              <select className="w-full bg-transparent border-b border-[rgba(100,140,170,0.3)] pb-2 text-[rgba(230,240,250,0.9)] focus:outline-none focus:border-[rgba(230,240,250,0.6)] transition-colors font-light appearance-none text-sm">
                <option value="2" className="bg-[#152235]">2 Guests</option>
                <option value="4" className="bg-[#152235]">4 Guests</option>
                <option value="6" className="bg-[#152235]">6 Guests</option>
                <option value="private" className="bg-[#152235]">Private Buyout</option>
              </select>
            </div>
          </div>

          <button 
            type="button"
            className="mt-4 uppercase text-[11px] md:text-xs tracking-widest w-full py-4 bg-[rgba(230,240,250,0.9)] text-[#0a1020] hover:bg-white transition-colors duration-500 font-medium"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Secure Reservation
          </button>
        </form>
      </div>

      {/* FINAL TOUCH: Brand Line */}
      <div 
        className="absolute bottom-10 left-0 w-full text-center z-20 pointer-events-none"
        style={{
          fontFamily: 'sans-serif',
          fontSize: '10px',
          letterSpacing: '0.3em',
          color: 'rgba(150,165,180,0.3)',
          textTransform: 'uppercase'
        }}
      >
        THE ARRIVAL — A MALDIVES EXPERIENCE
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes breatheFinal {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes preDawnWater {
          0% { background-position-x: 0px; }
          100% { background-position-x: 80px; }
        }
        @keyframes twinkleDim {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.35; }
        }
      ` }} />
    </section>
  );
};

export default Moment11;
