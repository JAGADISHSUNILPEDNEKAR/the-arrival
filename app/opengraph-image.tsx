import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'The Arrival — A Private Island Restaurant in the Maldives';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(180deg, #060e1a 0%, #0a1825 55%, #1a3050 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(245,240,232,0.95)',
          fontFamily: 'serif',
          padding: 80,
          position: 'relative',
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            opacity: 0.55,
            marginBottom: 48,
            fontFamily: 'sans-serif',
            display: 'flex',
          }}
        >
          From the Maldives
        </div>
        <div
          style={{
            fontSize: 156,
            fontStyle: 'italic',
            fontWeight: 300,
            lineHeight: 0.92,
            textAlign: 'center',
            marginBottom: 32,
            letterSpacing: '-0.02em',
            display: 'flex',
          }}
        >
          The Arrival
        </div>
        <div
          style={{
            fontSize: 28,
            fontStyle: 'italic',
            fontWeight: 300,
            opacity: 0.72,
            textAlign: 'center',
            maxWidth: 700,
            display: 'flex',
          }}
        >
          A private island restaurant.
        </div>
        <div
          style={{
            position: 'absolute',
            left: '15%',
            right: '15%',
            top: 410,
            height: 1,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(245,240,232,0.4) 25%, rgba(245,240,232,0.4) 75%, transparent 100%)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
