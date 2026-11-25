# Genera musica de fondo + efectos (whoosh, impactos, brillos) sincronizados con timeline.json
import json, wave, sys, numpy as np
SR = 48000
T = json.load(open(sys.argv[1]))
FPS, INTRO = T["fps"], T["intro"]
s2f = lambda s: INTRO + round(s * FPS)
outro0 = s2f(T["outroStart"])
TOTAL = outro0 + sum(T["outroParts"])
N = int(TOTAL / FPS * SR) + SR
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

def midi(m): return 440 * 2 ** ((m - 69) / 12)
def add(buf, sig, at):
    i = int(at * SR); j = min(N, i + len(sig))
    if j > i: buf[i:j] += sig[: j - i]

def lowpass(x, fc):
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    a = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); s = 0.0
    for k in range(len(x)):
        s += a[k] * (x[k] - s); y[k] = s
    return y

music = np.zeros(N); drums = np.zeros(N); sfx = np.zeros(N)
BPM = 104; beat = 60 / BPM; bar = beat * 4
start_m = 22 / FPS            # la musica arranca con el impacto del intro
end_m = TOTAL / FPS - 1.2
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55, 60], [55, 59, 62]]  # Am F C G

# pad
b = 0; t0 = start_m
while t0 < end_m:
    ch = chords[b % 4]; L = int(bar * SR) + SR
    tt = np.arange(L) / SR
    env = np.minimum(1, tt / 0.35) * np.exp(-np.maximum(0, tt - bar) * 4)
    sig = np.zeros(L)
    for m in ch:
        for det in (-0.12, 0.12):
            f = midi(m) * 2 ** (det / 12)
            sig += np.sin(2*np.pi*f*tt) + 0.35*np.sin(2*np.pi*2*f*tt) + 0.12*np.sin(2*np.pi*3*f*tt)
    add(music, 0.035 * sig * env, t0)
    # bajo
    for k in (0, 2.5):
        Lb = int(beat * 1.4 * SR); tb = np.arange(Lb) / SR
        f = midi(ch[0] - 24 if ch[0] > 52 else ch[0] - 12)
        s = np.tanh(2.2*np.sin(2*np.pi*f*tb)) * np.exp(-tb*3) * np.minimum(1, tb/0.01)
        add(music, 0.16 * s, t0 + k*beat)
    # arpegio campana (corcheas)
    notes = ch + [ch[1] + 12, ch[0] + 12, ch[2] + 12, ch[1] + 12, ch[2]]
    for k in range(8):
        f = midi(notes[k % len(notes)] + 12); La = int(0.9*SR); ta = np.arange(La)/SR
        s = (np.sin(2*np.pi*f*ta) + 0.3*np.sin(2*np.pi*f*2.76*ta)*np.exp(-ta*9)) * np.exp(-ta*5)
        add(music, 0.05 * s * (1 if k % 2 == 0 else 0.7), t0 + k*beat/2)
    b += 1; t0 += bar

# bateria (kick suave + hats) desde que empieza la voz
tk = INTRO / FPS
while tk < end_m - 0.5:
    Lk = int(0.35*SR); tt = np.arange(Lk)/SR
    ph = 2*np.pi*np.cumsum(45 + 90*np.exp(-tt*28))/SR
    add(drums, 0.5*np.sin(ph)*np.exp(-tt*9), tk)
    Lh = int(0.06*SR); n = rng.standard_normal(Lh); n = n - lowpass(n, 6000)
    add(drums, 0.06*n*np.exp(-np.arange(Lh)/SR*60), tk + beat/2)
    tk += beat

def whoosh(at, dur=0.55, up=True, amp=0.5):
    L = int(dur*SR); x = rng.standard_normal(L); u = np.linspace(0, 1, L)
    fc = 300 + 7000*(u**2 if up else (1-u)**2)
    env = np.sin(np.pi*u)**1.5
    y = lowpass(x, fc); y = y - lowpass(y, 250)
    add(sfx, amp*y*env, at - dur*0.7)
def impact(at, amp=0.8):
    L = int(1.2*SR); tt = np.arange(L)/SR
    ph = 2*np.pi*np.cumsum(38 + 120*np.exp(-tt*18))/SR
    n = lowpass(rng.standard_normal(L), 1800)*np.exp(-tt*14)
    add(sfx, amp*(np.sin(ph)*np.exp(-tt*4) + 0.5*n), at)
def chime(at, amp=0.22, base=88):
    for k, m in enumerate([base, base+7, base+12, base+16]):
        L = int(1.6*SR); tt = np.arange(L)/SR; f = midi(m)
        s = (np.sin(2*np.pi*f*tt) + 0.4*np.sin(2*np.pi*f*2.01*tt))*np.exp(-tt*3.5)
        add(sfx, amp*s, at + k*0.045)
def riser(at, dur):
    L = int(dur*SR); x = rng.standard_normal(L); u = np.linspace(0, 1, L)
    y = lowpass(x, 200 + 9000*u**2); add(sfx, 0.35*y*u**2, at)

riser(0, 22/FPS); impact(22/FPS, 1.0); chime(24/FPS, 0.25, 84)
whoosh(62/FPS, 0.6, True, 0.45)
for sc in T["scenes"]:
    if sc["start"] > 0: whoosh(s2f(sc["start"])/FPS)
    if "reveal" in sc: chime(s2f(sc["reveal"])/FPS); impact(s2f(sc["reveal"])/FPS, 0.35)
impact(s2f(3.82)/FPS, 0.6); impact(s2f(50.0)/FPS, 0.7); chime(s2f(50.0)/FPS, 0.15, 81)
f = outro0
for i, p in enumerate(T["outroParts"]):
    whoosh(f/FPS, 0.6, True, 0.55); impact(f/FPS + 0.05, 0.6)
    if i == 2: chime(f/FPS + 0.3, 0.3, 84)
    f += p

# reverb simple (IR de ruido decayente) via FFT
ir_len = int(2.0*SR); ir = rng.standard_normal(ir_len)*np.exp(-np.arange(ir_len)/SR*3.2); ir /= np.sqrt((ir**2).sum())
def reverb(x, wet):
    n = 1 << int(np.ceil(np.log2(len(x) + ir_len)))
    y = np.fft.irfft(np.fft.rfft(x, n)*np.fft.rfft(ir, n), n)[:len(x)]
    return x + wet*y
music = reverb(music, 0.5); sfx = reverb(sfx, 0.3)

# ducking: musica baja mientras habla la voz
v0, v1 = INTRO/FPS, s2f(55.8)/FPS
g = np.ones(N); duck = 0.38
r = lambda a, b: np.clip((t_all - a)/(b - a), 0, 1)
g = 1 - (1-duck)*r(v0 - 0.4, v0 + 0.1) + (1-duck)*r(v1, v1 + 0.6)
fade = np.clip((TOTAL/FPS - t_all)/1.5, 0, 1)
mix = (music + drums)*g*0.8*fade + sfx*0.7
mix = np.tanh(mix*1.2)/1.2
mix = mix[: int(TOTAL/FPS*SR)]
mix *= 0.6/np.abs(mix).max()
st = np.stack([mix, mix], 1)
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st*32767).astype(np.int16).tobytes())
print("ok", TOTAL, "frames")
