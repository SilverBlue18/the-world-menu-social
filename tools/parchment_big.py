# Large map parchment so the map never shows an edge: world extent 9000 x 9000, made at half res.
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
rng = np.random.default_rng(11)
def fbm(h, w, octaves=6, base=4):
    out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for o in range(octaves):
        s = base * 2 ** o
        n = rng.random((max(2, h * s // w + 2), s + 2)).astype(np.float32)
        img = Image.fromarray((n * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        out += amp * (np.asarray(img, np.float32) / 255 - .5); tot += amp; amp *= .55
    return out / tot
W = H = 4500
base, dark = (222, 203, 162), (120, 88, 50)
n = fbm(H, W, 7, 4); big = fbm(H, W, 3, 3)
t = np.clip(.5 + n * 1.3 + big * .9, 0, 1)[..., None]
img = np.array(base, np.float32) * (1 - t * .35) + np.array(dark, np.float32) * (t * .35)
blot = fbm(H, W, 5, 4); blot = np.clip((blot - .12) * 4, 0, 1) ** 1.5 * .16 * (22 / 20)
img *= (1 - blot[..., None] * np.array([.55, .8, 1.15]))
fine = fbm(H, W, 3, 240); img *= (1 + fine[..., None] * .18)
im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)); dr = ImageDraw.Draw(im, "RGBA")
for _ in range(11000):
    x, y = rng.uniform(0, W), rng.uniform(0, H); a = rng.uniform(0, np.pi); L = rng.uniform(4, 22); c = int(rng.uniform(60, 120))
    dr.line([(x, y), (x + np.cos(a) * L, y + np.sin(a) * L)], fill=(c, c - 15, c - 35, int(rng.uniform(10, 35))), width=1)
im.filter(ImageFilter.GaussianBlur(.6)).save("public/imam/tex/parchment_big.jpg", quality=90)
print("ok")
