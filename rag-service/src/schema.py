from pydantic import BaseModel
from typing import Literal

class QueryClassification(BaseModel):
    query_type: Literal["semantic", "analytical"]


class IndexRequest(BaseModel):
    invoice_id: str
    file_path: str
    vendor_name: str
    amount_due: float
    status: str


class ChatQuery(BaseModel):
    question: str
    user_id: str