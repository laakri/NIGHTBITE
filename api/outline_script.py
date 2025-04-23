from PIL import Image, ImageFilter
import os

def add_smooth_outline(image_path, output_path, outline_width=10, outline_color=(255, 255, 255, 255)):
    img = Image.open(image_path).convert("RGBA")

    # Add padding
    padding = outline_width * 2
    new_size = (img.width + padding * 2, img.height + padding * 2)
    padded_img = Image.new("RGBA", new_size, (0, 0, 0, 0))
    padded_img.paste(img, (padding, padding))

    # Create alpha mask and blur it for soft outline
    alpha = padded_img.getchannel("A")
    blurred = alpha.filter(ImageFilter.GaussianBlur(radius=outline_width))

    # Create white blurred outline image
    outline = Image.new("RGBA", new_size, outline_color)
    outline.putalpha(blurred)

    # Combine glow + original image
    final_img = Image.alpha_composite(outline, padded_img)
    final_img.save(output_path)

def process_folder(folder_path):
    output_folder = os.path.join(folder_path, "outlined")
    os.makedirs(output_folder, exist_ok=True)

    for file in os.listdir(folder_path):
        if file.lower().endswith(".png"):
            full_path = os.path.join(folder_path, file)
            output_path = os.path.join(output_folder, file)
            add_smooth_outline(full_path, output_path)
            print(f"✅ Outlined saved: {output_path}")

# Example usage
process_folder(r"C:\Users\glass\Downloads\game_card_ui\Icons\Paid (a few samples)\PNG Big (256 px)")
