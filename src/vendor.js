
//import gsap from 'gsap';
//import ScrollTrigger from 'gsap/ScrollTrigger';
//import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';
//import CustomEase from 'gsap/CustomEase';
//import SplitText from 'gsap/SplitText';
//import Draggable from 'gsap/Draggable';
//import InertiaPlugin from 'gsap/InertiaPlugin';


// vendor.js

import gsap from 'https://esm.sh/gsap@3.15.0';
import { ScrollTrigger } from 'https://esm.sh/gsap@3.15.0/ScrollTrigger';
import { ScrambleTextPlugin } from 'https://esm.sh/gsap@3.15.0/ScrambleTextPlugin';
import { CustomEase } from 'https://esm.sh/gsap@3.15.0/CustomEase';
import { SplitText } from 'https://esm.sh/gsap@3.15.0/SplitText';
import { Draggable } from 'https://esm.sh/gsap@3.15.0/Draggable';
import { InertiaPlugin } from 'https://esm.sh/gsap@3.15.0/InertiaPlugin';

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
