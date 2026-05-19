"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Optional ambient audio loop. Off by default.
 *
 * Sources the file from `/public/audio/ambient.mp3`. If the file is absent
 * (canplay never fires), the toggle UI never renders — same procedural-
 * fallback contract as AssetSlot. To add ambient sound: drop a real
 * recording at that path; no code change needed.
 */
const AUDIO_SRC = '/audio/ambient.mp3';
const STORAGE_KEY = 'arrival.audio.enabled';
const TARGET_VOLUME = 0.35;
const FADE_IN_DURATION = 2.0;
const FADE_OUT_DURATION = 0.8;

const AudioToggle = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);

  // Restore saved preference (without auto-playing — browsers require gesture).
  // rAF defers the setState out of the effect body to satisfy
  // react-hooks/set-state-in-effect.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== 'true') return;
    const rafId = requestAnimationFrame(() => setEnabled(true));
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Audio element load lifecycle.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.volume = 0;
    audio.preload = 'auto';

    const onCanPlay = () => setReady(true);
    const onError = () => setReady(false);

    audio.addEventListener('canplaythrough', onCanPlay);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('canplaythrough', onCanPlay);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Scroll fade-in matching GlobalNav (visible after 30% scroll).
  useEffect(() => {
    if (!containerRef.current) return;
    gsap.set(containerRef.current, { opacity: 0, pointerEvents: 'none' });

    const st = ScrollTrigger.create({
      start: '30% top',
      onEnter: () => {
        gsap.to(containerRef.current, {
          opacity: 1,
          pointerEvents: 'auto',
          duration: 1,
          ease: 'power2.out',
        });
      },
      onLeaveBack: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          pointerEvents: 'none',
          duration: 0.8,
          ease: 'power2.in',
        });
      },
    });

    return () => st.kill();
  }, []);

  // Sync enabled state -> audio playback + volume.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !ready) return;

    if (enabled) {
      audio
        .play()
        .then(() => {
          gsap.to(audio, {
            volume: TARGET_VOLUME,
            duration: FADE_IN_DURATION,
            ease: 'power1.inOut',
          });
        })
        .catch(() => {
          // Autoplay blocked (returning user hasn't gestured yet) — revert.
          setEnabled(false);
        });
    } else {
      gsap.to(audio, {
        volume: 0,
        duration: FADE_OUT_DURATION,
        ease: 'power1.inOut',
        onComplete: () => audio.pause(),
      });
    }

    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // Storage may be unavailable (private browsing on some browsers).
    }
  }, [enabled, ready]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50"
    >
      <audio ref={audioRef} src={AUDIO_SRC} preload="auto" />
      {ready && (
        <button
          onClick={() => setEnabled((prev) => !prev)}
          data-cursor="cta"
          aria-label={enabled ? 'Mute ambient sound' : 'Play ambient sound'}
          aria-pressed={enabled}
          className="group flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.625rem, 0.7vw, 0.75rem)',
            letterSpacing: '0.4em',
            color: 'rgba(245,240,232,0.55)',
            transition: 'color 600ms ease',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            aria-hidden
            style={{ flexShrink: 0 }}
          >
            {enabled ? (
              <g stroke="currentColor" strokeLinecap="round" strokeWidth="1">
                <line x1="2" y1="4.5" x2="12" y2="4.5" opacity="0.6" />
                <line x1="3" y1="7" x2="11" y2="7" />
                <line x1="4" y1="9.5" x2="10" y2="9.5" opacity="0.6" />
              </g>
            ) : (
              <g stroke="currentColor" strokeLinecap="round" strokeWidth="1">
                <line x1="3" y1="7" x2="11" y2="7" opacity="0.4" />
                <line x1="3" y1="3" x2="11" y2="11" />
              </g>
            )}
          </svg>
          <span className="uppercase">{enabled ? 'Sound on' : 'Sound off'}</span>
        </button>
      )}
    </div>
  );
};

export default AudioToggle;
