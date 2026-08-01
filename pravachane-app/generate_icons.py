from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

img_dir = Path('static/img')
img_dir.mkdir(parents=True, exist_ok=True)
text = 'प'
for size in [192, 512]:
    img = Image.new('RGBA', (size, size), '#b43baf')
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype('arial.ttf', int(size * 0.55))
    except Exception:
        font = ImageFont.load_default()
    if hasattr(draw, 'textbbox'):
        bbox = draw.textbbox((0, 0), text, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
    else:
        w, h = draw.textsize(text, font=font)
    draw.text(((size - w) / 2, (size - h) / 2), text, font=font, fill='white')
    img.save(img_dir / f'icon-{size}.png')
print('icons created')
