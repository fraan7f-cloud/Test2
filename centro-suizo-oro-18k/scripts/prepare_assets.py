"""Descarga los assets oficiales de joyeriacentrosuizo.cl y prepara versiones para el video.

Uso:  python3 scripts/prepare_assets.py
Todos los originales quedan en research/originals/ y las versiones procesadas en public/.
"""
import io
import json
import pathlib
import subprocess

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
ORIG = ROOT / "research" / "originals"
PUB = ROOT / "public"
CDN = "https://joyeriacentrosuizo.cl/cdn/shop/files/"

# nombre local -> (archivo en el CDN de la marca, descripción)
SOURCES = {
    "logo_negro_sobre_negro.jpg": ("logo_centro.jpg", "Logo blanco sobre negro (favicon / redes)"),
    "logo_completo.png": ("logo_blanco.avif", "Logo completo con 'Desde 1979 · Joyas' (header del sitio)"),
    "argollas_bicolor.png": ("c07573_c75c0051795d4cfea1c157d00f4a47ae_mv2.png", "Argolla bi color oro blanco y amarillo 18kt"),
    "argollas_media_cana.png": ("c07573_440698da35ec4d6aaf117191e01d9430_mv2_1200x.png", "Argollas de matrimonio 18kt"),
    "argollas_tallado.png": ("c07573_4925e414264b44bbaca6cabdd7ae8ef8_mv2_1200x.png", "Argollas tallado 18kt"),
    "argollas_circon.png": ("c07573_8b93c54953784d1aa617f55641fb39bc_mv2_1200x.png", "Argollas con circón 18kt"),
    "argollas_triple_circon.png": ("c07573_e63c31cc04db43caa8ff8effa68da905_mv2_1200x.png", "Argollas con circones 18kt"),
    "aros_bolita.png": ("c07573_3aefdff95ccd4aefb48eca3230ae5e7e_mv2_1200x.png", "Aros bolita 18kt"),
    "aros_perla.png": ("c07573_1ec532aebb9246eda535d8ef29f70ba7_mv2_1200x.png", "Aros perla cultivada 18kt"),
    "cadena_bolitas.png": ("c07573_cf4b39bd0adc418bb8d1229cec7e0169_mv2.png", "Cadena bolitas 18kt"),
    "campana_pulseras.png": ("CENTRO_SUIZO_2.png", "Pieza de campaña 'Pulseras · Detalles únicos en oro'"),
    "campana_se_sienten.png": ("3_437f65e6-f000-4c03-9a54-092358ac4fa6.png", "Pieza de campaña 'Hay decisiones que no se explican. Se sienten!'"),
}


def download(name: str, remote: str) -> Image.Image:
    ORIG.mkdir(parents=True, exist_ok=True)
    out = ORIG / name
    if not out.exists():
        subprocess.run(["curl", "-sSL", "--fail", "-o", str(out), CDN + remote], check=True)
    return Image.open(out)


def luminance_to_alpha(img: Image.Image, color: tuple, invert: bool) -> Image.Image:
    """Convierte un logo monocromo en un PNG transparente de un solo color."""
    lum = np.asarray(img.convert("L")).astype(np.float32) / 255.0
    if invert:
        lum = 1.0 - lum
    alpha = np.clip((lum - 0.18) / 0.7, 0, 1)
    rgba = np.zeros((*alpha.shape, 4), dtype=np.uint8)
    rgba[..., 0], rgba[..., 1], rgba[..., 2] = color
    rgba[..., 3] = (alpha * 255).astype(np.uint8)
    im = Image.fromarray(rgba, "RGBA")
    mask = Image.fromarray(((alpha > 0.2) * 255).astype(np.uint8))
    x0, y0, x1, y1 = mask.getbbox()
    return im.crop((max(x0 - 4, 0), max(y0 - 4, 0), x1 + 4, y1 + 4))


def main() -> None:
    (PUB / "brand").mkdir(parents=True, exist_ok=True)
    (PUB / "products").mkdir(parents=True, exist_ok=True)
    imgs = {k: download(k, v[0]) for k, v in SOURCES.items()}

    # Logos: versión blanca y dorada (#E2C878 = --cs-gold-light del sitio)
    full = imgs["logo_completo.png"]
    luminance_to_alpha(full, (255, 255, 255), invert=True).save(PUB / "brand" / "logo-completo-blanco.png")
    luminance_to_alpha(full, (0xE2, 0xC8, 0x78), invert=True).save(PUB / "brand" / "logo-completo-dorado.png")
    mark = imgs["logo_negro_sobre_negro.jpg"]
    luminance_to_alpha(mark, (255, 255, 255), invert=False).save(PUB / "brand" / "logo-blanco.png")
    luminance_to_alpha(mark, (0xE2, 0xC8, 0x78), invert=False).save(PUB / "brand" / "logo-dorado.png")

    # Productos y campañas: se copian como JPG optimizado (fondo original de la marca)
    for k in SOURCES:
        if k.startswith("logo"):
            continue
        im = imgs[k].convert("RGB")
        im.thumbnail((1200, 1200))
        im.save(PUB / "products" / (pathlib.Path(k).stem + ".jpg"), quality=92)

    manifest = {k: {"url": CDN + v[0], "descripcion": v[1]} for k, v in SOURCES.items()}
    (ROOT / "research" / "assets-sources.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    print("ok:", len(SOURCES), "assets")


if __name__ == "__main__":
    main()
