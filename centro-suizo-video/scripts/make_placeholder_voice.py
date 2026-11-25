"""Genera la voz PROVISORIA del cierre con Kokoro (voz sintética genérica).

Este archivo existe solo para que el video tenga la frase final hablada mientras
no tengamos la grabación definitiva con la misma voz del narrador.
Para usar la voz real: reemplaza assets-src/cierre_voz.wav por la grabación
(cualquier sample rate, mono o estéreo) y vuelve a correr scripts/build_audio.py.

Uso:
  python scripts/make_placeholder_voice.py <kokoro-v1.0.onnx> <voices-v1.0.bin>
"""

import sys
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro

TEXT = (
    "Si conoces a alguien que está pensando en pedir matrimonio, "
    "mándale este video. ¡Centro Suizo podría ser parte de su historia!"
)

ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    model, voices = sys.argv[1], sys.argv[2]
    kokoro = Kokoro(model, voices)
    samples, sr = kokoro.create(TEXT, voice="em_alex", speed=1.1, lang="es")
    out = ROOT / "assets-src" / "cierre_voz.wav"
    sf.write(out, samples, sr)
    print(f"{out} ({len(samples) / sr:.2f}s)")


if __name__ == "__main__":
    main()
