import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/all';
import { SplitText } from 'gsap/all';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
  
  // Create the precise high-end cinematic ease: cubic-bezier(0.16, 1, 0.3, 1)
  CustomEase.create("cinematic", "M0,0 C0.16,1 0.3,1 1,1");
}

export { gsap, ScrollTrigger, SplitText, CustomEase };
export default gsap;
