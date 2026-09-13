import fitz  # PyMuPDF
from PIL import Image, ImageDraw
import os

pdf_path = r"C:\Users\Elvan\Downloads\Blue Minimalist Automotive Logo.pdf"
out_dir = r"d:\Things\Padaippugal\Nadappil\Elvan Elcen\elvan-elcen\Nammil.Electron\src\assets"

print("Opening PDF...")
doc = fitz.open(pdf_path)
page = doc.load_page(0)

# Render at exactly the resolution we need to avoid downscaling blur
zoom = 10.0
mat = fitz.Matrix(zoom, zoom)
pix = page.get_pixmap(matrix=mat, alpha=True)

img = Image.frombytes("RGBA", [pix.width, pix.height], pix.samples)

# Make it a perfect square without adding fake padding
size = min(img.width, img.height)
left = (img.width - size) / 2
top = (img.height - size) / 2
right = (img.width + size) / 2
bottom = (img.height + size) / 2
img = img.crop((left, top, right, bottom))

# Create squircle mask
radius = int(size * 0.225)
mask = Image.new("L", img.size, 0)
draw = ImageDraw.Draw(mask)
draw.rounded_rectangle((0, 0, size, size), radius=radius, fill=255)

# Apply mask cleanly
img.putalpha(mask)

# Resize with high quality Lanczos filter
img = img.resize((1024, 1024), Image.Resampling.LANCZOS)

png_path = os.path.join(out_dir, "app_icon.png")
img.save(png_path, "PNG")

ico_path = os.path.join(out_dir, "app_icon.ico")
img.save(ico_path, format="ICO", sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])

print(f"Saved pristine icons to {png_path} and {ico_path}")
