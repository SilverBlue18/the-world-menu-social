import numpy as np
from PIL import Image, ImageFilter
import sys
sys.path.insert(0, "tools")
rng = np.random.default_rng(11)
def fbm(h, w, octaves, base):
    out = np.zeros((h, w), np.float32); amp = 1; tot = 0
    for o in range(octaves):
        s = base * 2 ** o
        n = rng.random((max(2, h * s // w + 2), s + 2)).astype(np.float32)
        out += amp * (np.asarray(Image.fromarray((n * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255 - .5)
        tot += amp; amp *= .5
    return out / tot
def cloud(w, h, dark=False):
    yy, xx = np.mgrid[0:h, 0:w]
    blob = np.zeros((h, w), np.float32)
    for _ in range(11):
        cx, cy = rng.uniform(.25, .75) * w, rng.uniform(.38, .62) * h
        r = rng.uniform(.08, .2) * w
        blob = np.maximum(blob, 1 - np.sqrt(((xx - cx) / r) ** 2 + ((yy - cy) / (r * .75)) ** 2))
    n = fbm(h, w, 6, 4)
    edge = np.clip(1 - np.sqrt(((xx / w - .5) / .5) ** 2 + ((yy / h - .5) / .5) ** 2), 0, 1) ** .6
    a = (np.clip((blob + n * 1.1 - .02) * 2.0, 0, 1) ** 1.3) * edge
    shade = np.clip(.75 + n * 1.2 - (yy / h - .5) * .5, 0, 1)
    if dark:
        rgb = np.stack([60 + 70 * shade, 58 + 68 * shade, 62 + 72 * shade], -1)
    else:
        rgb = np.stack([200 + 55 * shade, 196 + 56 * shade, 190 + 58 * shade], -1)
    img = np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)
    return Image.fromarray(img, "RGBA").filter(ImageFilter.GaussianBlur(1.2))
for i in range(4): cloud(900, 600).save(f"public/imam/tex/cloud{i}.png")
for i in range(3): cloud(900, 600, dark=True).save(f"public/imam/tex/storm{i}.png")
print("clouds ok")
