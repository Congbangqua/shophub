from pydantic import BaseModel
from typing import Optional

class GHNWebhookPayload(BaseModel):
    OrderCode: str
    Status: str
    Type: Optional[str] = None
    ShopID: Optional[int] = None  
