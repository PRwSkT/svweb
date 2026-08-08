from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "assets" / "images"
OUT.mkdir(parents=True, exist_ok=True)

NAVY = (23, 61, 102)
DEEP_NAVY = (10, 30, 52)
CRIMSON = (110, 13, 34)
CREAM = (230, 230, 215)
GOLD = (182, 165, 85)
SKY = (170, 200, 214)
GREEN = (68, 104, 78)
INK = (20, 24, 30)
STONE = (205, 203, 190)


def rounded(draw, xy, radius, fill):
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def add_noise(img, amount=9):
    px = img.load()
    w, h = img.size
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            shift = int((math.sin(x * 0.17 + y * 0.11) + 1) * amount / 2)
            r, g, b = px[x, y][:3]
            px[x, y] = (min(255, r + shift), min(255, g + shift), min(255, b + shift))
    return img


def draw_people(draw, baseline, positions, scale=1.0):
    for i, x in enumerate(positions):
        color = [DEEP_NAVY, CRIMSON, (52, 67, 82), GOLD][i % 4]
        r = int(9 * scale)
        draw.ellipse((x - r, baseline - 54 * scale, x + r, baseline - 36 * scale), fill=color)
        draw.line((x, baseline - 34 * scale, x, baseline), fill=color, width=max(3, int(5 * scale)))
        draw.line((x, baseline - 18 * scale, x - 16 * scale, baseline - 4 * scale), fill=color, width=max(2, int(3 * scale)))
        draw.line((x, baseline - 18 * scale, x + 16 * scale, baseline - 4 * scale), fill=color, width=max(2, int(3 * scale)))


def make_scene(name, title, accent, kind):
    w, h = 1800, 1125
    img = Image.new("RGB", (w, h), CREAM)
    draw = ImageDraw.Draw(img)

    for y in range(h):
        t = y / h
        if kind == "hero":
            top, bottom = (178, 194, 204), (42, 63, 76)
        elif kind == "classroom":
            top, bottom = (225, 224, 210), (112, 133, 143)
        elif kind == "admissions":
            top, bottom = (222, 220, 204), (70, 47, 58)
        else:
            top, bottom = (209, 219, 212), (50, 74, 66)
        r = int(top[0] * (1 - t) + bottom[0] * t)
        g = int(top[1] * (1 - t) + bottom[1] * t)
        b = int(top[2] * (1 - t) + bottom[2] * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    draw.rectangle((0, 705, w, h), fill=(63, 83, 77) if kind != "admissions" else (69, 47, 55))
    draw.polygon([(0, 775), (900, 655), (1800, 810), (1800, h), (0, h)], fill=(38, 61, 58))
    draw.polygon([(0, 820), (1800, 700), (1800, 815), (0, 930)], fill=(196, 184, 142))

    if kind == "classroom":
        draw.rectangle((140, 230, 1660, 790), fill=(236, 235, 224))
        for x in range(230, 1540, 210):
            draw.rectangle((x, 310, x + 145, 590), fill=(143, 177, 190))
            draw.rectangle((x + 10, 320, x + 135, 580), outline=(222, 229, 224), width=8)
        draw.rectangle((190, 650, 1580, 705), fill=NAVY)
        draw_people(draw, 785, [460, 590, 760, 930, 1100, 1230], 1.3)
    elif kind == "admissions":
        draw.rectangle((170, 250, 1080, 780), fill=(241, 239, 229))
        draw.rectangle((220, 315, 980, 375), fill=NAVY)
        for y in [455, 530, 605]:
            draw.rectangle((230, y, 940, y + 20), fill=STONE)
        draw.rectangle((1120, 300, 1495, 780), fill=(238, 233, 214))
        for i, y in enumerate([365, 475, 585, 695]):
            draw.ellipse((1185, y, 1230, y + 45), fill=[CRIMSON, NAVY, GOLD, GREEN][i])
            draw.rectangle((1265, y + 13, 1440, y + 27), fill=(95, 98, 94))
    elif kind == "life":
        for x, y, ww, hh in [(160, 250, 430, 330), (640, 210, 420, 360), (1110, 280, 470, 320)]:
            draw.rectangle((x, y, x + ww, y + hh), fill=(235, 232, 215))
            draw.rectangle((x + 24, y + 24, x + ww - 24, y + hh - 24), fill=(121, 151, 133))
        draw_people(draw, 800, [500, 620, 790, 930, 1110, 1230, 1390], 1.5)
    else:
        draw.rectangle((155, 245, 1010, 780), fill=(236, 235, 224))
        draw.rectangle((220, 325, 940, 400), fill=NAVY)
        for x in range(245, 900, 105):
            draw.rectangle((x, 470, x + 70, 645), fill=(139, 172, 188))
        draw.polygon([(1080, 790), (1310, 265), (1540, 790)], fill=DEEP_NAVY)
        draw.polygon([(1180, 790), (1310, 430), (1440, 790)], fill=accent)
        draw_people(draw, 835, [480, 650, 810, 970, 1140], 1.4)

    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for x in range(w):
        a = int(135 * (1 - x / w))
        od.line([(x, 0), (x, h)], fill=(4, 16, 30, a))
    od.rectangle((0, 0, w, h), fill=(10, 30, 52, 34))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    img = img.filter(ImageFilter.GaussianBlur(radius=0.45))
    img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=125, threshold=4))
    add_noise(img, 5)
    img.save(OUT / f"{name}.png", optimize=True, quality=92)


assets = [
    ("hero-campus", "Somkid Vittaya", CRIMSON, "hero"),
    ("classroom", "Active classroom", NAVY, "classroom"),
    ("admissions", "Admissions steps", CRIMSON, "admissions"),
    ("student-life", "Student life", GOLD, "life"),
    ("parents", "Parents portal", NAVY, "classroom"),
    ("news", "News and events", GREEN, "life"),
]

for asset in assets:
    make_scene(*asset)

fav = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
draw = ImageDraw.Draw(fav)
draw.rounded_rectangle((12, 12, 116, 116), radius=18, fill=NAVY)
draw.polygon([(12, 12), (116, 12), (116, 116)], fill=CRIMSON)
draw.text((39, 45), "SV", fill=(255, 255, 255), stroke_width=0)
fav.save(ROOT / "src" / "assets" / "favicon.ico", sizes=[(32, 32), (64, 64), (128, 128)])
