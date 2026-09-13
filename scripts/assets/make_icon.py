import fitz  # PyMuPDF
from PIL import Image, ImageDraw
import os

pdf_path = r"C:\Users\Elvan\Downloads\Blue Minimalist Automotive Logo.pdf"
out_dir = r"d:\Things\Padaippugal\Nadappil\Elvan Elcen\elvan-elcen\Nammil.Electron\src\assets"
os.makedirs(out_dir, exist_ok=True)

print("Opening PDF...")
doc = fitz.open(pdf_path)
page = doc.load_page(0)

# Render at a very high resolution (zoom factor 8 to guarantee extreme quality)
zoom = 8.0
mat = fitz.Matrix(zoom, zoom)
pix = page.get_pixmap(matrix=mat, alpha=True)

# Convert to PIL Image
img = Image.frombytes("RGBA", [pix.width, pix.height], pix.samples)

print(f"Rendered image size: {img.size}")

# Make it a perfect square via center cropping
size = min(img.width, img.height)
left = (img.width - size) / 2
top = (img.height - size) / 2
right = (img.width + size) / 2
bottom = (img.height + size) / 2
img = img.crop((left, top, right, bottom))
print(f"Cropped to square: {img.size}")

# Create a squircle/rounded-square mask (Samsung style)
# Samsung One UI icons typically have a corner radius of exactly 22.5% of the icon size
radius = int(size * 0.225)
mask = Image.new("L", img.size, 0)
draw = ImageDraw.Draw(mask)

# Draw rounded rectangle mask
draw.rounded_rectangle((0, 0, size, size), radius=radius, fill=255)

# Apply mask by putting it in the alpha channel
img.putalpha(mask)

# Downscale gracefully to 1024x1024 for standard high-quality PNG
final_size = 1024
img = img.resize((final_size, final_size), Image.Resampling.LANCZOS)

# Save as PNG
png_path = os.path.join(out_dir, "app_icon.png")
img.save(png_path, "PNG")
print(f"Saved High Quality PNG to {png_path}")

# Save as ICO (multiple sizes for Windows)
ico_path = os.path.join(out_dir, "app_icon.ico")
img.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print(f"Saved High Quality ICO to {ico_path}")
