import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from invoice_router import router

app = FastAPI(title="Invox RAG Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)