import numpy as np
from PIL import Image, ImageFilter
rng = np.random.default_rng(7)
def fbm(h, w, octaves=6, base=4):
    out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for o in range(octaves):
        s = base * 2 ** o
        n = rng.random((max(2, h * s // w + 2), s + 2)).astype(np.float32)
        img = Image.fromarray((n * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        out += amp * (np.asarray(img, np.float32) / 255 - .5); tot += amp; amp *= .55
    return out / tot
def parchment(w, h, base, dark, stains=14, fibers=900, seed_scale=1.0):
    n = fbm(h, w, 7, 3)
    big = fbm(h, w, 3, 2)
    t = np.clip(.5 + n * 1.3 + big * .9, 0, 1)[..., None]
    img = np.array(base, np.float32) * (1 - t * .35) + np.array(dark, np.float32) * (t * .35)
    # stains: soft rings
    yy, xx = np.mgrid[0:h, 0:w]
    blot = fbm(h, w, 5, 3)
    blot = np.clip((blot - .12) * 4, 0, 1) ** 1.5 * .16 * (stains / 20)
    img *= (1 - blot[..., None] * np.array([.55, .8, 1.15]))
    fine = fbm(h, w, 3, 160)
    img *= (1 + fine[..., None] * .18)
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    # fibers
    from PIL import ImageDraw
    dr = ImageDraw.Draw(im, "RGBA")
    for _ in range(fibers):
        x, y = rng.uniform(0, w), rng.uniform(0, h); a = rng.uniform(0, np.pi); L = rng.uniform(4, 22)
        c = int(rng.uniform(60, 120))
        dr.line([(x, y), (x + np.cos(a) * L, y + np.sin(a) * L)], fill=(c, c - 15, c - 35, int(rng.uniform(10, 35))), width=1)
    return im
# map parchment (shown at 6000x4840 world, made at half res)
parchment(3000, 2420, (222, 203, 162), (120, 88, 50), stains=22, fibers=4000).filter(ImageFilter.GaussianBlur(.6)).save("public/imam/tex/parchment.jpg", quality=90)
# photo paper / document paper
parchment(1200, 1500, (240, 232, 214), (170, 150, 115), stains=3, fibers=500).save("public/imam/tex/paper.jpg", quality=90)
# grain tiles
for i in range(12):
    g = rng.normal(0, 1, (960, 540)).astype(np.float32)
    g = np.asarray(Image.fromarray(((g * 30) + 128).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.5)))
    Image.fromarray(g).convert("L").save(f"public/imam/tex/grain{i}.png")
print("ok")
