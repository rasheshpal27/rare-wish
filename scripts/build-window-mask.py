"""Rebuild the aperture mask from the supplied transparent cabin artwork.
Requires Pillow: python -m pip install pillow
Run from the repository root: python scripts/build-window-mask.py
"""
from pathlib import Path
from PIL import Image, ImageOps

source = Path('assets/img/cabin.webp')
image = Image.open(source).convert('RGBA')
# The photograph already defines the exact two openings, including their
# perspective and antialiased edges. Do not approximate them with oval boxes.
mask = Image.new('RGBA', image.size, (255, 255, 255, 0))
mask.putalpha(ImageOps.invert(image.getchannel('A')))
mask.save('assets/img/cabin-window-mask.png', optimize=True)
