from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime
from .user import UserOut
import base64

class PostBase(BaseModel):
    title: str
    content: str

class PostCreate(PostBase):
    pass

class PostUpdate(PostBase):
    title: Optional[str] = None
    content: Optional[str] = None

class PostOut(PostBase):
    id: int
    image_data: Optional[str] = None  # Base64 encoded image data
    created_at: datetime
    updated_at: datetime
    author_id: int
    author: Optional[UserOut] = None
    
    model_config = ConfigDict(from_attributes=True)
    
    # Convert binary image data to base64 for API responses
    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        if isinstance(obj, dict) and "image" in obj and obj["image"]:
            # Handle dictionary input
            try:
                obj["image_data"] = base64.b64encode(obj["image"]).decode("utf-8")
            except Exception:
                # If encoding fails, set image_data to None
                obj["image_data"] = None
        elif hasattr(obj, "image") and obj.image:
            # Handle ORM model input
            try:
                obj.image_data = base64.b64encode(obj.image).decode("utf-8")
            except Exception:
                # If encoding fails, set image_data to None
                obj.image_data = None
        
        return super().model_validate(obj, *args, **kwargs)