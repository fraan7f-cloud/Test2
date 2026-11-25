"""Construye la pista de audio final y la línea de tiempo del video.

Entradas:
  assets-src/narracion_original.flac  narración extraída del video original
  assets-src/cierre_voz.wav           frase final ("Si conoces a alguien...")

Salidas:
  public/audio/master.wav             mezcla final (voz + música + efectos)
  src/data/timeline.json              escenas, palabras con tiempos y efectos

Qué hace:
  * agrega una intro de logo antes de la narración
  * elimina el tramo del certificado / "acta de nacimiento"
  * reemplaza el cierre original por la frase nueva
  * estima el tiempo de cada palabra (para subtítulos animados)
  * sintetiza una música elegante y efectos (whoosh, brillos, monedas...)

Uso: python scripts/build_audio.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.ndimage import maximum_filter1d, uniform_filter1d
from scipy.signal import fftconvolve, resample_poly

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
RNG = np.random.default_rng(7)

INTRO = 3.2  # segundos de intro de logo antes de la narración
A_END = 41.84  # corte de la narración original antes del certificado
B_START, B_END = 47.12, 50.55  # "Así, lo que brilla es el anillo, no la cuenta."
GAP_BEFORE_CTA = 0.55
OUTRO_LEN = 4.0

# (inicio, fin, texto) en segundos del audio original. *palabra* = énfasis,
# palabra{hablado_así} = cómo se pronuncia (para estimar la duración).
SEGMENTS_A = [
    (0.12, 2.31, "Así se elige el anillo de compromiso *ideal*,"),
    (2.56, 3.75, "sin pagar de *más*."),
    (4.12, 6.41, "Casi todos se fijan en el *tamaño* del diamante,"),
    (6.72, 8.94, "pero lo que lo hace *brillar* es otra cosa:"),
    (9.37, 10.15, "el *corte*."),
    (10.62, 14.31, "Bien cortado, la *luz* rebota adentro y sale directo a tus *ojos*."),
    (14.52, 16.26, "Mal cortado, se *escapa* por abajo."),
    (16.70, 18.92, "Así que el *dinero*, primero al *corte*."),
    (19.23, 20.58, "En el *color* puedes *ahorrar*:"),
    (20.83, 23.08, "un tono apenas *cálido* casi no se nota,"),
    (23.29, 24.58, "sobre todo en oro *amarillo*."),
    (24.99, 25.77, "En la *pureza*,"),
    (25.88, 26.25, "igual:"),
    (26.56, 30.06, "si a simple vista se ve *limpio*, no pagues por lo que solo ve una *lupa*."),
    (30.43, 31.02, "Y un *truco*:"),
    (31.29, 35.08, "uno de *0,90*{cero_noventa} quilates se ve casi igual que uno de *1*{un} quilate,"),
    (35.32, 36.90, "y cuesta bastante *menos*."),
    (37.34, 37.83, "¿Su *talla*?"),
    (38.20, 41.64, "Toma a *escondidas* un anillo que use en ese dedo y mídelo por *dentro*."),
]
SEGMENTS_B = [
    (47.32, 49.35, "Así, lo que *brilla* es el *anillo*,"),
    (49.56, 50.28, "no la *cuenta*."),
]
CTA_TEXT = (
    "Si conoces a alguien que está pensando en pedir *matrimonio*, "
    "mándale este *video*. ¡*Centro* *Suizo* podría ser parte de su *historia*!"
)


# --------------------------------------------------------------------------
# utilidades de audio
# --------------------------------------------------------------------------

def load_mono(path: Path, sr: int = SR) -> np.ndarray:
    y, file_sr = sf.read(path, dtype="float32", always_2d=True)
    y = y.mean(axis=1)
    if file_sr != sr:
        g = np.gcd(file_sr, sr)
        y = resample_poly(y, sr // g, file_sr // g).astype(np.float32)
    return y


def rms_env(y: np.ndarray, sr: int, hop: float = 0.01) -> np.ndarray:
    h = int(sr * hop)
    n = len(y) // h
    frames = y[: n * h].reshape(n, h)
    return np.sqrt((frames**2).mean(axis=1) + 1e-12)


def speech_bounds(y: np.ndarray, sr: int) -> tuple[float, float]:
    env = 20 * np.log10(rms_env(y, sr))
    on = np.where(env > env.max() - 35)[0]
    return on[0] * 0.01, (on[-1] + 1) * 0.01


def db(x: float) -> float:
    return 10 ** (x / 20)


def place(buf: np.ndarray, clip: np.ndarray, t: float, gain: float = 1.0) -> None:
    """Suma un clip (mono o estéreo) en el buffer estéreo en el tiempo t."""
    i = int(round(t * SR))
    if i >= buf.shape[0]:
        return
    if clip.ndim == 1:
        clip = np.stack([clip, clip], axis=1)
    j = min(buf.shape[0], i + clip.shape[0])
    if i < 0:
        clip = clip[-i:]
        i = 0
    buf[i:j] += clip[: j - i] * gain


def pan(mono: np.ndarray, p: float) -> np.ndarray:
    """p en [-1, 1] (izq -> der), ley de potencia constante."""
    a = (p + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)], axis=1)


def band_noise(n: int, lo: float, hi: float) -> np.ndarray:
    x = RNG.standard_normal(n)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    mask = np.clip((f - lo * 0.8) / (lo * 0.2 + 1), 0, 1) * np.clip((hi * 1.2 - f) / (hi * 0.2 + 1), 0, 1)
    y = np.fft.irfft(X * mask, n)
    return y / (np.abs(y).max() + 1e-9)


def env_exp(n: int, attack: float, decay: float) -> np.ndarray:
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) / decay)


def midi(m: float) -> float:
    return 440.0 * 2 ** ((m - 69) / 12)


# --------------------------------------------------------------------------
# palabras y tiempos
# --------------------------------------------------------------------------

TOKEN_RE = re.compile(r"\S+")


def parse_tokens(text: str) -> list[dict]:
    out = []
    for raw in TOKEN_RE.findall(text):
        spoken = None
        m = re.search(r"\{([^}]*)\}", raw)
        if m:
            spoken = m.group(1).replace("_", " ")
            raw = raw.replace(m.group(0), "")
        emph = "*" in raw
        display = raw.replace("*", "")
        bare = re.sub(r"[¿?¡!.,:;]", "", display)
        spoken = spoken or bare
        syl = max(1, len(re.findall(r"[aeiouáéíóúü]+", spoken.lower())))
        punct = display[-1] if display[-1] in ",.:;?!" else ""
        out.append({"text": display, "emph": emph, "syl": syl, "punct": punct})
    return out


def time_words(tokens: list[dict], t0: float, t1: float, env: np.ndarray, env_t0: float) -> None:
    """Reparte [t0, t1] entre palabras según sílabas; las comas se ajustan a
    la pausa (valle de energía) más cercana."""
    pause_w = {",": 1.3, ":": 1.5, ";": 1.3, ".": 1.6, "?": 1.4, "!": 1.4, "": 0.0}
    weights = [tk["syl"] + 0.15 for tk in tokens]
    pauses = [pause_w[tk["punct"]] if i < len(tokens) - 1 else 0 for i, tk in enumerate(tokens)]
    total = sum(weights) + sum(pauses)
    # anclas en puntuación interna
    anchors = [(0, t0)]
    acc = 0.0
    for i, tk in enumerate(tokens[:-1]):
        acc += weights[i]
        if pauses[i] > 0:
            est = t0 + (t1 - t0) * (acc + pauses[i] / 2) / total
            lo = int((est - 0.3 - env_t0) / 0.01)
            hi = int((est + 0.3 - env_t0) / 0.01)
            lo, hi = max(lo, 0), min(hi, len(env) - 1)
            if hi > lo + 2:
                sm = uniform_filter1d(env[lo:hi], 5)
                k = int(np.argmin(sm))
                dip = env_t0 + (lo + k) * 0.01
                # extensión del valle
                thr = sm[k] * 2.0
                a = k
                while a > 0 and sm[a - 1] < thr:
                    a -= 1
                b = k
                while b < len(sm) - 1 and sm[b + 1] < thr:
                    b += 1
                anchors.append((i + 1, (env_t0 + (lo + a) * 0.01, env_t0 + (lo + b) * 0.01)))
            acc += pauses[i]
    anchors.append((len(tokens), t1))
    # repartir entre anclas
    starts = []
    for (ia, ta), (ib, tb) in zip(anchors[:-1], anchors[1:]):
        s0 = ta[1] if isinstance(ta, tuple) else ta
        s1 = tb[0] if isinstance(tb, tuple) else tb
        w = weights[ia:ib]
        tot = sum(w)
        c = s0
        for k, wk in enumerate(w):
            d = (s1 - s0) * wk / tot
            tokens[ia + k]["start"] = c
            tokens[ia + k]["end"] = c + d
            c += d
        starts.append(s0)


def chunk_words(words: list[dict]) -> None:
    """Agrupa palabras en bloques de subtítulo (máx 3-4 palabras)."""
    cid = 0
    count = 0
    chars = 0
    prev_seg = None
    for w in words:
        if prev_seg is not None and (w["seg"] != prev_seg or count >= 4 or chars + len(w["text"]) > 22):
            cid += 1
            count = 0
            chars = 0
        w["chunk"] = cid
        count += 1
        chars += len(w["text"]) + 1
        prev_seg = w["seg"]
        if w["text"][-1] in ",.:;?!":
            cid += 1
            count = 0
            chars = 0
            prev_seg = None
    # renumerar consecutivo
    remap = {}
    for w in words:
        remap.setdefault(w["chunk"], len(remap))
        w["chunk"] = remap[w["chunk"]]


# --------------------------------------------------------------------------
# síntesis: instrumentos
# --------------------------------------------------------------------------

def piano_note(freq: float, dur: float, vel: float = 1.0, bright: float = 1.0) -> np.ndarray:
    n = int(SR * (dur + 1.2))
    t = np.arange(n) / SR
    y = np.zeros(n)
    B = 0.0004
    for h in range(1, 12):
        fh = freq * h * np.sqrt(1 + B * h * h)
        if fh > 15000:
            break
        amp = (1 / h**1.3) * np.exp(-(h - 1) * 0.25 / bright)
        dec = 1.8 / (1 + 0.55 * h)
        y += amp * np.sin(2 * np.pi * fh * t + RNG.uniform(0, 6.28)) * np.exp(-t / dec)
    att = np.clip(t / 0.004, 0, 1)
    rel = np.clip((dur + 0.25 - t) / 0.25, 0, 1)
    return (y * att * rel * vel * 0.25).astype(np.float32)


def bell(freq: float, dur: float = 2.5, vel: float = 1.0) -> np.ndarray:
    n = int(SR * dur)
    t = np.arange(n) / SR
    idx = 2.2 * np.exp(-t / 0.35)
    y = np.sin(2 * np.pi * freq * t + idx * np.sin(2 * np.pi * freq * 3.5 * t))
    y += 0.35 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t / 0.4)
    return (y * np.exp(-t / 0.9) * np.clip(t / 0.002, 0, 1) * vel * 0.18).astype(np.float32)


def pad_chord(notes: list[int], dur: float, attack: float = 0.5, release: float = 0.9) -> np.ndarray:
    n = int(SR * (dur + release))
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    for m in notes:
        f = midi(m)
        for det, p in ((-7, -0.6), (0, 0.0), (7, 0.6)):
            fd = f * 2 ** (det / 1200)
            v = np.zeros(n)
            for h in range(1, 14):
                if fd * h > 9000:
                    break
                v += (1 / h) * np.exp(-h / 4.5) * np.sin(2 * np.pi * fd * h * t + RNG.uniform(0, 6.28))
            out += pan(v, p * 0.8)
    envl = np.clip(t / attack, 0, 1) * np.clip((dur + release - t) / release, 0, 1)
    lfo = 1 + 0.08 * np.sin(2 * np.pi * 0.35 * t)
    return (out * (envl * lfo)[:, None] * 0.03).astype(np.float32)


def bass_note(freq: float, dur: float) -> np.ndarray:
    n = int(SR * (dur + 0.05))
    t = np.arange(n) / SR
    y = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(4 * np.pi * freq * t) + 0.08 * np.sin(6 * np.pi * freq * t)
    envl = np.clip(t / 0.008, 0, 1) * (0.55 + 0.45 * np.exp(-t / 0.12)) * np.clip((dur + 0.05 - t) / 0.05, 0, 1)
    return (y * envl * 0.32).astype(np.float32)


def kick() -> np.ndarray:
    n = int(SR * 0.45)
    t = np.arange(n) / SR
    f = 46 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t / 0.16)
    y[: int(SR * 0.004)] += RNG.standard_normal(int(SR * 0.004)) * 0.25
    return (y * 0.7).astype(np.float32)


def clap() -> np.ndarray:
    n = int(SR * 0.35)
    t = np.arange(n) / SR
    noise = band_noise(n, 900, 5000)
    envl = np.zeros(n)
    for k, off in enumerate((0.0, 0.011, 0.022)):
        envl += np.where(t >= off, np.exp(-(t - off) / (0.012 if k < 2 else 0.11)), 0)
    return (noise * envl * 0.22).astype(np.float32)


def hat(open_: bool = False) -> np.ndarray:
    n = int(SR * (0.25 if open_ else 0.07))
    noise = band_noise(n, 7000, 15000)
    return (noise * env_exp(n, 0.001, 0.09 if open_ else 0.022) * 0.11).astype(np.float32)


# --------------------------------------------------------------------------
# síntesis: efectos
# --------------------------------------------------------------------------

def whoosh(dur: float = 0.55, lo: float = 250, hi: float = 3200, direction: int = 1) -> np.ndarray:
    n = int(SR * dur)
    x = RNG.standard_normal(n)
    hop = 256
    win = 1024
    out = np.zeros(n + win)
    f = np.fft.rfftfreq(win, 1 / SR)
    w = np.hanning(win)
    for s in range(0, n - win, hop):
        p = s / n
        c = lo * (hi / lo) ** np.sin(np.pi * p)  # sube y baja
        mask = np.exp(-0.5 * (np.log(f + 1) - np.log(c)) ** 2 / 0.35)
        seg = np.fft.irfft(np.fft.rfft(x[s : s + win] * w) * mask, win)
        out[s : s + win] += seg * w
    out = out[:n]
    t = np.arange(n) / n
    amp = np.sin(np.pi * t) ** 1.6
    y = out * amp
    y /= np.abs(y).max() + 1e-9
    p = np.linspace(-0.7, 0.7, n) * direction
    a = (p + 1) * np.pi / 4
    return np.stack([y * np.cos(a), y * np.sin(a)], axis=1).astype(np.float32) * 0.5


def riser(dur: float = 1.6) -> np.ndarray:
    n = int(SR * dur)
    t = np.arange(n) / SR
    x = RNG.standard_normal(n)
    hop, win = 256, 1024
    out = np.zeros(n + win)
    f = np.fft.rfftfreq(win, 1 / SR)
    w = np.hanning(win)
    for s in range(0, n - win, hop):
        c = 300 * (9000 / 300) ** (s / n)
        mask = np.exp(-0.5 * (np.log(f + 1) - np.log(c)) ** 2 / 0.25)
        out[s : s + win] += np.fft.irfft(np.fft.rfft(x[s : s + win] * w) * mask, win) * w
    y = out[:n]
    y /= np.abs(y).max() + 1e-9
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2.5 * t / dur)) / SR) * 0.3
    amp = (t / dur) ** 2.2
    return ((y * 0.8 + tone) * amp * 0.45).astype(np.float32)


def impact() -> np.ndarray:
    n = int(SR * 2.2)
    t = np.arange(n) / SR
    f = 38 + 70 * np.exp(-t * 14)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.55)
    nz = band_noise(n, 80, 2500) * np.exp(-t / 0.12)
    return ((boom * 0.9 + nz * 0.35) * 0.6).astype(np.float32)


def sparkle(base: float = 2637.0, notes: int = 5, spread: float = 0.06) -> np.ndarray:
    n = int(SR * 1.6)
    y = np.zeros(n)
    scale = [0, 4, 7, 12, 16, 19, 24]
    for k in range(notes):
        f = base * 2 ** (scale[k % len(scale)] / 12)
        off = int(SR * k * spread)
        m = n - off
        t = np.arange(m) / SR
        tone = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t / 0.08)
        y[off:] += tone * np.exp(-t / 0.35) * np.clip(t / 0.002, 0, 1) * (0.9 - 0.1 * k)
    glitter = band_noise(n, 6000, 14000) * env_exp(n, 0.02, 0.25) * 0.15
    return ((y * 0.09 + glitter)).astype(np.float32)


def ting(freq: float = 3520.0) -> np.ndarray:
    n = int(SR * 1.2)
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t / 0.1))
    return (y * np.exp(-t / 0.3) * np.clip(t / 0.001, 0, 1) * 0.12).astype(np.float32)


def coin() -> np.ndarray:
    n = int(SR * 0.5)
    t = np.arange(n) / SR
    f0 = RNG.uniform(2600, 4200)
    y = np.zeros(n)
    for r, a in ((1, 1), (1.47, 0.6), (2.09, 0.45), (2.56, 0.3)):
        y += a * np.sin(2 * np.pi * f0 * r * t + RNG.uniform(0, 6))
    return (y * np.exp(-t / 0.09) * 0.07).astype(np.float32)


def pop() -> np.ndarray:
    n = int(SR * 0.12)
    t = np.arange(n) / SR
    f = 260 + 700 * np.exp(-t * 45)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03)
    return (y * 0.28).astype(np.float32)


def notify() -> np.ndarray:
    a = ting(1318.5)
    b = ting(1760.0)
    out = np.zeros(len(a) + int(SR * 0.11))
    out[: len(a)] += a * 1.6
    out[int(SR * 0.11) :] += b * 1.6
    return out.astype(np.float32)


def crumple() -> np.ndarray:
    n = int(SR * 0.5)
    y = np.zeros(n)
    for _ in range(26):
        i = RNG.integers(0, n - 2000)
        m = RNG.integers(150, 900)
        y[i : i + m] += band_noise(m, 1500, 9000) * RNG.uniform(0.2, 1)
    return (y * env_exp(n, 0.01, 0.25) * 0.2).astype(np.float32)


def tick() -> np.ndarray:
    n = int(SR * 0.04)
    return (band_noise(n, 2500, 7000) * env_exp(n, 0.0005, 0.006) * 0.25).astype(np.float32)


def buzz_down() -> np.ndarray:
    n = int(SR * 0.45)
    t = np.arange(n) / SR
    f = 330 * 2 ** (-t * 2.2)
    y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 + np.sin(2 * np.pi * np.cumsum(f) / SR)
    yf = np.fft.irfft(np.fft.rfft(y) * (np.fft.rfftfreq(n, 1 / SR) < 2500), n)
    return (yf * env_exp(n, 0.01, 0.18) * 0.12).astype(np.float32)


# --------------------------------------------------------------------------
# reverb
# --------------------------------------------------------------------------

def reverb(x: np.ndarray, rt60: float = 2.2, wet: float = 0.3) -> np.ndarray:
    n = int(SR * rt60)
    t = np.arange(n) / SR
    out = np.zeros_like(x)
    for ch in range(2):
        ir = RNG.standard_normal(n) * np.exp(-t * 6.9 / rt60)
        # oscurecer la cola
        ir = np.fft.irfft(np.fft.rfft(ir) * np.exp(-np.fft.rfftfreq(n, 1 / SR) / 6000), n)
        ir[: int(SR * 0.02)] = 0
        ir /= np.sqrt((ir**2).sum())
        out[:, ch] = fftconvolve(x[:, ch], ir)[: len(x)]
    return x + out * wet


# --------------------------------------------------------------------------
# principal
# --------------------------------------------------------------------------

def main() -> None:
    narr = load_mono(ROOT / "assets-src" / "narracion_original.flac")
    cta = load_mono(ROOT / "assets-src" / "cierre_voz.wav")

    words: list[dict] = []
    seg_id = 0

    def add_segments(segs, offset, src_env):
        nonlocal seg_id
        for s0, s1, text in segs:
            toks = parse_tokens(text)
            time_words(toks, s0, s1, src_env, 0.0)
            for tk in toks:
                words.append(
                    {
                        "text": tk["text"],
                        "emph": tk["emph"],
                        "start": round(tk["start"] + offset, 3),
                        "end": round(tk["end"] + offset, 3),
                        "seg": seg_id,
                    }
                )
            seg_id += 1

    env_narr = rms_env(narr, SR)
    add_segments(SEGMENTS_A, INTRO, env_narr)
    off_b = INTRO + A_END - B_START
    add_segments(SEGMENTS_B, off_b, env_narr)

    b_speech_end = SEGMENTS_B[-1][1] + off_b
    cta_s0, cta_s1 = speech_bounds(cta, SR)
    cta_offset = b_speech_end + GAP_BEFORE_CTA - cta_s0
    env_cta = rms_env(cta, SR)
    # la frase final: un segmento por oración
    cta_sentences = re.split(r"(?<=[.!?])\s+", CTA_TEXT)
    toks_all = parse_tokens(CTA_TEXT)
    time_words(toks_all, cta_s0, cta_s1, env_cta, 0.0)
    i = 0
    for sent in cta_sentences:
        k = len(TOKEN_RE.findall(sent))
        for tk in toks_all[i : i + k]:
            words.append(
                {
                    "text": tk["text"],
                    "emph": tk["emph"],
                    "start": round(tk["start"] + cta_offset, 3),
                    "end": round(tk["end"] + cta_offset, 3),
                    "seg": seg_id,
                }
            )
        seg_id += 1
        i += k
    chunk_words(words)

    cta_start = cta_offset + cta_s0
    cta_end = cta_offset + cta_s1
    outro_start = cta_end + 0.35
    total = round(outro_start + OUTRO_LEN, 3)
    N = int(total * SR) + SR

    def seg_start(i: int) -> float:
        return next(w["start"] for w in words if w["seg"] == i)

    def find(word: str, occurrence: int = 1) -> dict:
        k = 0
        for w in words:
            if re.sub(r"^[¿¡]+|[?!.,:;]+$", "", w["text"]).lower() == word.lower():
                k += 1
                if k == occurrence:
                    return w
        raise KeyError(word)

    nA = len(SEGMENTS_A)
    lead = 0.25
    scene_starts = [
        ("intro", 0.0),
        ("estuche", INTRO),
        ("tamano", seg_start(2) - lead),
        ("luz", seg_start(5) - lead),
        ("dinero", seg_start(7) - lead),
        ("color", seg_start(8) - lead),
        ("pureza", seg_start(11) - lead),
        ("truco", seg_start(14) - lead),
        ("talla", seg_start(17) - lead),
        ("brilla", seg_start(nA) - lead),
        ("cta", cta_start - lead),
        ("historia", find("Centro")["start"] - 0.2),
        ("outro", outro_start),
    ]
    scenes = []
    for k, (sid, st) in enumerate(scene_starts):
        en = scene_starts[k + 1][1] if k + 1 < len(scene_starts) else total
        scenes.append({"id": sid, "start": round(st, 3), "end": round(en, 3)})

    # ---------------- voz ----------------
    voice = np.zeros((N, 2), np.float32)
    place(voice, narr[: int(A_END * SR)], INTRO)
    b = narr[int(B_START * SR) : int(B_END * SR)].copy()
    fade = int(0.02 * SR)
    b[:fade] *= np.linspace(0, 1, fade)
    b[-fade:] *= np.linspace(1, 0, fade)
    a_end_fade = int(INTRO * SR + A_END * SR)
    voice[a_end_fade - fade : a_end_fade] *= np.linspace(1, 0, fade)[:, None]
    place(voice, b, INTRO + A_END)
    # igualar volumen de la frase final con la narración
    def speech_rms(y):
        e = rms_env(y, SR)
        return np.sqrt(np.mean(e[e > e.max() * 0.1] ** 2))

    cta_gain = speech_rms(narr) / speech_rms(cta)
    place(voice, cta * cta_gain, cta_offset)
    # normalizar voz a ~ -17 dBFS rms en tramos hablados
    vr = speech_rms(voice.mean(axis=1))
    voice *= db(-17) / vr

    # máscara de habla para duck de la música
    speech = np.zeros(N, np.float32)
    for w in words:
        speech[int(w["start"] * SR) : int(w["end"] * SR)] = 1
    hop = 480
    sp = speech[: N // hop * hop].reshape(-1, hop).max(axis=1)
    sp = maximum_filter1d(sp, 25)  # mantener ~250 ms
    sp = uniform_filter1d(sp, 20)
    duck = np.repeat(1 - 0.5 * sp, hop)
    duck = np.pad(duck, (0, N - len(duck)), constant_values=1)

    # ---------------- música ----------------
    bpm = 120
    beat = 60 / bpm
    bar = beat * 4
    chords = [
        ([53, 57, 60, 64], 41),  # Fmaj7
        ([55, 59, 62, 64], 43),  # G6
        ([52, 55, 59, 62], 40),  # Em7
        ([57, 60, 64, 67], 45),  # Am7
    ]
    music = np.zeros((N, 2), np.float32)
    drums = np.zeros((N, 2), np.float32)
    groove_start = INTRO
    groove_end = cta_start - 0.3  # break emocional en la frase final

    # intro: colchón + campanas
    music_intro = pad_chord([57, 60, 64, 71], INTRO, attack=1.0, release=1.2)
    place(music, music_intro, 0.0, 0.9)
    for k, m in enumerate([76, 79, 83, 88]):
        place(music, pan(bell(midi(m)), -0.4 + 0.27 * k), 1.62 + k * 0.09, 0.8)

    t = groove_start
    bar_i = 0
    while t < outro_start - 0.01:
        notes, root = chords[bar_i % 4]
        dur = min(bar, outro_start - t)
        place(music, pad_chord(notes, dur, attack=0.25, release=0.6), t, 0.85)
        # arpegio
        arp = [n + 12 for n in notes]
        pattern = [0, 1, 2, 3, 2, 1, 3, 2]
        for s in range(8):
            ts = t + s * beat / 2
            if ts >= outro_start:
                break
            m = arp[pattern[s]] + (12 if s == 6 else 0)
            vel = 0.75 if s % 2 == 0 else 0.55
            place(music, pan(piano_note(midi(m), beat * 0.45, vel), -0.35 if s % 2 else 0.35), ts, 1.0)
        if bar_i % 2 == 0:
            place(music, pan(bell(midi(notes[-1] + 24)), 0.3), t, 0.45)
        # bajo + batería solo durante el groove
        if t < groove_end:
            for s in range(8):
                ts = t + s * beat / 2
                if ts >= groove_end:
                    break
                if s in (0, 3, 4, 6, 7):
                    place(music, bass_note(midi(root), beat * 0.42), ts, 0.85)
            for bt in range(4):
                tb = t + bt * beat
                if tb >= groove_end:
                    break
                place(drums, kick(), tb, 0.55)
                if bt in (1, 3):
                    place(drums, pan(clap(), 0.05), tb, 0.55)
                place(drums, pan(hat(open_=(bt == 3)), 0.25), tb + beat / 2, 0.8)
                place(drums, pan(hat(), -0.2), tb + beat / 4 * 3, 0.35)
        t += bar
        bar_i += 1

    # final: acorde de resolución (C add9) + campanas
    final_notes = [48, 55, 60, 64, 67, 74]
    place(music, pad_chord(final_notes, OUTRO_LEN - 0.6, attack=0.05, release=1.6), outro_start, 1.3)
    for k, m in enumerate([60, 64, 67, 72, 76, 79, 84]):
        place(music, pan(piano_note(midi(m), 2.5, 0.8), -0.5 + k * 0.16), outro_start + k * 0.045, 1.0)
    place(music, pan(bell(midi(84)), 0.2), outro_start + 0.05, 0.9)
    place(music, bass_note(midi(36), 2.5), outro_start, 1.0)

    music = reverb(music, rt60=2.4, wet=0.35)
    drums = reverb(drums, rt60=1.2, wet=0.12)
    bed = music + drums
    # nivel de la música: más presente en intro/outro, bajo la voz durante la narración
    t_axis = np.arange(N) / SR
    lvl = np.interp(
        t_axis,
        [0, INTRO - 0.2, INTRO + 0.4, outro_start - 0.3, outro_start + 0.1, total - 1.6, total],
        [db(-1), db(-1), db(-6.5), db(-6.5), db(-1), db(-1), 0.0],
    )
    bed *= (lvl * duck)[:, None]
    bed_rms = np.sqrt(np.mean(bed[int(INTRO * SR) : int(outro_start * SR)] ** 2))
    bed *= db(-31) / (bed_rms + 1e-9)

    # ---------------- efectos ----------------
    sfx = np.zeros((N, 2), np.float32)
    cues: list[dict] = []

    def cue(kind: str, at: float, gain: float = 1.0, **kw):
        cues.append({"kind": kind, "t": round(at, 3)})
        gen = {
            "whoosh": lambda: whoosh(**kw),
            "riser": lambda: riser(**kw),
            "impact": impact,
            "sparkle": lambda: sparkle(**kw),
            "ting": lambda: ting(**kw),
            "coin": coin,
            "pop": pop,
            "notify": notify,
            "crumple": crumple,
            "tick": tick,
            "buzz": buzz_down,
        }[kind]()
        place(sfx, gen, at, gain)

    # intro
    cue("riser", 0.05, 0.9, dur=1.55)
    cue("impact", 1.6, 0.9)
    cue("sparkle", 1.62, 1.2, base=2093.0, notes=6)
    cue("whoosh", INTRO - 0.42, 0.6, dur=0.5, lo=400, hi=4000)
    # transiciones entre escenas
    for k, sc in enumerate(scenes[2:], start=2):
        cue("whoosh", sc["start"] - 0.22, 0.75, dur=0.48, direction=1 if k % 2 else -1)
    # momentos clave
    cue("sparkle", find("ideal")["start"] - 0.05, 0.8)
    cue("pop", find("más")["start"], 0.8)
    cue("ting", find("tamaño")["start"], 0.8, freq=2349.0)
    cue("buzz", find("brillar")["start"] + 0.1, 0.5)
    cue("impact", find("corte")["start"] - 0.05, 0.45)
    cue("sparkle", find("corte")["start"], 1.2, base=3136.0, notes=6)
    cue("ting", find("luz")["start"], 0.9, freq=2637.0)
    cue("sparkle", find("ojos")["start"], 1.0, base=2637.0, notes=4)
    cue("buzz", find("escapa")["start"], 0.8)
    for k in range(14):
        cue("coin", find("dinero")["start"] + 0.08 * k + RNG.uniform(0, 0.05), 0.9)
    for k in range(6):
        cue("coin", find("corte", 2)["start"] + 0.07 * k, 1.0)
    cue("pop", find("color")["start"], 0.8)
    cue("coin", find("ahorrar")["start"], 1.3)
    cue("pop", find("cálido")["start"], 0.7)
    cue("sparkle", find("amarillo")["start"], 0.9, base=2349.0, notes=5)
    cue("ting", find("pureza")["start"], 0.8, freq=3136.0)
    cue("sparkle", find("limpio")["start"], 0.8)
    cue("whoosh", find("lupa")["start"] - 0.25, 0.5, dur=0.4, lo=600, hi=5000)
    cue("sparkle", find("truco")["start"] - 0.05, 1.1, base=2093.0, notes=4)
    cue("pop", find("0,90")["start"], 0.8)
    cue("pop", find("1")["start"], 0.8)
    cue("coin", find("menos")["start"], 1.3)
    cue("pop", find("talla")["start"], 0.9)
    for k in range(10):
        cue("tick", find("dentro")["start"] - 0.35 + k * 0.06, 0.9)
    cue("ting", find("dentro")["end"] + 0.05, 1.0, freq=2637.0)
    cue("sparkle", find("brilla")["start"], 1.2, base=2637.0, notes=6)
    cue("crumple", find("cuenta")["start"] - 0.05, 1.0)
    cue("pop", find("alguien")["start"], 0.8)
    cue("sparkle", find("matrimonio")["start"], 0.8, base=2349.0, notes=4)
    cue("whoosh", find("video")["start"] - 0.1, 0.7, dur=0.45, lo=500, hi=6000)
    cue("notify", find("video")["end"], 1.0)
    cue("impact", find("Centro")["start"] - 0.05, 0.6)
    cue("sparkle", find("Centro")["start"], 1.2, base=2093.0, notes=7)
    cue("sparkle", find("historia")["start"], 0.9, base=3136.0, notes=5)
    cue("impact", outro_start, 0.7)
    cue("sparkle", outro_start + 0.05, 1.0, base=2637.0, notes=7)
    sfx = reverb(sfx, rt60=1.4, wet=0.18)
    sfx *= db(-3.5)

    # ---------------- mezcla y limitador ----------------
    mix = voice + bed + sfx
    mix[int(total * SR) :] = 0
    mix = mix[: int(total * SR)]
    fade_out = int(0.6 * SR)
    mix[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None] ** 2
    peak = np.abs(mix).max(axis=1)
    ceiling = db(-1.0)
    g = np.minimum(1.0, ceiling / (peak + 1e-9))
    look = int(0.005 * SR)
    g = -maximum_filter1d(-g, look * 2 + 1)
    g = uniform_filter1d(g, look)
    mix = mix * g[:, None]
    mix = np.clip(mix, -ceiling, ceiling)
    out_audio = ROOT / "public" / "audio" / "master.wav"
    sf.write(out_audio, mix.astype(np.float32), SR, subtype="PCM_16")

    timeline = {
        "fps": 30,
        "total": total,
        "intro": INTRO,
        "ctaStart": round(cta_start, 3),
        "ctaEnd": round(cta_end, 3),
        "outroStart": round(outro_start, 3),
        "scenes": scenes,
        "sfx": cues,
        "words": words,
    }
    (ROOT / "src" / "data" / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))
    print(f"total {total:.2f}s  cta {cta_start:.2f}-{cta_end:.2f}  outro {outro_start:.2f}")
    for sc in scenes:
        print(f"  {sc['id']:9s} {sc['start']:6.2f} -> {sc['end']:6.2f}")
    print("words:", len(words), " chunks:", words[-1]["chunk"] + 1, " sfx:", len(cues))
    print("peak dB", round(20 * np.log10(np.abs(mix).max()), 2))


if __name__ == "__main__":
    main()
