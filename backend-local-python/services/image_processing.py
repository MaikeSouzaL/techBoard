# ========================================
# RepairHub — Image Processing Service
# ========================================
# OpenCV-based image processing: background removal, upscale, sharpening.
# Extracted and improved from original main.py.

import cv2
import numpy as np
import base64
from typing import Tuple, Optional


def remove_background(img: np.ndarray) -> np.ndarray:
    """
    Remove white/light background from a PCB board image.
    Returns BGRA image with transparent background.
    
    Refined logic to avoid "holes":
    1. Uses more conservative thresholds.
    2. Identifies the largest contour (the board) and fills its internal holes.
    """
    # Convert to BGRA (add alpha channel)
    img_bgra = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)

    # --- Mask 1: HSV-based (catches light, desaturated areas) ---
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    # Value > 240 (very bright) and Saturation < 35 (near white)
    lower_hsv = np.array([0, 0, 240])
    upper_hsv = np.array([180, 35, 255])
    mask_hsv = cv2.inRange(hsv, lower_hsv, upper_hsv)

    # --- Mask 2: BGR-based (catches pure white) ---
    # Only pixels where ALL channels are very high
    lower_bgr = np.array([245, 245, 245])
    upper_bgr = np.array([255, 255, 255])
    mask_bgr = cv2.inRange(img, lower_bgr, upper_bgr)

    # --- Combine masks ---
    mask = cv2.bitwise_or(mask_hsv, mask_bgr)

    # --- Morphological cleanup ---
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    # --- Hole Filling Strategy ---
    # We find contours on the inverse mask (the board)
    board_mask = cv2.bitwise_not(mask)
    contours, _ = cv2.findContours(board_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Create a solid board mask
    solid_board_mask = np.zeros_like(mask)
    if contours:
        # Fill the largest contour (usually the main board)
        c = max(contours, key=cv2.contourArea)
        cv2.drawContours(solid_board_mask, [c], -1, 255, -1)
        
        # Also fill other significant contours to be safe
        for contour in contours:
            if cv2.contourArea(contour) > 500: # Small noise threshold
                cv2.drawContours(solid_board_mask, [contour], -1, 255, -1)

    # Final background mask is everything OUTSIDE the solid board
    final_bg_mask = cv2.bitwise_not(solid_board_mask)

    # --- Smooth edges ---
    final_bg_mask = cv2.GaussianBlur(final_bg_mask, (5, 5), 0)

    # --- Apply transparency ---
    img_bgra[final_bg_mask > 128, 3] = 0

    return img_bgra


def upscale_image(img: np.ndarray, target_width: int = 3840) -> np.ndarray:
    """Upscale an image to a target width (default 4K: 3840px)."""
    h, w = img.shape[:2]
    if w >= target_width:
        return img
    
    scale = target_width / w
    new_h = int(h * scale)
    return cv2.resize(img, (target_width, new_h), interpolation=cv2.INTER_CUBIC)


def denoise_image(img: np.ndarray) -> np.ndarray:
    """Apply denoising to reduce "serrilha" and artifacts."""
    return cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)


def sharpen_image(img: np.ndarray) -> np.ndarray:
    """Apply a sharpening filter to the image."""
    kernel = np.array([[-1, -1, -1],
                       [-1,  9, -1],
                       [-1, -1, -1]])
    return cv2.filter2D(img, -1, kernel)


def process_pcb_image(
    img: np.ndarray,
    do_upscale: bool = True,
    target_width: int = 3840,
    do_sharpen: bool = True,
    do_remove_bg: bool = True,
) -> np.ndarray:
    """
    Full PCB image processing pipeline.
    """
    result = img.copy()

    # 1. Upscale first as requested
    if do_upscale:
        result = upscale_image(result, target_width)
        # Apply denoise after upscale to smooth the "serrilha"
        result = denoise_image(result)

    # 2. Sharpen to bring back details lost in upscaling
    if do_sharpen:
        result = sharpen_image(result)

    # 3. Remove background last for cleanest alpha channel
    if do_remove_bg:
        result = remove_background(result)

    return result


# ========================================
# Base64 Helpers
# ========================================

def decode_base64_image(b64_string: str) -> np.ndarray:
    """Decode a base64-encoded image string to numpy array (BGR)."""
    # Strip data URL prefix if present
    if ',' in b64_string:
        b64_string = b64_string.split(',', 1)[1]

    img_bytes = base64.b64decode(b64_string)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Failed to decode image from base64")

    return img


def encode_image_base64(img: np.ndarray, fmt: str = ".webp") -> str:
    """Encode a numpy image to base64 string."""
    if fmt == ".webp":
        _, buffer = cv2.imencode(fmt, img, [cv2.IMWRITE_WEBP_QUALITY, 80])
    else:
        _, buffer = cv2.imencode(fmt, img)
    return base64.b64encode(buffer).decode('utf-8')


def process_base64_image(
    b64_input: str,
    do_upscale: bool = True,
    target_width: int = 3840,
    do_sharpen: bool = True,
    do_remove_bg: bool = True,
) -> str:
    """
    Process a base64-encoded PCB image and return base64-encoded WEBP result.
    """
    img = decode_base64_image(b64_input)
    result = process_pcb_image(
        img,
        do_upscale=do_upscale,
        target_width=target_width,
        do_sharpen=do_sharpen,
        do_remove_bg=do_remove_bg,
    )
    return encode_image_base64(result, ".webp")
