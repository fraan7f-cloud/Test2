"""Sintetiza desde cero la música original y los efectos de sonido del video.

No se descarga ni se usa ningún sample: todo sale de osciladores y ruido generados con numpy.
Uso:  python3 scripts/generate_audio.py   ->  public/audio/*.wav

Música: 72 BPM, Re mayor, 15 compases = 50,00 s exactos (1 compás = 100 frames a 30 fps).
"""
import pathlib
import wave

import numpy as np

SR = 48000
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "audio"
BPM = 72
BEAT = 60 / BPM            # 0,8333 s
BAR = 4 * BEAT             # 3,3333 s
DURATION = 50.0
rng = np.random.default_rng(1979)  # semilla fija: el resultado es reproducible


def midi(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


def t_axis(sec: float) -> np.ndarray:
    return np.arange(int(sec * SR)) / SR


def place(buf: np.ndarray, sig: np.ndarray, at: float, gain: float = 1.0) -> None:
    """Suma una señal (mono o estéreo) dentro del buffer estéreo a partir de `at` segundos."""
    i = int(at * SR)
    if sig.ndim == 1:
        sig = np.stack([sig, sig], 1)
    n = min(len(sig), len(buf) - i)
    if n > 0:
        buf[i:i + n] += sig[:n] * gain


def adsr(n: int, a: float, r: float) -> np.ndarray:
    env = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    env[:na] = np.linspace(0, 1, na) ** 2
    if nr:
        env[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return env


def fft_lowpass(x: np.ndarray, cutoff: float, slope: float = 4.0) -> np.ndarray:
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(x.shape[0], 1 / SR)
    h = 1 / np.sqrt(1 + (f / cutoff) ** (2 * slope))
    return np.fft.irfft(X * (h[:, None] if x.ndim == 2 else h), n=x.shape[0], axis=0)


def fft_bandpass(x: np.ndarray, lo: float, hi: float) -> np.ndarray:
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    h = 1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 8) / np.sqrt(1 + (f / hi) ** 8)
    return np.fft.irfft(X * h, n=len(x))


def reverb(x: np.ndarray, seconds: float = 2.8, wet: float = 0.28, bright: float = 6000) -> np.ndarray:
    """Reverb por convolución con una respuesta al impulso de ruido que decae (sala amplia)."""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = np.stack([rng.standard_normal(n), rng.standard_normal(n)], 1) * np.exp(-6.9 * t / seconds)[:, None]
    ir = fft_lowpass(ir, bright, 2)
    ir[: int(0.012 * SR)] = 0  # pre-delay 12 ms
    ir /= np.sqrt((ir ** 2).sum(0, keepdims=True))
    L = x.shape[0] + n
    size = 1 << int(np.ceil(np.log2(L)))
    y = np.fft.irfft(np.fft.rfft(x, size, axis=0) * np.fft.rfft(ir, size, axis=0), size, axis=0)[: x.shape[0]]
    return x * (1 - wet) + y * wet * 0.9


# ---------------------------------------------------------------- instrumentos

def pad_note(freq: float, sec: float, bright: float = 1.0) -> np.ndarray:
    """Pad cálido: 3 osciladores desafinados, aditivos (armónicos 1/n), estéreo."""
    t = t_axis(sec)
    out = np.zeros((len(t), 2))
    for ch, det in enumerate((-0.11, 0.13)):
        for d in (0.0, det, -det * 0.5):
            f = freq * 2 ** (d / 12)
            ph = rng.uniform(0, 2 * np.pi)
            for h in range(1, 7):
                if f * h > 9000:
                    break
                out[:, ch] += np.sin(2 * np.pi * f * h * t + ph * h) / (h ** (1.6 / bright))
    out *= adsr(len(t), 0.9, 1.2)[:, None] / 9
    # leve trémolo/chorus para que respire
    out *= (1 + 0.06 * np.sin(2 * np.pi * 0.23 * t[:, None] + np.array([[0, 1.7]])))
    return out


def bell(freq: float, sec: float = 2.6, decay: float = 1.4) -> np.ndarray:
    """Campana / piano eléctrico: parciales armónicos + uno inarmónico (brillo metálico del oro)."""
    t = t_axis(sec)
    partials = [(1, 1.0, 1.0), (2, 0.35, 1.6), (3, 0.12, 2.4), (2.756, 0.18, 2.8), (5.4, 0.05, 4.0)]
    s = np.zeros_like(t)
    for ratio, amp, dk in partials:
        s += amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t * dk / decay)
    s *= np.minimum(1, t / 0.004)
    return s * 0.5


def bass(freq: float, sec: float) -> np.ndarray:
    t = t_axis(sec)
    s = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(4 * np.pi * freq * t) + 0.08 * np.sin(6 * np.pi * freq * t)
    return s * np.exp(-t * 0.55) * np.minimum(1, t / 0.01) * adsr(len(t), 0.005, 0.3) * 0.55


def kick(sec: float = 0.6) -> np.ndarray:
    t = t_axis(sec)
    f = 44 + 80 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7.5) * 0.9


