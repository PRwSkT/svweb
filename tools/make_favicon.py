import sys
from PIL import Image

input_image = "/Users/peerawatsmacbookpro/.gemini/antigravity/brain/b3ed2461-c034-4161-91bb-2ea434274efc/.user_uploaded/media_1786465539509.png"
img = Image.open(input_image).convert("RGBA")

# Save favicon.ico (multi-size)
icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
img.save("src/assets/favicon.ico", format="ICO", sizes=icon_sizes)

# Save apple-touch-icon.png
apple_icon = img.resize((180, 180), Image.Resampling.LANCZOS)
apple_icon.save("src/assets/apple-touch-icon.png", format="PNG")

print("Favicons generated successfully.")
