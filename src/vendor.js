
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';
import CustomEase from 'gsap/CustomEase';
import SplitText from 'gsap/SplitText';
import Draggable from 'gsap/Draggable';
import InertiaPlugin from 'gsap/InertiaPlugin';


export * from '../dist/lenis-vanilla.js';




gsap.registerPlugin(
  ScrollTrigger,
  ScrambleTextPlugin,
  SplitText,
  CustomEase,
  Draggable,
  InertiaPlugin
);

export {
  gsap,
  ScrollTrigger,
  ScrambleTextPlugin,
  CustomEase,
  SplitText,
  Draggable,
  InertiaPlugin
};
