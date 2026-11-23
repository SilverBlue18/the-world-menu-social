import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageOps
rng = np.random.default_rng(5)
OUT = "public/mock/"
def fbm(h, w, octaves=5, base=4):
    out = np.zeros((h, w), np.float32); amp = 1; tot = 0
    for o in range(octaves):
        s = base * 2 ** o
        n = rng.random((max(2, h * s // w + 2), s + 2)).astype(np.float32)
        out += amp * (np.asarray(Image.fromarray((n * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255 - .5)
        tot += amp; amp *= .55
    return out / tot

# ---------- 1. engraving versions of the real photos (option 2) ----------
def engrave(src, out, width=1100, spacing=5.0, contrast=1.25):
    im = Image.open(src).convert("L")
    im = im.resize((width, int(im.height * width / im.width)), Image.LANCZOS)
    im = ImageOps.autocontrast(im, cutoff=1)
    g = np.asarray(im, np.float32) / 255
    g = np.clip((g - 0.5) * contrast + 0.5, 0, 1)
    dark = 1 - g
    h, w = g.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # wavy line field following a gentle curve
    warp = fbm(h, w, 3, 3) * 40 + 10 * np.sin(xx / 90)
    a1 = (yy + warp + 3 * (dark - 0.5) * 4) / spacing
    a2 = (xx * 0.7 + yy * 0.7) / spacing
    a3 = (xx * 0.7 - yy * 0.7) / spacing
    f1 = np.abs((a1 % 1) - 0.5) * 2  # 0 at line centre .. 1 between
    f2 = np.abs((a2 % 1) - 0.5) * 2
    f3 = np.abs((a3 % 1) - 0.5) * 2
    jit = fbm(h, w, 2, 120) * 0.25
    ink = (f1 < dark * 1.0 + jit * dark) | ((f2 < (dark - 0.45) * 1.6) & (dark > 0.45)) | ((f3 < (dark - 0.7) * 2.2) & (dark > 0.7))
    paper = np.array([238, 226, 200], np.float32); inkc = np.array([30, 22, 18], np.float32)
    img = np.where(ink[..., None], inkc, paper)
    Image.fromarray(img.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.4)).save(out, quality=92)
engrave("public/imam/img/rio.jpg", OUT + "rio_engr.jpg", width=760, spacing=3.6)
engrave("public/imam/img/pedro2.jpg", OUT + "pedro_engr.jpg", width=560, spacing=3.3)

# ---------- 2. newspaper / collage paper (option 1) ----------
W, H = 1080, 1920
n = fbm(H, W, 6, 3)
base = np.array([226, 218, 198], np.float32)
img = base * (1 + n[..., None] * 0.18)
im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
d = ImageDraw.Draw(im)
# faint columns of "text" lines (soft grey, unreadable)
for col in range(4):
    x0 = 40 + col * 260
    y = 40
    while y < H - 40:
        if rng.random() < 0.06: y += 30; continue
        L = rng.uniform(180, 236)
        d.line([(x0, y), (x0 + L, y)], fill=(150, 142, 126), width=3)
        y += 13
im = im.filter(ImageFilter.GaussianBlur(0.6))
im.save(OUT + "newsprint.jpg", quality=90)

# ---------- 3. ebru marbling (option 3) ----------
def ebru(w, h, colors, seed=1):
    r = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # start with drops/stripes then tine + swirl displacement
    u, v = xx.copy(), yy.copy()
    for k in range(6):
        cx, cy, R = r.uniform(0, w), r.uniform(0, h), r.uniform(80, 260)
        dx, dy = u - cx, v - cy; d2 = dx * dx + dy * dy
        f = np.sqrt(np.maximum(0, 1 - R * R / (d2 + R * R)))
        u, v = cx + dx * f, cy + dy * f
    # tines (comb pulled through)
    for k in range(3):
        u = u + 40 * np.exp(-((v % 140) - 70) ** 2 / 600) * (1 if k % 2 == 0 else -1)
        v = v + 25 * np.sin(u / 90 + k)
    band = ((u * 0.0022 + v * 0.0055 + 0.22 * np.sin(u / 110) + 0.18 * np.sin(v / 80)) % 1) * len(colors)
    idx = np.floor(band).astype(int) % len(colors)
    pal = np.array(colors, np.float32)
    img = pal[idx]
    # thin dark veins between bands
    frac = band % 1
    vein = np.exp(-((frac) ** 2) / 0.0008)
    img = img * (1 - 0.35 * vein[..., None])
    return Image.fromarray(img.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
ebru(1080, 1920, [(240, 232, 214), (24, 92, 128), (240, 232, 214), (34, 128, 130), (236, 226, 206), (180, 62, 50), (240, 232, 214), (16, 54, 92)], 3).save(OUT + "ebru.jpg", quality=92)

# ---------- 4. wood desk (option 4) ----------
Wd, Hd = 1600, 2600
yy, xx = np.mgrid[0:Hd, 0:Wd].astype(np.float32)
grain = fbm(Hd, Wd, 5, 3) * 6
rings = np.sin((xx * 0.035 + grain * 3 + 4 * np.sin(yy / 300)) ) * 0.5 + 0.5
fine = fbm(Hd, Wd, 3, 220)
t = np.clip(0.55 + rings * 0.25 + fine * 0.5, 0, 1)
dark = np.array([46, 26, 14], np.float32); light = np.array([118, 72, 40], np.float32)
img = dark + (light - dark) * t[..., None]
Image.fromarray(img.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7)).save(OUT + "wood.jpg", quality=90)
print("ok")
