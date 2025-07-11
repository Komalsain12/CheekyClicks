from flask import Flask, render_template, request, jsonify
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from datetime import datetime
import base64
import os
from zipfile import ZipFile

app = Flask(__name__, static_folder='static', template_folder='templates')
CAPTURE_DIR = 'static/captured'
os.makedirs(CAPTURE_DIR, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/save_strip', methods=['POST'])
def save_strip():
    data = request.json
    images = data['images']
    timestamp = data.get('timestamp', datetime.now().strftime('%d %b %Y %H:%M'))

    photos = []
    for b64_img in images:
        header, base64_data = b64_img.split(",", 1)
        img = Image.open(BytesIO(base64.b64decode(base64_data)))
        img = img.resize((300, 300))
        photos.append(img)

    margin = 30
    width = 300
    height = 300
    pin_radius = 15
    border = 20
    text_area = 80
    total_height = len(photos) * (height + margin) - margin + text_area + 50

    strip = Image.new("RGB", (width + border * 2, total_height), "white")
    draw = ImageDraw.Draw(strip)

    # Draw pin
    pin_center = ((width + border * 2) // 2, 20)
    draw.ellipse([
        (pin_center[0] - pin_radius, pin_center[1] - pin_radius),
        (pin_center[0] + pin_radius, pin_center[1] + pin_radius)
    ], fill=(160, 160, 160))

    # Paste photos
    y = 40
    for img in photos:
        framed = Image.new("RGB", (width, height), "white")
        framed.paste(img, (0, 0))
        strip.paste(framed, (border, y))
        y += height + margin

    # Add footer text
    footer = f"Captured: {timestamp}\nSweet Memories"
    font = ImageFont.load_default()
    draw.text((border, total_height - text_area + 10), footer, fill="black", font=font)

    # Save and zip
    strip_path = os.path.join(CAPTURE_DIR, "photo_strip_final.jpg")
    strip.save(strip_path)

    zip_path = os.path.join(CAPTURE_DIR, "photo_strip_final.zip")
    with ZipFile(zip_path, 'w') as zipf:
        zipf.write(strip_path, arcname="photo_strip_final.jpg")

    return jsonify({"status": "success", "url": f"/{zip_path}"})

if __name__ == "__main__":
    
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
