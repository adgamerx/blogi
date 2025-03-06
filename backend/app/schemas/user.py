from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    model_config: ConfigDict(from_attributes=True)