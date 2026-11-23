import sys
from PIL import Image, ImageDraw
files = sys.argv[2:]; out = sys.argv[1]
ims = [Image.open(f) for f in files]
w, h = 360, 640
cols = min(len(ims), 6); rows = (len(ims) + cols - 1) // cols
S = Image.new("RGB", (cols * w, rows * (h + 24)), "white")
d = ImageDraw.Draw(S)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * w, (i // cols) * (h + 24)
    S.paste(im.resize((w, h)), (x, y + 24)); fr = int(f[-8:-4]); d.text((x + 6, y + 5), f"{fr/30:.2f}s", fill="black")
S.save(out, quality=88)
