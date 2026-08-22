#!/usr/bin/env python3
"""
TheJerseyHub AI Background Remover
Utilizes U2-Net deep learning model to isolate jersey cutouts with alpha transparency.
Supports stdin/stdout streaming of base64 data or CLI file paths.
"""

import sys
import os
import io
import base64
from PIL import Image

def remove_background(input_data: bytes) -> bytes:
    try:
        from rembg import remove, new_session
        session = new_session("u2net")
        output_bytes = remove(input_data, session=session)
        return output_bytes
    except Exception as e:
        # Fallback simple transparent alpha mask if model load fails
        sys.stderr.write(f"AI Model Notice: {str(e)}\n")
        img = Image.open(io.BytesIO(input_data)).convert("RGBA")
        datas = img.getdata()
        newData = []
        for item in datas:
            # Change white / near-white background to transparent
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
        img.putdata(newData)
        out_buf = io.BytesIO()
        img.save(out_buf, format="PNG")
        return out_buf.getvalue()

def main():
    if len(sys.argv) > 1 and sys.argv[1] != "--stdin":
        # File mode: python remove_bg.py <input_file> [output_file]
        input_path = sys.argv[1]
        output_path = sys.argv[2] if len(sys.argv) > 2 else "cutout_output.png"
        
        with open(input_path, "rb") as f:
            input_bytes = f.read()
            
        output_bytes = remove_background(input_bytes)
        
        with open(output_path, "wb") as f:
            f.write(output_bytes)
            
        print(f"✓ Cutout saved successfully to: {output_path}")
    else:
        # Stdin mode: takes base64 string or HTTP/HTTPS web URL from stdin
        raw_input = sys.stdin.read().strip()
        
        if raw_input.startswith("http://") or raw_input.startswith("https://"):
            import urllib.request
            req = urllib.request.Request(
                raw_input,
                headers={
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                input_bytes = response.read()
        else:
            if raw_input.startswith("data:image"):
                raw_input = raw_input.split(",")[1]
            input_bytes = base64.b64decode(raw_input)
            
        output_bytes = remove_background(input_bytes)
        output_b64 = base64.b64encode(output_bytes).decode("utf-8")
        
        # Return pure data URI
        sys.stdout.write(f"data:image/png;base64,{output_b64}")

if __name__ == "__main__":
    main()
