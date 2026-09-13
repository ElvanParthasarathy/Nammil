import fitz
from PIL import Image, ImageDraw, ImageFont
import io
import os

def generate_installer_images(pdf_path, small_bmp_path, large_bmp_path):
    # Open the PDF logo
    doc = fitz.open(pdf_path)
    page = doc.load_page(0)
    pix = page.get_pixmap(matrix=fitz.Matrix(8, 8), alpha=True)
    logo = Image.open(io.BytesIO(pix.tobytes("png")))
    
    # Crop whitespace
    bbox = logo.getbbox()
    if bbox:
        logo = logo.crop(bbox)
    
    # --- Small Icon BMP (55x55) for wizard header ---
    icon_size = 55
    small_canvas = Image.new('RGB', (icon_size, icon_size), (255, 255, 255))
    
    # Resize logo to fit
    lw, lh = logo.size
    max_dim = max(lw, lh)
    scale = 45.0 / max_dim
    new_w, new_h = int(lw * scale), int(lh * scale)
    logo_small = logo.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    paste_x = (icon_size - new_w) // 2
    paste_y = (icon_size - new_h) // 2
    small_canvas.paste(logo_small, (paste_x, paste_y), logo_small)
    small_canvas.save(small_bmp_path, format='BMP')
    print(f"Saved small icon: {small_bmp_path}")

    # --- Large Sidebar BMP (164x314) - Food themed ---
    sidebar_w, sidebar_h = 164, 314
    
    # Food-themed gradient: warm orange to deep red (like spices/food)
    large_canvas = Image.new('RGB', (sidebar_w, sidebar_h))
    draw = ImageDraw.Draw(large_canvas)
    
    # Create a warm food-themed gradient (deep green to teal - matching the app's color palette)
    for y in range(sidebar_h):
        ratio = y / sidebar_h
        # From dark teal (#0d1b2a) to warm green (#1a936f) matching app theme
        r = int(13 + (26 - 13) * ratio)
        g = int(27 + (147 - 27) * ratio)
        b = int(42 + (111 - 42) * ratio)
        draw.line([(0, y), (sidebar_w, y)], fill=(r, g, b))
    
    # Add some subtle decorative circles (food plate/bowl shapes)
    for i in range(5):
        cx = 30 + (i * 35) % sidebar_w
        cy = 50 + i * 55
        radius = 15 + i * 3
        draw.ellipse(
            [cx - radius, cy - radius, cx + radius, cy + radius],
            outline=(255, 255, 255, 30),
            width=1
        )
    
    # Place logo in the center
    scale_large = 100.0 / max_dim
    new_wl, new_hl = int(lw * scale_large), int(lh * scale_large)
    logo_large = logo.resize((new_wl, new_hl), Image.Resampling.LANCZOS)
    
    paste_xl = (sidebar_w - new_wl) // 2
    paste_yl = (sidebar_h - new_hl) // 2 - 30
    large_canvas.paste(logo_large, (paste_xl, paste_yl), logo_large)
    
    # Add app name text below logo
    try:
        font = ImageFont.truetype("segoeui.ttf", 16)
        font_small = ImageFont.truetype("segoeui.ttf", 10)
    except:
        font = ImageFont.load_default()
        font_small = font
    
    # "Elvan Nammil" text
    text = "Elvan Nammil"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_w = text_bbox[2] - text_bbox[0]
    text_x = (sidebar_w - text_w) // 2
    text_y = paste_yl + new_hl + 15
    draw.text((text_x, text_y), text, fill=(255, 255, 255), font=font)
    
    # Version text
    ver_text = "v2.1.0"
    ver_bbox = draw.textbbox((0, 0), ver_text, font=font_small)
    ver_w = ver_bbox[2] - ver_bbox[0]
    ver_x = (sidebar_w - ver_w) // 2
    draw.text((ver_x, text_y + 22), ver_text, fill=(200, 220, 210), font=font_small)
    
    # Food emoji decorations at bottom
    food_text = "by Elvan Parthasarathy"
    food_bbox = draw.textbbox((0, 0), food_text, font=font_small)
    food_w = food_bbox[2] - food_bbox[0]
    food_x = (sidebar_w - food_w) // 2
    draw.text((food_x, sidebar_h - 30), food_text, fill=(180, 200, 190), font=font_small)
    
    large_canvas.save(large_bmp_path, format='BMP')
    print(f"Saved sidebar: {large_bmp_path}")

if __name__ == "__main__":
    pdf = r"C:\Users\Elvan\Downloads\Blue Minimalist Automotive Logo (2).pdf"
    small = r"d:\Things\Padaippugal\Nadappil\Elvan Elcen\elvan-elcen\Nammil.Electron\build\setup_icon.bmp"
    large = r"d:\Things\Padaippugal\Nadappil\Elvan Elcen\elvan-elcen\Nammil.Electron\build\setup_sidebar.bmp"
    generate_installer_images(pdf, small, large)
