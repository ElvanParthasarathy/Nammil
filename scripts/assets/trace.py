import vtracer

input_png = r"D:\Elvan Nammil\Media\Personal\Images\nammil.png"
output_svg = r"D:\Elvan Nammil\Media\Personal\Images\nammil.svg"

print(f"Converting {input_png} to SVG...")

# Using standard tracing parameters for high quality flat graphics
vtracer.convert_image_to_svg_py(
    input_png,
    output_svg,
    colormode="color",
    hierarchical="stacked",
    mode="spline",
    filter_speckle=4,
    color_precision=6,
    layer_difference=16,
    corner_threshold=60,
    length_threshold=4.0,
    max_iterations=10,
    splice_threshold=45,
    path_precision=8
)

print(f"Successfully saved high-quality SVG to {output_svg}")
