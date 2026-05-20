import { gsap, SplitText } from '@/lib/gsap';

/**
 * Kinetic-typography helper for the six emotional anchor words in the copy.
 *
 * The site uses Cormorant Garamond from Google Fonts, which is a static
 * family (no variable wght/ital axes). So the "breath" effect here is
 * synthesized from the levers the font does give us: letter-spacing,
 * per-char baseline-shift, opacity micro-flutter, and a brief italic→roman
 * stutter on alternating chars.
 *
 * Use it on words that are already inside a SplitText word array. After
 * the parent reveal lands, fire {play} once via a one-shot tl.call. Don't
 * re-fire on scroll-reverse — the breath is a one-time arrival cue.
 */

const KINETIC_TARGETS = [
  'arrival',
  'lagoon',
  'equator',
  'invisible',
  'coordinates',
  'lantern',
];

const normalize = (text: string | null | undefined): string => {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z]/g, '');
};

export const isKineticTarget = (text: string | null | undefined): boolean => {
  const n = normalize(text);
  return n.length > 0 && KINETIC_TARGETS.includes(n);
};

export interface KineticWord {
  el: HTMLElement;
  chars: HTMLElement[];
  play: () => gsap.core.Timeline;
  revert: () => void;
}

export const buildKineticWord = (wordEl: HTMLElement): KineticWord => {
  const charSplit = new SplitText(wordEl, {
    type: 'chars',
    charsClass: 'kinetic-char',
  });
  const chars = (charSplit.chars as HTMLElement[]) ?? [];

  // inline-block lets us transform individual chars; willChange hints the
  // compositor since these will animate together briefly.
  chars.forEach((c) => {
    c.style.display = 'inline-block';
    c.style.willChange = 'transform, letter-spacing';
  });

  let active: gsap.core.Timeline | null = null;
  let played = false;

  const play = (): gsap.core.Timeline => {
    // One-shot guard — repeated calls (from scrubbed timelines crossing the
    // cue multiple times) collapse to a no-op after the first play.
    if (played) {
      const noop = gsap.timeline();
      return noop;
    }
    played = true;

    if (active) active.kill();
    const tl = gsap.timeline();
    active = tl;
    if (chars.length === 0) return tl;

    // Settle the chars from a micro-expanded state with alternating baseline
    // offsets. Reads as a quiet exhale rather than a flourish.
    tl.fromTo(
      chars,
      {
        letterSpacing: '0.05em',
        y: (i) => (i % 2 === 0 ? -3 : 3),
        opacity: 0.82,
      },
      {
        letterSpacing: '0em',
        y: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.04,
        ease: 'expo.out',
      }
    );

    // Italic → roman → italic stutter on every third char. The font has
    // both styles loaded, so this is an actual structural shift, not a
    // simulated weight change. Subtle, visible only on close watch.
    chars.forEach((c, i) => {
      if (i % 3 !== 1) return;
      const at = i * 0.04 + 0.14;
      tl.call(
        () => {
          c.style.fontStyle = 'normal';
        },
        [],
        at
      );
      tl.call(
        () => {
          c.style.fontStyle = '';
        },
        [],
        at + 0.10
      );
    });

    // Release willChange after the breath completes — keeps compositing
    // memory low across an 11-moment scroll.
    tl.call(() => {
      chars.forEach((c) => {
        c.style.willChange = '';
      });
    });

    return tl;
  };

  const revert = () => {
    active?.kill();
    active = null;
    charSplit.revert();
  };

  return { el: wordEl, chars, play, revert };
};

/**
 * Build kinetic controllers for every target word inside a SplitText words
 * array. Returns a list of controllers — the consumer calls .play() on each
 * at the right cue, and .revert() in cleanup.
 */
export const buildKineticWordsFor = (
  words: Element[] | null | undefined
): KineticWord[] => {
  if (!words) return [];
  return words
    .filter((w): w is HTMLElement => w instanceof HTMLElement)
    .filter((w) => isKineticTarget(w.textContent))
    .map((w) => buildKineticWord(w));
};
