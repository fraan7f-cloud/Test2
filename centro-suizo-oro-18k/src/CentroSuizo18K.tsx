import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, interpolate, Sequence, staticFile, Track} from 'remotion';
import {Backdrop} from './components/Backdrop';
import {LightSweep} from './components/LightSweep';
import {NUGGET_HIT, S1Hook} from './scenes/S1Hook';
import {S2Seed} from './scenes/S2Seed';
import {S3TwentyFour, SEGMENT_START, SEGMENT_STEP} from './scenes/S3TwentyFour';
import {HIGHLIGHT_AT, KARATS, S4Compare} from './scenes/S4Compare';
import {ALLOY_AT, DENT_AT, S5WhyNot24} from './scenes/S5WhyNot24';
import {S6Hallmark, STAMP_AT} from './scenes/S6Hallmark';
import {LOGO_AT, S7Closing, TAGLINE_AT} from './scenes/S7Closing';
import './fonts';

/**
 * Inicio de cada escena en frames (30 fps). Todas caen en el primer tiempo de un compás
 * de la música (72 BPM → 1 compás = 100 frames), así imagen y música respiran juntas.
 */
const S = {hook: 0, seed: 100, parts: 300, compare: 500, why: 800, hallmark: 1000, closing: 1200, end: 1500};
const CUTS = [S.seed, S.parts, S.compare, S.why, S.hallmark, S.closing];

const sfx = (file: string) => staticFile(`audio/${file}`);

export const CentroSuizo18K: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#080809'}}>
      <Backdrop />

      <Track name="Escenas">
        <Sequence name="1 · Gancho 18K" from={S.hook} durationInFrames={S.seed - S.hook}>
          <S1Hook />
        </Sequence>
        <Sequence name="2 · La semilla" from={S.seed} durationInFrames={S.parts - S.seed}>
          <S2Seed />
        </Sequence>
        <Sequence name="3 · 24 partes" from={S.parts} durationInFrames={S.compare - S.parts}>
          <S3TwentyFour />
        </Sequence>
        <Sequence name="4 · Comparación" from={S.compare} durationInFrames={S.why - S.compare}>
          <S4Compare />
        </Sequence>
        <Sequence name="5 · ¿Por qué no 24K?" from={S.why} durationInFrames={S.hallmark - S.why}>
          <S5WhyNot24 />
        </Sequence>
        <Sequence name="6 · Sello 750" from={S.hallmark} durationInFrames={S.closing - S.hallmark}>
          <S6Hallmark />
        </Sequence>
        <Sequence name="7 · Cierre y logo" from={S.closing} durationInFrames={S.end - S.closing}>
          <S7Closing />
        </Sequence>
      </Track>

      <LightSweep cuts={CUTS} />

      {/* ---------- Música original (generada con scripts/generate_audio.py) ---------- */}
      <Audio
        name="Música original"
        src={sfx('music.wav')}
        volume={(f) => interpolate(f, [0, 6], [0.4, 0.74], {extrapolateRight: 'clamp'})}
      />

      {/* ---------- Efectos de sonido (también sintetizados desde cero) ---------- */}
      <Track name="SFX · Gancho">
        <Audio name="Impacto 18K" src={sfx('impact.wav')} from={S.hook + NUGGET_HIT - 1} volume={0.8} />
      </Track>
      <Track name="SFX · Riser">
        <Audio name="Subida inicial" src={sfx('riser.wav')} from={S.hook + 12} volume={0.28} />
        <Audio name="Subida al logo" src={sfx('riser.wav')} from={S.closing + LOGO_AT - 90} volume={0.22} />
      </Track>
      <Track name="SFX · Brillos">
        <Audio name="Brillo 18K" src={sfx('shimmer.wav')} from={S.hook + 26} volume={0.55} />
        <Audio name="Brillo 18K destacado" src={sfx('shimmer.wav')} from={S.compare + HIGHLIGHT_AT} volume={0.5} />
        <Audio name="Brillo anillo 18K" src={sfx('shimmer.wav')} from={S.why + ALLOY_AT + 64} volume={0.45} />
        <Audio name="Brillo 'Se sienten'" src={sfx('shimmer.wav')} from={S.closing + TAGLINE_AT + 28} volume={0.5} />
      </Track>
      <Track name="SFX · Transiciones">
        {CUTS.map((cut) => (
          // el pico del whoosh (75 % de 1,1 s ≈ 25 frames) coincide con el corte
          <Audio key={cut} name={`Whoosh ${cut}`} src={sfx('whoosh.wav')} from={cut - 25} volume={0.5} />
        ))}
      </Track>
      <Track name="SFX · Ticks">
        <Audio name="Semilla cae" src={sfx('tick.wav')} from={S.seed + 66} volume={0.7} />
        <Audio name="Oro cae" src={sfx('tick.wav')} from={S.seed + 104} volume={0.7} />
        <Audio name="Gota oro" src={sfx('tick.wav')} from={S.why + ALLOY_AT + 20} volume={0.6} />
        <Audio name="Gota plata" src={sfx('tick.wav')} from={S.why + ALLOY_AT + 34} volume={0.5} />
        <Audio name="Gota cobre" src={sfx('tick.wav')} from={S.why + ALLOY_AT + 44} volume={0.5} />
        <Audio name="Joyero se abre" src={sfx('tick.wav')} from={S.closing + 8} volume={0.6} />
        {new Array(24).fill(true).map((_, i) => (
          <Audio
            key={`seg${i}`}
            name={`Segmento ${i + 1}`}
            src={sfx('tick.wav')}
            from={S.parts + Math.round(SEGMENT_START + i * SEGMENT_STEP)}
            volume={0.22 + (i / 23) * 0.18}
          />
        ))}
        {KARATS.map((k) => (
          <Audio key={k.k} name={`Barra ${k.k}`} src={sfx('tick.wav')} from={S.compare + k.at} volume={0.55} />
        ))}
      </Track>
      <Track name="SFX · Metal">
        <Audio name="Abolladura 24K" src={sfx('stamp.wav')} from={S.why + DENT_AT} volume={0.35} />
        <Audio name="Sello 750" src={sfx('stamp.wav')} from={S.hallmark + STAMP_AT} volume={0.62} />
        <Audio name="Impacto sello" src={sfx('impact.wav')} from={S.hallmark + STAMP_AT} volume={0.2} />
      </Track>
      <Track name="SFX · Logo">
        <Audio name="Campana logo" src={sfx('chime.wav')} from={S.closing + LOGO_AT} volume={0.55} />
      </Track>
    </AbsoluteFill>
  );
};
