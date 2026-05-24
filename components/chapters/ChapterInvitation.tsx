"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { useScroll } from "@/lib/context/ScrollContext";
import { useWebGLContent } from "@/components/WebGL/WebGLContentLayer";

/**
 * Chapter VII — The Invitation. The emotional climax of the scroll.
 *
 * Two deliberate moves separate this from a standard contact form:
 *
 *   1. The reassurance ("Your message reaches our director directly…") is
 *      gated behind the name field. It only appears once the user has
 *      filled in their name and blurred the field — so the system reads as
 *      if it's acknowledging them, not advertising itself.
 *
 *   2. Submission is a full-section ceremony rather than an inline swap.
 *      The editorial column fades out, a blackout overlay rises, and a
 *      centered serif-italic thank-you reveals from blur. The persistent
 *      bottom signature stays on top as the page's closing line.
 */
export default function ChapterInvitation({}: { index: number }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const headlineRef = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const reassureRef = useRef<HTMLParagraphElement>(null);

  const ceremonyRef = useRef<HTMLDivElement>(null);
  const ceremonyBlackoutRef = useRef<HTMLDivElement>(null);
  const thankYouTitleRef = useRef<HTMLParagraphElement>(null);
  const thankYouNoteRef = useRef<HTMLParagraphElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameBlurred, setNameBlurred] = useState(false);
  const [sent, setSent] = useState(false);
  const { isMobile } = useScroll();

  useWebGLContent({
    id: "chapter-07-invitation",
    src: "/assets/chapter-07-invitation/photo.webp",
    poster: "/assets/chapter-07-invitation/photo.poster.jpg",
    triggerRef: sectionRef,
  });

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const headlineEl = headlineRef.current;
    // Line-only split — no per-word reveal. The headline lands as a single
    // quiet block, not as a typographic flourish.
    const splitHeadline = headlineEl
      ? new SplitText(headlineEl, {
          type: "lines",
          linesClass: "chapter-line",
        })
      : null;

    if (splitHeadline?.lines) {
      gsap.set(splitHeadline.lines, { opacity: 0 });
    }
    if (headlineEl) {
      gsap.set(headlineEl, { letterSpacing: "0.04em" });
    }
    gsap.set([subRef.current, formRef.current], { opacity: 0 });
    gsap.set(reassureRef.current, { opacity: 0 });
    gsap.set(ceremonyRef.current, { opacity: 1, pointerEvents: "none" });
    gsap.set(ceremonyBlackoutRef.current, { opacity: 0 });
    gsap.set([thankYouTitleRef.current, thankYouNoteRef.current], {
      opacity: 0,
      y: 30,
      filter: "blur(8px)",
    });

    if (reducedMotion) {
      sectionEl.classList.add("active");
      gsap.set(sectionEl, { opacity: 1, scale: 1 });
      if (splitHeadline?.lines) {
        gsap.set(splitHeadline.lines, { opacity: 1 });
      }
      if (headlineEl) {
        gsap.set(headlineEl, { letterSpacing: "-0.005em" });
      }
      gsap.set(subRef.current, { opacity: 0.7 });
      gsap.set(formRef.current, { opacity: 1 });
      return () => splitHeadline?.revert();
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: "top top",
        end: isMobile ? "+=170%" : "+=270%",
        pin: true,
        pinSpacing: true,
        scrub: isMobile ? 0.9 : 1.4,
        onToggle: (self) =>
          sectionEl.classList.toggle("active", self.isActive),
      },
    });

    // Section settles in. Removed the scale wobble — pure opacity is calmer.
    tl.fromTo(
      sectionEl,
      { opacity: 0 },
      { opacity: 1, ease: "cinematic", duration: 0.40 },
      0.05
    );

    // Headline reveals line-by-line, paired with tracking settle.
    if (splitHeadline?.lines) {
      tl.to(
        splitHeadline.lines,
        {
          opacity: 1,
          stagger: 0.16,
          duration: 0.40,
          ease: "cinematic",
        },
        0.28
      );
    }
    if (headlineEl) {
      tl.to(
        headlineEl,
        { letterSpacing: "-0.005em", duration: 0.70, ease: "cinematic" },
        0.28
      );
    }

    // Sub line — opacity only, no y. Lands after headline settles.
    tl.to(
      subRef.current,
      { opacity: 0.75, duration: 0.30, ease: "cinematic" },
      0.55
    );
    // Form — opacity only, slow. Reads as the section opening itself,
    // not as a "form appearing".
    tl.to(
      formRef.current,
      { opacity: 1, duration: 0.50, ease: "cinematic" },
      0.66
    );

    return () => {
      tl.kill();
      splitHeadline?.revert();
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === sectionEl)
        .forEach((st) => st.kill());
    };
  }, [isMobile]);

  useEffect(() => {
    if (sent) return;
    if (!nameBlurred || !name.trim()) return;
    // Opacity-only fade; the line acknowledges the user's name, not their scroll.
    gsap.to(reassureRef.current, {
      opacity: 0.5,
      duration: 1.4,
      ease: "cinematic",
    });
  }, [nameBlurred, name, sent]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (sent) return;
    if (!name.trim() || !email.trim() || !email.includes("@")) return;
    setSent(true);

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      gsap.set(
        [
          headlineRef.current,
          subRef.current,
          formRef.current,
          reassureRef.current,
        ],
        { opacity: 0 }
      );
      gsap.set(ceremonyBlackoutRef.current, { opacity: 0.94 });
      gsap.set([thankYouTitleRef.current, thankYouNoteRef.current], {
        opacity: 1,
        y: 0,
        filter: "none",
      });
      gsap.set(ceremonyRef.current, { pointerEvents: "auto" });
      return;
    }

    gsap.to(
      [
        headlineRef.current,
        subRef.current,
        formRef.current,
        reassureRef.current,
      ],
      {
        opacity: 0,
        y: -24,
        filter: "blur(4px)",
        duration: 0.9,
        ease: "cinematic",
      }
    );

    gsap.to(ceremonyBlackoutRef.current, {
      opacity: 0.94,
      duration: 1.1,
      ease: "power2.inOut",
      delay: 0.15,
    });

    gsap.to(thankYouTitleRef.current, {
      opacity: 0.96,
      y: 0,
      filter: "blur(0px)",
      duration: 1.4,
      ease: "expo.out",
      delay: 0.85,
    });

    gsap.to(thankYouNoteRef.current, {
      opacity: 0.7,
      y: 0,
      filter: "blur(0px)",
      duration: 1.0,
      ease: "cinematic",
      delay: 1.5,
    });

    gsap.set(ceremonyRef.current, { pointerEvents: "auto", delay: 0.5 });
  };

  return (
    <section
      ref={sectionRef}
      className="moment relative w-full overflow-hidden"
      id="chapter-07-invitation"
      aria-label="Chapter VII — The Invitation"
    >
      <div className="absolute top-[18%] md:top-[20%] left-[8%] md:left-[10%] right-[8%] md:right-[10%] z-20 max-w-[42em] pointer-events-none">
        <p
          ref={headlineRef}
          className="italic font-light"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2rem, 4.5vw, 4rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.005em",
            color: "rgba(255,250,240,0.94)",
            textShadow: "0 4px 50px rgba(6,8,16,0.55)",
          }}
        >
          Reservation is by correspondence.
        </p>

        <p
          ref={subRef}
          className="mt-6 md:mt-8 max-w-[30em] font-light italic"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1rem, 1.5vw, 1.4rem)",
            lineHeight: 1.5,
            color: "rgba(245,240,232,0.75)",
          }}
        >
          Leave us your name and a place to reach you.
        </p>

        <div
          className="mt-10 md:mt-12 relative"
          style={{ minHeight: "17em" }}
        >
          <form
            ref={formRef}
            onSubmit={handleSend}
            className="absolute inset-0 flex flex-col gap-7 pointer-events-auto"
            noValidate
          >
            <FieldLabel label="Your name">
              <input
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => {
                  if (e.currentTarget.value.trim().length > 0) {
                    setNameBlurred(true);
                  }
                  e.currentTarget.style.borderBottomColor =
                    "rgba(245,240,232,0.3)";
                }}
                placeholder="—"
                className="w-full bg-transparent pb-3 italic font-light focus:outline-none"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(1.1rem, 1.6vw, 1.5rem)",
                  color: "rgba(255,250,240,0.95)",
                  borderBottom: "1px solid rgba(245,240,232,0.3)",
                  transition: "border-color 700ms ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderBottomColor =
                    "rgba(245,240,232,0.7)";
                }}
              />
            </FieldLabel>

            <FieldLabel label="Where to reach you">
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="—"
                className="w-full bg-transparent pb-3 italic font-light focus:outline-none"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(1.1rem, 1.6vw, 1.5rem)",
                  color: "rgba(255,250,240,0.95)",
                  borderBottom: "1px solid rgba(245,240,232,0.3)",
                  transition: "border-color 700ms ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderBottomColor =
                    "rgba(245,240,232,0.7)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderBottomColor =
                    "rgba(245,240,232,0.3)";
                }}
              />
            </FieldLabel>

            <button
              type="submit"
              data-cursor="cta"
              className="group italic font-light bg-transparent border-0 cursor-pointer p-0 self-start mt-2"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
                letterSpacing: "-0.005em",
                color: "rgba(255,250,240,0.95)",
              }}
              aria-label="Send your message to the concierge"
            >
              <span className="relative inline-block">
                Send
                <span
                  aria-hidden
                  className="absolute left-0 right-0 -bottom-[0.05em] h-[1px] origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-[1200ms] ease-out"
                  style={{ background: "rgba(255,250,240,0.65)" }}
                />
              </span>
            </button>
          </form>
        </div>

        <p
          ref={reassureRef}
          className="mt-8 md:mt-10 max-w-[30em] font-light"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(0.7rem, 0.85vw, 0.85rem)",
            letterSpacing: "0.05em",
            lineHeight: 1.6,
            color: "rgba(245,240,232,0.45)",
          }}
        >
          Your message reaches our director directly. No bookings are taken
          through this page.
        </p>
      </div>

      <div
        ref={ceremonyRef}
        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
        aria-live="polite"
      >
        <div
          ref={ceremonyBlackoutRef}
          className="absolute inset-0 bg-black"
        />
        <div className="relative z-10 w-full max-w-[28em] px-8 text-center">
          <p
            ref={thankYouTitleRef}
            className="italic font-light"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 5vw, 4.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "rgba(255,250,240,0.96)",
              textShadow: "0 4px 60px rgba(0,0,0,0.85)",
            }}
          >
            Thank you, {name.trim() || "guest"}.
          </p>
          <p
            ref={thankYouNoteRef}
            className="mt-10 md:mt-14 uppercase mx-auto max-w-[24em]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(0.7rem, 0.95vw, 1rem)",
              letterSpacing: "0.35em",
              lineHeight: 1.7,
              color: "rgba(245,240,232,0.7)",
            }}
          >
            We will write within the hour.
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-10 left-0 w-full text-center z-40 pointer-events-none uppercase"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "10px",
          letterSpacing: "0.3em",
          color: "rgba(150,165,180,0.3)",
        }}
      >
        The Arrival · A Maldives Experience
      </div>
    </section>
  );
}

const FieldLabel = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span
      className="block uppercase mb-3"
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "clamp(0.625rem, 0.7vw, 0.75rem)",
        letterSpacing: "0.45em",
        color: "rgba(245,240,232,0.45)",
      }}
    >
      {label}
    </span>
    {children}
  </label>
);
