from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .user import UserOut

class PostCreate(BaseModel):
    title: str
    content: str

class PostOut(BaseModel):
    id: int
    title: str
    content: str
    image: Optional[str] = None
    user: UserOut
    created_at: datetime
    updated_at: datetime