def shaker(sec: float = 0.09) -> np.ndarray:
    n = int(sec * SR)
    s = fft_bandpass(rng.standard_normal(n), 6000, 14000)
    t = np.arange(n) / SR
    return s * np.exp(-t * 55) * np.minimum(1, t / 0.006) * 0.35


# ---------------------------------------------------------------- música

CHORDS = {  # notas MIDI (voicings abiertos)
    "D5":    [38, 45, 50, 57],
    "Dmaj7": [50, 54, 57, 61, 64],
    "Dmaj9": [50, 57, 61, 64, 66, 69],
    "Bm7":   [47, 54, 57, 62, 66],
    "Gmaj7": [43, 50, 54, 59, 62, 66],
    "A6":    [45, 52, 57, 61, 66],
    "Asus":  [45, 52, 57, 62, 64],
    "Em9":   [40, 50, 54, 59, 62, 66],
    "F#m7":  [42, 49, 52, 57, 61, 64],
}
#            1      2        3      4        5       6        7      8        9      10      11       12      13       14     15
PROGRESSION = ["D5", "Dmaj7", "Bm7", "Gmaj7", "A6", "Dmaj7", "Bm7", "Gmaj7", "Em9", "Asus", "Dmaj7", "F#m7", "Gmaj7", "A6", "Dmaj9"]
ROOTS = [38, 38, 35, 31, 33, 38, 35, 31, 28, 33, 38, 30, 31, 33, 38]


def music() -> np.ndarray:
    total = int(DURATION * SR)
    pad = np.zeros((total + SR * 4, 2))
    keys = np.zeros_like(pad)
    low = np.zeros_like(pad)
    perc = np.zeros_like(pad)

    for b, name in enumerate(PROGRESSION):
        start = b * BAR
        last = b == len(PROGRESSION) - 1
        length = BAR + (3.5 if last else 1.0)
        bright = 0.55 if b in (8, 9) else (0.75 if b == 0 else 1.0)  # breakdown más oscuro
        gain = 0.55 if b == 0 else (0.8 if b in (8, 9) else 1.0)
        for n in CHORDS[name]:
            if b >= 1 and n < 48:  # el bajo ya cubre el registro grave: evita barro
                n += 12
            place(pad, pad_note(midi(n), length, bright), start, gain / len(CHORDS[name]) * 2.2)

        # bajo en el 1 de cada compás (desde el compás 2)
        if b >= 1:
            place(low, bass(midi(ROOTS[b]), BAR + 0.4), start, 0.9 if b not in (8, 9) else 0.5)
            if b not in (8, 9, 14):
                place(low, bass(midi(ROOTS[b]), BEAT * 1.5), start + 2.5 * BEAT, 0.45)

        # arpegio de campana en corcheas (compases 2-14), una octava arriba
        if 1 <= b <= 13:
            tones = sorted(CHORDS[name])[-4:]
            pattern = [0, 2, 1, 3, 2, 1, 3, 2] if b % 2 else [0, 1, 2, 3, 1, 2, 3, 1]
            for i, p in enumerate(pattern):
                if b in (8, 9) and i % 2:      # breakdown: la mitad de notas
                    continue
                vel = 0.75 if i % 2 else 1.0
                place(keys, bell(midi(tones[p] + 12), 2.2), start + i * BEAT / 2, 0.16 * vel)

        # pulso de "latido" (kick suave) en 1 y 3 + shaker en contratiempos
        if b in (3, 4, 5, 6, 7, 10, 11, 12, 13):
            for beat in (0, 2):
                place(perc, kick(), start + beat * BEAT, 0.55)
        if b in (5, 6, 7, 10, 11, 12, 13):
            for i in range(8):
                if i % 2:
                    place(perc, shaker(), start + i * BEAT / 2, 0.5)

    # melodía final: motivo de campana sobre el logo (compás 15)
    motif = [(0.0, 74), (0.42, 78), (0.83, 81), (1.25, 85), (1.66, 86)]
    for dt, n in motif:
        place(keys, bell(midi(n), 4.0, 2.2), 14 * BAR + dt, 0.2)

    mix = reverb(pad, 3.2, 0.35) * 0.9 + reverb(keys, 2.6, 0.38, 8000) * 1.0 + low * 0.85 + perc * 0.7
    mix = mix[:total]
    # fade in mínimo y fade out en el último segundo y medio (termina en silencio exacto a 50 s)
    t = np.arange(total) / SR
    mix *= np.clip(t / 0.05, 0, 1)[:, None]
    mix *= np.clip((DURATION - t) / 1.6, 0, 1)[:, None] ** 1.5
    return mix


# ---------------------------------------------------------------- efectos

