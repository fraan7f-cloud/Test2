"""Centro Suizo – re-edit renderer.

Takes the original vertical explainer (voice + animation), replaces the blue
background with a black / red flowing-glow look, adds an animated intro, spring
"bounce" punches with real motion blur at the hard cuts, a header logo, bloom,
and a logo reveal as the closing shot.  Frames are piped to ffmpeg.

usage: python3 render.py SRC_VIDEO LOGO_PNG OUT_SILENT_MP4 [--preview N]
"""
import sys, math, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

SRC, LOGO, OUT = sys.argv[1:4]
PREVIEW = None
if "--preview" in sys.argv:
    PREVIEW = [float(x) for x in sys.argv[sys.argv.index("--preview") + 1].split(",")]

W, H, FPS = 1080, 1920, 30
SW, SH = 720, 1280
MAIN_OFF = 1.9                    # output time where source t=0 lands (voice start)
SRC_END = 54.95                   # source trimmed here (voice ends ~54.6)
T_OUTRO = MAIN_OFF + SRC_END - 0.45
T_END = T_OUTRO + 4.6
CUTS = [4.167, 42.067, 47.367, 50.733]   # hard cuts in source (scene detect)
N_FRAMES = int(round(T_END * FPS))


# ---------------------------------------------------------------- helpers
def ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def clamp01(x):
    return max(0.0, min(1.0, x))


def spring(t, zeta=0.42, w=17.0):
    """0 -> 1 with a damped overshoot (the 'bounce')."""
    if t <= 0:
        return 0.0
    wd = w * math.sqrt(1 - zeta * zeta)
    return 1 - math.exp(-zeta * w * t) * (math.cos(wd * t) + zeta * w / wd * math.sin(wd * t))


def ease_out(t):
    t = clamp01(t); return 1 - (1 - t) ** 3


def ease_in(t):
    t = clamp01(t); return t ** 3


def ease_io(t):
    t = clamp01(t); return t * t * (3 - 2 * t)


def over(dst, rgba, x, y, alpha=1.0, add=False):
    """composite float rgba (h,w,4) onto float rgb dst at top-left x,y (clipped)."""
    h, w = rgba.shape[:2]
    x0, y0 = max(int(x), 0), max(int(y), 0)
    x1, y1 = min(int(x) + w, dst.shape[1]), min(int(y) + h, dst.shape[0])
    if x1 <= x0 or y1 <= y0 or alpha <= 0:
        return
    src = rgba[y0 - int(y):y1 - int(y), x0 - int(x):x1 - int(x)]
    a = src[..., 3:4] * alpha
    if add:
        dst[y0:y1, x0:x1] += src[..., :3] * a
    else:
        dst[y0:y1, x0:x1] = dst[y0:y1, x0:x1] * (1 - a) + src[..., :3] * a


def place(dst, rgba, cx, cy, scale=1.0, alpha=1.0, add=False):
    if scale <= 0.01 or alpha <= 0.002:
        return
    h, w = rgba.shape[:2]
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    img = cv2.resize(rgba, (nw, nh), interpolation=cv2.INTER_LINEAR if scale > 0.6 else cv2.INTER_AREA)
    over(dst, img, cx - nw / 2, cy - nh / 2, alpha, add)


def glowify(rgba, color, sigmas=(6, 18, 45), gains=(0.9, 0.6, 0.45), pad=120):
    """returns padded rgba with additive glow baked as separate layer (rgb premult)."""
    h, w = rgba.shape[:2]
    a = np.zeros((h + 2 * pad, w + 2 * pad), np.float32)
    a[pad:pad + h, pad:pad + w] = rgba[..., 3]
    g = np.zeros_like(a)
    for s, k in zip(sigmas, gains):
        g += cv2.GaussianBlur(a, (0, 0), s) * k
    out = np.zeros((h + 2 * pad, w + 2 * pad, 4), np.float32)
    out[..., :3] = np.array(color, np.float32)[None, None, :]
    out[..., 3] = np.clip(g, 0, 1.5)
    return out


