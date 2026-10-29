"""Creates small WebP copies of each album cover for the 3D bookshelf.

The full-size covers are around 400 KB each, too heavy to load as textures
for every book. Run this after adding an album: python3 scripts/generateCovers.py
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MUSIC_DIR = ROOT / "public" / "assets" / "music"
COVERS_DIR = ROOT / "public" / "assets" / "covers"
SIZE = 256

COVERS_DIR.mkdir(parents=True, exist_ok=True)
for album in sorted(p for p in MUSIC_DIR.iterdir() if p.is_dir()):
    source = album / "Album_Cover.png"
    if not source.exists():
        print(f"Skipping {album.name}: no Album_Cover.png")
        continue
    image = Image.open(source).convert("RGB")
    image.thumbnail((SIZE, SIZE), Image.LANCZOS)
    target = COVERS_DIR / f"{album.name}.webp"
    image.save(target, "WEBP", quality=82)
    print(f"{target.relative_to(ROOT)}: {target.stat().st_size // 1024} KB")
