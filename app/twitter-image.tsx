// Twitter card uses the same procedural editorial title card as Open Graph.
// Next requires route segment config to be declared inline (not re-exported),
// so we import the renderer and re-declare the config locally.
import OpengraphImage from './opengraph-image';

export const runtime = 'edge';
export const alt = 'The Arrival — A Private Island Restaurant in the Maldives';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default OpengraphImage;
