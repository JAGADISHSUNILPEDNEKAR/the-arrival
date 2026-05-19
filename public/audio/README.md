# Ambient audio

`components/AudioToggle.tsx` looks for an ambient loop at:

```
public/audio/ambient.mp3
```

Drop a single file at that path. If it loads (`canplaythrough` fires), the
toggle button appears at the bottom-right corner of the site. If it's
absent or fails to load, the button stays hidden — no error UI.

## Recommended properties

| | |
|---|---|
| Format | MP3 (universal browser support) |
| Length | 30s–2min, seamlessly loopable |
| Volume | Mastered quiet — the player caps at `0.35` |
| Content | Soft ocean wash, wind through palms, distant tide |

Anything that loops without an audible seam works. Avoid sharp transients
(birds, voices) — they pull attention from the scroll narrative.

## Player behaviour

- Default state: OFF. Browsers block autoplay; the player respects that.
- Click toggles. Volume fades in over 2 seconds, out over 0.8 seconds.
- State persists via `localStorage` (`arrival.audio.enabled`). A returning
  user who had it on gets it re-enabled silently if the browser permits;
  if the browser blocks (no recent gesture), the player falls back to OFF
  without showing an error.
