import fitz  # PyMuPDF
from PIL import Image, ImageDraw, ImageChops
import os

pdf_path = r"C:\Users\Elvan\Downloads\Blue Minimalist Automotive Logo (1).pdf"
out_dir = r"d:\Things\Padaippugal\Nadappil\Elvan Elcen\elvan-elcen\Nammil.Electron\src\assets"
build_dir = r"d:\Things\Padaippugal\Nadappil\Elvan Elcen\elvan-elcen\Nammil.Electron\build"

print("Opening PDF...")
doc = fitz.open(pdf_path)
page = doc.load_page(0)

# Render at a very high resolution
zoom = 8.0
mat = fitz.Matrix(zoom, zoom)
pix = page.get_pixmap(matrix=mat, alpha=False) # Get RGB first to find white background

# Convert to PIL Image
img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

# Find bounding box (assuming white background)
bg = Image.new("RGB", img.size, (255, 255, 255))
diff = ImageChops.difference(img, bg)
bbox = diff.getbbox()

if bbox:
    print(f"Content bounding box found: {bbox}")
    img = img.crop(bbox)
else:
    print("No bounding box found, using full image.")

size = max(img.width, img.height)
# Add some padding (e.g., 20%)
padded_size = int(size * 1.2)

# Create a square canvas with a color that matches the edge of the cropped image or just white
bg_color = img.getpixel((0,0))
square_img = Image.new("RGB", (padded_size, padded_size), bg_color)

# Paste the cropped logo in the center
paste_x = (padded_size - img.width) // 2
paste_y = (padded_size - img.height) // 2
square_img.paste(img, (paste_x, paste_y))

img = square_img.convert("RGBA")

# Create squircle mask
radius = int(padded_size * 0.225)
mask = Image.new("L", (padded_size, padded_size), 0)
draw = ImageDraw.Draw(mask)
draw.rounded_rectangle((0, 0, padded_size, padded_size), radius=radius, fill=255)

# Apply mask
img.putalpha(mask)

# Resize to standard high-quality sizes
final_size = 1024
img = img.resize((final_size, final_size), Image.Resampling.LANCZOS)

png_path = os.path.join(out_dir, "app_icon.png")
img.save(png_path, "PNG")

ico_path = os.path.join(out_dir, "app_icon.ico")
build_ico_path = os.path.join(build_dir, "icon.ico")
sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
img.save(ico_path, format="ICO", sizes=sizes)
img.save(build_ico_path, format="ICO", sizes=sizes)

print(f"Saved high quality icons to {png_path} and {ico_path}")
