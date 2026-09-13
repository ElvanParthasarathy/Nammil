import fitz
from PIL import Image, ImageDraw, ImageChops
import io

def round_corners(img, radius):
    w, h = img.size
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), (w, h)], radius=radius, fill=255)
    result = img.copy().convert('RGBA')
    r, g, b, a = result.split()
    new_alpha = ImageChops.multiply(a, mask.convert('L'))
    result.putalpha(new_alpha)
    return result

def generate_all(pdf_path):
    doc = fitz.open(pdf_path)
    page = doc.load_page(0)
    pix = page.get_pixmap(matrix=fitz.Matrix(8, 8), alpha=True)
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    
    # Square crop
    w, h = img.size
    s = min(w, h)
    left = (w - s) // 2
    top = (h - s) // 2
    img = img.crop((left, top, left + s, top + s))
    
    # High-res rounded square logo
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    logo = round_corners(img_512, int(512 * 0.20))
    
    # --- Setup Small Icon (55x55) ---
    small = Image.new('RGB', (55, 55), (255, 255, 255))
    logo_45 = logo.resize((45, 45), Image.Resampling.LANCZOS)
    small.paste(logo_45, (5, 5), logo_45)
    small.save(r"d:\Things\Padaippugal\Nadappil\Elvan Elcen\elvan-elcen\Nammil.Electron\build\setup_icon.bmp", format='BMP')
    print("Saved setup_icon.bmp")
    
    # --- Setup Sidebar (164x314) ---
    sidebar = Image.new('RGB', (164, 314), (255, 255, 255))
    logo_120 = logo.resize((120, 120), Image.Resampling.LANCZOS)
    x = (164 - 120) // 2
    y = (314 - 120) // 2
    sidebar.paste(logo_120, (x, y), logo_120)
    sidebar.save(r"d:\Things\Padaippugal\Nadappil\Elvan Elcen\elvan-elcen\Nammil.Electron\build\setup_sidebar.bmp", format='BMP')
    print("Saved setup_sidebar.bmp")
    
    # --- App ICO (rounded square) ---
    icon_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    logo.save(r"d:\Things\Padaippugal\Nadappil\Elvan Elcen\elvan-elcen\Nammil.Electron\build\icon.ico", format='ICO', sizes=icon_sizes)
    logo.save(r"d:\Things\Padaippugal\Nadappil\Elvan Elcen\elvan-elcen\Nammil.Electron\src\assets\app_icon.ico", format='ICO', sizes=icon_sizes)
    print("Saved icon.ico and app_icon.ico")

if __name__ == "__main__":
    generate_all(r"C:\Users\Elvan\Downloads\Blue Minimalist Automotive Logo (2).pdf")
