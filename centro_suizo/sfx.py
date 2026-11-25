"""Synthesised SFX bed (whooshes, impact, shimmer, pad) for the Centro Suizo edit."""
import sys, numpy as np, wave
SR = 48000
MAIN_OFF, T_OUTRO, T_END = 1.9, 56.4, 61.0
CUTS = [4.167, 42.067, 47.367, 50.733]
N = int(T_END * SR)
out = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(7)

def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR); sig = sig[: max(0, N - i)]
    if sig.ndim == 1:
        sig = np.stack([sig * (1 - pan) ** 0.5, sig * (1 + pan) ** 0.5], 1) / 1.0
    out[i:i + len(sig)] += sig * gain

def onepole_bp(x, f):            # time-varying resonant bandpass (state variable filter)
    y = np.zeros_like(x); lp = bp = 0.0; q = 0.35
    for n in range(len(x)):
        fc = 2 * np.sin(np.pi * f[n] / SR)
        hp = x[n] - lp - q * bp
        bp += fc * hp; lp += fc * bp; y[n] = bp
    return y

def whoosh(dur, f0, f1, peak=0.6):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    env = np.where(t < peak, (t / peak) ** 2, ((1 - t) / (1 - peak)) ** 1.5)
    f = f0 * (f1 / f0) ** t
    l = onepole_bp(rng.standard_normal(n).astype(np.float32), f)
    r = onepole_bp(rng.standard_normal(n).astype(np.float32), f * 1.05)
    s = np.stack([l, r], 1) * env[:, None]
    return s / (np.abs(s).max() + 1e-9)

def boom(dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 38 + 50 * np.exp(-t * 18)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    click = rng.standard_normal(n) * np.exp(-t * 60) * 0.25
    return (s + click).astype(np.float32)

def shimmer(dur=2.2, base=2400, nparts=14):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros((n, 2), np.float32)
    for k in range(nparts):
        f = base * (1 + 1.6 * rng.random()); st = rng.random() * 0.5
        e = np.clip((t - st) / 0.02, 0, 1) * np.exp(-np.maximum(t - st, 0) * (2.5 + 2 * rng.random()))
        p = rng.random()
        s[:, 0] += np.sin(2 * np.pi * f * t) * e * p; s[:, 1] += np.sin(2 * np.pi * f * t) * e * (1 - p)
    return s / (np.abs(s).max() + 1e-9)

def pad(dur, freqs, att=1.2, rel=1.5):
    n = int(dur * SR); t = np.arange(n) / SR
    env = np.minimum(1, t / att) * np.minimum(1, (dur - t) / rel)
    s = sum(np.sin(2 * np.pi * f * t + i) * (0.6 ** i) for i, f in enumerate(freqs))
    s = s * (1 + 0.15 * np.sin(2 * np.pi * 0.25 * t))
    return (s * env / len(freqs)).astype(np.float32)

# intro
add(shimmer(2.4, 2000), 0.05, 0.10)
add(pad(2.3, [110, 164.8, 220, 329.6], att=0.6, rel=0.6), 0.0, 0.10)
add(whoosh(0.75, 300, 4000, 0.75), 1.25, 0.32)
add(boom(1.0), 1.92, 0.22)
# cut punches
for c in CUTS:
    add(whoosh(0.45, 600, 3500, 0.8), MAIN_OFF + c - 0.32, 0.12)
# outro
add(whoosh(0.9, 3500, 250, 0.35), T_OUTRO - 0.2, 0.30)
add(boom(), T_OUTRO + 0.42, 0.42)
add(pad(T_END - T_OUTRO - 0.1, [110, 164.8, 220, 277.2, 329.6], att=0.8, rel=1.2), T_OUTRO + 0.1, 0.14)
add(shimmer(2.0, 2600), T_OUTRO + 1.85, 0.14)
add(whoosh(0.5, 800, 5000, 0.85), T_OUTRO + 0.75, 0.10)

out = np.clip(out, -1, 1)
w = wave.open(sys.argv[1], "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
