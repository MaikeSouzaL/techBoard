# ========================================
# RepairHub — Image Processing Routes
# ========================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.image_processing import process_base64_image

router = APIRouter(prefix="/api")


class RemoveBgRequest(BaseModel):
    """Request body for background removal."""
    image: str  # Base64-encoded image (can include data URL prefix)
    upscale: Optional[bool] = True
    target_width: Optional[int] = 3840 
    sharpen: Optional[bool] = True


class RemoveBgResponse(BaseModel):
    """Response body with processed image."""
    cleanImage: str  # Data URL: data:image/png;base64,...


@router.post("/remove-bg", response_model=RemoveBgResponse)
async def remove_background(req: RemoveBgRequest):
    """
    Remove the background from a PCB board image.
    
    Accepts a base64-encoded image and returns a PNG with transparent background.
    Optionally upscales and sharpens the image.
    """
    try:
        result_b64 = process_base64_image(
            b64_input=req.image,
            do_upscale=req.upscale if req.upscale is not None else True,
            target_width=req.target_width if req.target_width is not None else 3840,
            do_sharpen=req.sharpen if req.sharpen is not None else True,
            do_remove_bg=True,
        )

        return RemoveBgResponse(
            cleanImage=f"data:image/webp;base64,{result_b64}"
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
