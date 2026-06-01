from fastapi import APIRouter

from schema import (
    IndexRequest,
    ChatQuery,
)

from invoice_indexer import (
    index_invoice_pdf,
)

from query_service import (
    query_invoice,
)

router = APIRouter()


@router.get("/status")
def status():
    return {
        "status": "ok"
    }


@router.post("/index") # run this whenever a new pdf is uploaded
def index(req: IndexRequest):
    return index_invoice_pdf(req)


@router.post("/query")
def query(req: ChatQuery):
    return query_invoice(
        req.question,
        req.user_id
    )