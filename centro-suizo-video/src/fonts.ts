import { continueRender, delayRender, staticFile } from "remotion";

export const SANS = "Montserrat";
export const SERIF = "Cinzel";

const load = (family: string, file: string, weight: string) => {
  if (typeof document === "undefined") return;
  const handle = delayRender(`Font ${family}`);
  const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format("woff2")`, { weight });
  face.load().then((f) => { document.fonts.add(f); continueRender(handle); }).catch((e) => { console.error(e); continueRender(handle); });
};
load(SANS, "Montserrat.woff2", "100 900");
load(SERIF, "Cinzel.woff2", "400 900");
