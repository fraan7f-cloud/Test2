import T from "./timeline.json";

export const FPS = T.fps;
export const INTRO = T.intro;
export const s2f = (s: number) => INTRO + Math.round(s * FPS);
export const OUTRO = s2f(T.outroStart);
export const OUTRO_PARTS = T.outroParts;
export const TOTAL = OUTRO + OUTRO_PARTS.reduce((a, b) => a + b, 0);
export const SCENES = T.scenes;
export const TRANS = 12; // frames de solapamiento entre escenas

export const GOLD = "linear-gradient(180deg,#fff7d6 0%,#ffe08a 35%,#e2a93c 65%,#fff0b8 100%)";