# ---------------------------------------------------------------- background
_by, _bx = np.mgrid[0:160, 0:90].astype(np.float32)
_bx /= 90; _by /= 160


def mkbg(t, w, h, inten=1.0):
    wave = 0.86 + 0.05 * np.sin(_bx * 5.0 + t * 0.9) + 0.04 * np.sin(_bx * 9.0 - t * 1.3 + 1.0)
    d = _by - wave
    glow = ss(-0.25, 0.10, d)
    core = np.exp(-((d - 0.02) / 0.06) ** 2)
    r = 0.42 * glow + 0.5 * core
    g = 0.03 * glow + 0.12 * core
    b = 0.03 * glow + 0.06 * core
    top = np.exp(-(((_bx - 0.5) / 0.6) ** 2 + ((_by + 0.05) / 0.25) ** 2)) * 0.16
    r = r + top; g = g + top * 0.08; b = b + top * 0.06
    img = np.dstack([b, g, r]) * inten
    return np.clip(cv2.resize(img, (w, h), interpolation=cv2.INTER_CUBIC), 0, 1)


# ---------------------------------------------------------------- source bg keying
def key_source(fr_u8, t):
    hsv = cv2.cvtColor(fr_u8, cv2.COLOR_BGR2HSV).astype(np.float32)
    Hh, Sa, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    mh = ss(100, 112, Hh) * (1 - ss(158, 163, Hh))
    mh = np.maximum(mh, ss(150, 155, Hh) * (1 - ss(166, 171, Hh)) * (1 - ss(172, 188, Sa)))
    m = mh * ss(28, 70, Sa) * (1 - ss(150, 200, V))
    # keep only big / border-touching regions -> protects blue diamond facets
    small = cv2.resize((m > 0.5).astype(np.uint8), (SW // 2, SH // 2), interpolation=cv2.INTER_NEAREST)
    n, lab, st, _ = cv2.connectedComponentsWithStats(small, connectivity=4)
    keep = np.zeros(n, np.uint8)
    area_min = 0.006 * small.size
    for i in range(1, n):
        x, y, w_, h_, a = st[i]
        if a > area_min or x == 0 or y == 0 or x + w_ >= small.shape[1] or y + h_ >= small.shape[0]:
            keep[i] = 1
    km = cv2.resize(keep[lab].astype(np.float32), (SW, SH), interpolation=cv2.INTER_LINEAR)
    km = cv2.GaussianBlur(cv2.dilate(km, np.ones((5, 5), np.uint8)), (0, 0), 2)
    m = cv2.GaussianBlur(m, (0, 0), 1.2) * np.clip(km, 0, 1)
    m = m[..., None]
    im = fr_u8.astype(np.float32) / 255
    gray = im.mean(2, keepdims=True)
    fg = gray + (im - gray) * (1 - np.clip(m * 2, 0, 1))   # spill suppression on edges
    out = fg * (1 - m) + mkbg(t, SW, SH) * m
    return cv2.resize(out, (W, H), interpolation=cv2.INTER_LANCZOS4)


# ---------------------------------------------------------------- logo pieces
lg = np.array(Image.open(LOGO).convert("RGBA")).astype(np.float32) / 255
la = lg[..., 3]
n, lab = cv2.connectedComponents((la > 0.02).astype(np.uint8), connectivity=8)
parts = {"diamond": [], "centro": [], "suizo": []}
for i in range(1, n):
    ys, xs = np.nonzero(lab == i)
    if len(ys) < 15:
        continue
    cy = ys.mean()
    key = "diamond" if (cy < 200 and 220 < xs.mean() < 460) else ("centro" if cy < 300 else "suizo")
    parts[key].append((xs.min(), i))
WARM = (0.90, 0.95, 1.0)  # BGR warm white


def piece(ids):
    m = np.isin(lab, ids)
    ys, xs = np.nonzero(m)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgba = np.zeros((y1 - y0, x1 - x0, 4), np.float32)
    rgba[..., :3] = WARM
    rgba[..., 3] = la[y0:y1, x0:x1] * m[y0:y1, x0:x1]
    return rgba, ((x0 + x1) / 2, (y0 + y1) / 2)


LOGO_PIECES = []   # (name, rgba, center_in_logo_px, order)
LOGO_PIECES.append(("diamond",) + piece([i for _, i in parts["diamond"]]) + (0,))
for k, (_, i) in enumerate(sorted(parts["centro"])):
    LOGO_PIECES.append(("centro",) + piece([i]) + (k,))
for k, (_, i) in enumerate(sorted(parts["suizo"])):
    LOGO_PIECES.append(("suizo",) + piece([i]) + (k,))
LOGO_CX, LOGO_CY = lg.shape[1] / 2, lg.shape[0] / 2

full_logo = lg.copy(); full_logo[..., :3] = WARM
LOGO_GLOW = glowify(full_logo, (0.15, 0.35, 1.0))
HEADER = cv2.resize(full_logo, (int(676 * 0.27), int(434 * 0.27)), interpolation=cv2.INTER_AREA)
HEADER_GLOW = glowify(HEADER, (0.12, 0.3, 1.0), sigmas=(4, 12), gains=(0.6, 0.4), pad=40)


def text_rgba(txt, size, font="/usr/share/fonts/opentype/inter/Inter-Medium.otf", track=0.0, color=(1, 1, 1)):
    f = ImageFont.truetype(font, size)
    ws = [f.getlength(c) for c in txt]
    tw = int(sum(ws) + track * size * (len(txt) - 1)) + 20
    im = Image.new("L", (tw, int(size * 1.4)), 0)
    d = ImageDraw.Draw(im); x = 10
    for c, w_ in zip(txt, ws):
        d.text((x, int(size * 0.15)), c, font=f, fill=255); x += w_ + track * size
    a = np.array(im).astype(np.float32) / 255
    out = np.zeros(a.shape + (4,), np.float32); out[..., :3] = color; out[..., 3] = a
    return out


SUB = text_rgba("CÓMO ELEGIR EL ANILLO IDEAL", 40, track=0.28, color=(0.55, 0.80, 0.98))
SUB_OUT = text_rgba("JOYERÍA", 34, track=0.6, color=(0.55, 0.80, 0.98))


# ---------------------------------------------------------------- light streaks (v1 style)
def light_arc(canvas, cx, cy, rx, ry, a0, a1, inten, rot=0.0, thick=7):
    if inten <= 0.003 or abs(a1 - a0) < 0.5:
        return
    s = 2
    L = np.zeros((H // s, W // s), np.float32)
    cv2.ellipse(L, (int(cx / s), int(cy / s)), (int(rx / s), int(ry / s)), rot, a0, a1, 1.0,
                thickness=max(1, thick // s), lineType=cv2.LINE_AA)
    core = cv2.GaussianBlur(L, (0, 0), 1.0)
    g1 = cv2.GaussianBlur(L, (0, 0), 6)
    g2 = cv2.GaussianBlur(L, (0, 0), 22)
    col = (core[..., None] * np.array([0.75, 0.9, 1.0]) * 1.2 +
           g1[..., None] * np.array([0.10, 0.35, 1.0]) * 2.2 +
           g2[..., None] * np.array([0.02, 0.06, 1.0]) * 3.0)
    canvas += cv2.resize(col.astype(np.float32), (W, H), interpolation=cv2.INTER_LINEAR) * inten


# ---------------------------------------------------------------- post
_yy, _xx = np.mgrid[0:H, 0:W].astype(np.float32)
VIGN = (1 - 0.45 * ss(0.35, 1.15, np.sqrt(((_xx - W / 2) / (W * 0.62)) ** 2 + ((_yy - H / 2) / (H * 0.62)) ** 2)))[..., None]


def post(img):
    small = cv2.resize(img, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
    br = np.clip(small - 0.84, 0, None) * 1.6
    bl = cv2.GaussianBlur(br, (0, 0), 4) * 0.9 + cv2.GaussianBlur(br, (0, 0), 14) * 0.9
    bl *= np.array([0.75, 0.88, 1.0], np.float32)
    img = img + cv2.resize(bl, (W, H), interpolation=cv2.INTER_LINEAR)
    img = img * VIGN
    # gentle filmic shoulder
    img = img / (1 + 0.12 * img)
    img *= 1.08
    return np.clip(img, 0, 1)


def warp_scale(img, s, cx=W / 2, cy=H / 2, dy=0.0):
    if abs(s - 1) < 1e-4 and abs(dy) < 0.05:
        return img
    M = np.float32([[s, 0, cx - s * cx], [0, s, cy - s * cy + dy]])
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)


# ---------------------------------------------------------------- scene composition
def main_transform(t):
    """returns (scale, alpha, dy) for the main content layer at output time t."""
    ts = t - MAIN_OFF
    s, a, dy = 1.0, 1.0, 0.0
    # entrance from intro: grows from 0.86 with bounce
    if t < MAIN_OFF + 1.2:
        p = spring(t - MAIN_OFF + 0.05, zeta=0.5, w=13)
        s = 0.86 + 0.14 * p
        a = clamp01((t - MAIN_OFF + 0.05) / 0.18)
    # punch at hard cuts
    for c in CUTS:
        if 0 <= ts - c < 1.0:
            s *= 1.0 + 0.055 * (1 - spring(ts - c, zeta=0.38, w=19))
    # exit into outro
    if t > T_OUTRO:
        p = ease_in((t - T_OUTRO) / 0.5)
        s *= 1 - 0.12 * p
        a *= 1 - p
        dy = -40 * p
    return s, a, dy


def compose(t, main_img):
    canvas = mkbg(t, W, H, inten=clamp01(t / 1.2) if t < T_OUTRO else 1.0)

    # ------------- main
    if main_img is not None and MAIN_OFF - 0.06 <= t <= T_OUTRO + 0.55:
        s, a, dy = main_transform(t)
        if a > 0.002:
            m = warp_scale(main_img, s, dy=dy)
            canvas = canvas * (1 - a) + m * a

    # ------------- header logo
    if MAIN_OFF + 0.5 < t < T_OUTRO + 0.4:
        p = spring(t - MAIN_OFF - 0.5, zeta=0.45, w=15)
        ex = ease_in((t - T_OUTRO) / 0.35) if t > T_OUTRO else 0
        y = 118 - 60 * (1 - p) - 30 * ex
        al = clamp01((t - MAIN_OFF - 0.5) / 0.2) * (1 - ex) * 0.92
        place(canvas, HEADER_GLOW, W / 2, y, 1.0, al * 0.55, add=True)
        place(canvas, HEADER, W / 2, y, 1.0, al)

    # ------------- intro
    if t < MAIN_OFF + 0.35:
        ex = ease_in((t - (MAIN_OFF - 0.5)) / 0.55)       # exit progress
        zs = 1 + 1.4 * ex                                  # zoom-through
        ia = 1 - ex
        cx, cy = W / 2, 900
        # rotating light ring
        rp = ease_out(t / 1.3)
        sweep = 300 * ease_out(t / 0.9) * (1 - 0.65 * ease_io((t - 0.9) / 0.8))
        start = -120 + 400 * rp
        light_arc(canvas, cx, cy, 470 * zs, 470 * zs, start, start + sweep, ia * (0.25 + 0.75 * clamp01(t / 0.25)))
        light_arc(canvas, cx, cy, 520 * zs, 505 * zs, start + 180, start + 180 + sweep * 0.45,
                  ia * 0.55 * clamp01((t - 0.15) / 0.3), rot=8, thick=4)
        # logo pieces
        lsc = 0.9 * zs
        _draw_logo(canvas, t, t0=0.25, cx=cx, cy=cy, scale=lsc, alpha=ia, glow=0.6 * ia)
        # subtitle
        ps = spring(t - 1.05, zeta=0.6, w=14)
        place(canvas, SUB, cx, cy + 560 * zs + 40 * (1 - ps), zs, ia * clamp01((t - 1.05) / 0.25))

    # ------------- outro
    if t > T_OUTRO + 0.15:
        to = t - T_OUTRO
        cx, cy = W / 2, 900
        # streak sweep in (two arcs converging)
        rp = ease_out((to - 0.1) / 1.4)
        sweep = 260 * ease_out((to - 0.1) / 0.6) * (1 - 0.75 * ease_io((to - 1.0) / 0.9))
        st = 60 + 330 * rp
        inten = clamp01((to - 0.15) / 0.2) * (1 - 0.6 * ease_io((to - 1.4) / 1.0))
        light_arc(canvas, cx, cy, 480, 480, st, st + sweep, inten)
        light_arc(canvas, cx, cy, 535, 515, st + 180, st + 180 + sweep * 0.6, inten * 0.6, rot=-10, thick=4)
        # steady halo once settled
        halo = 0.35 * ease_io((to - 1.2) / 1.0)
        if halo > 0:
            light_arc(canvas, cx, cy, 480, 480, 0, 360, halo * (0.85 + 0.15 * math.sin(to * 2.2)), thick=3)
        _draw_logo(canvas, to, t0=0.35, cx=cx, cy=cy, scale=1.0, alpha=1.0, glow=0.75, glint=True)
        ps = spring(to - 1.35, zeta=0.6, w=14)
        place(canvas, SUB_OUT, cx, cy + 570 + 30 * (1 - ps), 1.0, clamp01((to - 1.35) / 0.3) * 0.9)
        # final fade
        canvas *= 1 - ease_in((t - (T_END - 0.45)) / 0.45)

    return canvas


def _draw_logo(canvas, t, t0, cx, cy, scale, alpha, glow, glint=False):
    if t < t0 or alpha <= 0.002:
        return
    tl = t - t0
    # glow behind whole logo (builds up as pieces land)
    gl = glow * ease_io(tl / 1.2)
    if gl > 0:
        place(canvas, LOGO_GLOW, cx, cy, scale, gl * alpha * 0.8, add=True)
    for name, rgba, (px, py), k in LOGO_PIECES:
        if name == "diamond":
            d = 0.0
            p = spring(tl - d, zeta=0.38, w=16)
            sc = scale * (0.2 + 0.8 * p)
            dx, dy = 0, 0
        elif name == "centro":
            d = 0.28 + 0.055 * k
            p = spring(tl - d, zeta=0.45, w=17)
            sc = scale; dx, dy = 0, 90 * (1 - p) * scale
        else:
            d = 0.62 + 0.045 * k
            p = spring(tl - d, zeta=0.5, w=17)
            sc = scale; dx, dy = 0, 70 * (1 - p) * scale
        a = alpha * clamp01((tl - d) / 0.12)
        if a <= 0:
            continue
        x = cx + (px - LOGO_CX) * scale + dx
        y = cy + (py - LOGO_CY) * scale + dy
        place(canvas, rgba, x, y, sc, a)
    if glint:
        g = (tl - 1.55) / 0.7
        if 0 < g < 1:
            # diagonal shine band clipped by logo alpha
            nw, nh = int(lg.shape[1] * scale), int(lg.shape[0] * scale)
            A = cv2.resize(la, (nw, nh), interpolation=cv2.INTER_LINEAR)
            yy, xx = np.mgrid[0:nh, 0:nw].astype(np.float32)
            pos = (-0.3 + 1.6 * ease_io(g)) * (nw + nh)
            band = np.exp(-(((xx + yy * 0.6) - pos) / 45) ** 2)
            sh = np.zeros((nh, nw, 4), np.float32); sh[..., :3] = (0.8, 0.95, 1.0); sh[..., 3] = A * band
            over(canvas, sh, cx - nw / 2, cy - nh / 2, 0.9, add=True)
        # star sparkle on the diamond's top
        sp = (tl - 1.9) / 0.6
        if 0 < sp < 1:
            amp = math.sin(math.pi * sp)
            sx = cx + 75 * scale; sy = cy - LOGO_CY * scale + 30 * scale
            star = np.zeros((H // 2, W // 2), np.float32)
            L = 120 * amp
            cv2.line(star, (int(sx / 2 - L), int(sy / 2)), (int(sx / 2 + L), int(sy / 2)), 1, 1, cv2.LINE_AA)
            cv2.line(star, (int(sx / 2), int(sy / 2 - L * 0.7)), (int(sx / 2), int(sy / 2 + L * 0.7)), 1, 1, cv2.LINE_AA)
            cv2.circle(star, (int(sx / 2), int(sy / 2)), 3, 1, -1, cv2.LINE_AA)
            st = cv2.GaussianBlur(star, (0, 0), 1) * 1.5 + cv2.GaussianBlur(star, (0, 0), 6) * 2.5
            canvas += cv2.resize(st, (W, H))[..., None] * np.array([0.85, 0.95, 1.0], np.float32) * amp


# ---------------------------------------------------------------- motion amount -> subsamples
def n_samples(t):
    """adaptive motion-blur sample count (180deg shutter)."""
    if t < MAIN_OFF + 1.0 or t > T_OUTRO - 0.05:
        return 7
    ts = t - MAIN_OFF
    for c in CUTS:
        if 0 <= ts - c < 0.6:
            return 7
    if MAIN_OFF + 0.4 < t < MAIN_OFF + 1.3:
        return 5
    return 1


# ---------------------------------------------------------------- run
def src_reader():
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", SRC, "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
                         stdout=subprocess.PIPE, bufsize=SW * SH * 3 * 4)
    while True:
        b = p.stdout.read(SW * SH * 3)
        if len(b) < SW * SH * 3:
            break
        yield np.frombuffer(b, np.uint8).reshape(SH, SW, 3)


def render_frame(i, main_img):
    t = i / FPS
    k = n_samples(t)
    if k == 1:
        img = compose(t, main_img)
    else:
        shutter = 0.5 / FPS
        acc = None
        for j in range(k):
            tj = t + (j / (k - 1) - 0.5) * shutter
            c = compose(tj, main_img)
            acc = c if acc is None else acc + c
        img = acc / k
    return (post(img) * 255 + 0.5).astype(np.uint8)


if __name__ == "__main__":
    reader = src_reader()
    main_off_frames = int(round(MAIN_OFF * FPS))
    last_src = None
    src_idx = -1
    if PREVIEW:
        frames = [int(round(x * FPS)) for x in PREVIEW]
    else:
        frames = range(N_FRAMES)
        enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
                                "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                                "-c:v", "libx264", "-preset", "slow", "-crf", "17",
                                "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
    for i in frames:
        want = min(i - main_off_frames, int(SRC_END * FPS) - 1)
        main_img = None
        if want >= 0:
            while src_idx < want:
                fr = next(reader, None)
                if fr is None:
                    break
                src_idx += 1
                if src_idx == want:
                    last_src = key_source(fr, src_idx / FPS)
            main_img = last_src
        out = render_frame(i, main_img)
        if PREVIEW:
            cv2.imwrite(f"{OUT}_{i / FPS:06.2f}.jpg", out, [cv2.IMWRITE_JPEG_QUALITY, 90])
        else:
            enc.stdin.write(out.tobytes())
            if i % 150 == 0:
                print(f"frame {i}/{N_FRAMES}", flush=True)
    if not PREVIEW:
        enc.stdin.close(); enc.wait()