def sfx_whoosh(sec: float = 1.1) -> np.ndarray:
    n = int(sec * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal((n, 2))
    # barrido de filtro: sube hasta el pico (75 %) y cae
    peak = 0.75 * sec
    env = np.where(t < peak, (t / peak) ** 2.5, np.exp(-(t - peak) * 9))
    out = np.zeros_like(noise)
    chunks = 40
    for c in range(chunks):
        a, z = c * n // chunks, (c + 1) * n // chunks
        tc = (a + z) / 2 / SR
        cut = 300 + 5200 * (tc / peak if tc < peak else np.exp(-(tc - peak) * 6))
        out[a:z] = fft_lowpass(noise[a:z], cut, 2)
    pan = np.stack([1 - 0.4 * t / sec, 0.6 + 0.4 * t / sec], 1)
    return out * env[:, None] * pan * 0.5


def sfx_shimmer(sec: float = 2.4) -> np.ndarray:
    """Destello: glissando de notas agudas tipo celesta con reverb."""
    out = np.zeros((int((sec + 2.5) * SR), 2))
    notes = [86, 90, 93, 97, 98, 102, 105]
    for i, n in enumerate(notes):
        s = bell(midi(n), 2.0, 0.9) * 0.6
        pan = 0.5 + 0.4 * np.sin(i * 1.3)
        place(out, np.stack([s * (1 - pan), s * pan], 1) * 1.6, i * 0.07)
    sparkle = fft_bandpass(rng.standard_normal(len(out)), 7000, 16000) * np.exp(-np.arange(len(out)) / SR * 3) * 0.05
    out += sparkle[:, None]
    return reverb(out, 2.2, 0.45, 9000)


def sfx_impact(sec: float = 3.5) -> np.ndarray:
    """Impacto grave cinematográfico + cola metálica."""
    t = t_axis(sec)
    boom = np.sin(2 * np.pi * np.cumsum(32 + 60 * np.exp(-t * 9)) / SR) * np.exp(-t * 1.6)
    hit = fft_lowpass(rng.standard_normal(len(t)), 1800, 2) * np.exp(-t * 22) * 0.8
    metal = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) * a
                for f, d, a in [(587, 1.2, 0.1), (1245, 1.8, 0.07), (2210, 2.6, 0.05), (3140, 3.5, 0.03)])
    s = boom * 0.9 + hit + metal
    return reverb(np.stack([s, s], 1), 3.0, 0.3)


def sfx_tick() -> np.ndarray:
    """Tick metálico suave (cada segmento de oro)."""
    t = t_axis(0.35)
    s = (np.sin(2 * np.pi * 3520 * t) * 0.5 + np.sin(2 * np.pi * 5280 * t) * 0.25) * np.exp(-t * 38)
    s += fft_bandpass(rng.standard_normal(len(t)), 4000, 12000) * np.exp(-t * 160) * 0.4
    return s * 0.6


def sfx_stamp() -> np.ndarray:
    """Golpe de sello sobre metal: thump + clank con parciales inarmónicos."""
    t = t_axis(2.5)
    thump = np.sin(2 * np.pi * np.cumsum(60 + 140 * np.exp(-t * 40)) / SR) * np.exp(-t * 14)
    clank = sum(np.sin(2 * np.pi * f * t + i) * np.exp(-t * d) * a for i, (f, d, a) in enumerate(
        [(932, 5, 0.3), (1711, 6.5, 0.22), (2637, 8, 0.16), (3871, 10, 0.1), (5102, 13, 0.06)]))
    click = fft_bandpass(rng.standard_normal(len(t)), 1500, 9000) * np.exp(-t * 90) * 0.7
    s = thump + clank + click
    return reverb(np.stack([s, s], 1), 1.8, 0.22)


def sfx_chime() -> np.ndarray:
    """Campana del logo: acorde de Re mayor en campanas brillantes."""
    out = np.zeros((int(5.5 * SR), 2))
    for i, n in enumerate([74, 81, 86, 90, 93]):
        s = bell(midi(n), 5.0, 3.0)
        pan = 0.3 + 0.1 * i
        place(out, np.stack([s * (1 - pan), s * pan], 1), i * 0.025, 1.2)
    return reverb(out, 3.5, 0.45, 9000)


def sfx_riser(sec: float = 3.0) -> np.ndarray:
    t = t_axis(sec)
    noise = fft_bandpass(rng.standard_normal(len(t)), 2000, 12000)
    tone = np.sin(2 * np.pi * np.cumsum(300 + 900 * (t / sec) ** 2) / SR) * 0.15
    env = (t / sec) ** 2.2
    s = (noise * 0.4 + tone) * env
    return np.stack([s, s], 1) * 0.6


# ---------------------------------------------------------------- export

def save(name: str, x: np.ndarray, target_peak: float = 0.89) -> None:
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    x = x / (np.abs(x).max() + 1e-9) * target_peak
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    OUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"{name:14s} {len(x) / SR:6.2f} s")


if __name__ == "__main__":
    save("music.wav", music(), 0.84)
    save("whoosh.wav", sfx_whoosh())
    save("shimmer.wav", sfx_shimmer())
    save("impact.wav", sfx_impact())
    save("tick.wav", sfx_tick())
    save("stamp.wav", sfx_stamp())
    save("chime.wav", sfx_chime())
    save("riser.wav", sfx_riser())
