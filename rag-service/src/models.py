from langchain_google_genai import (
    GoogleGenerativeAIEmbeddings,
    ChatGoogleGenerativeAI,
)
from langchain_chroma import Chroma

from config import CHROMA_PATH, GEMINI_API_KEY

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key=GEMINI_API_KEY
)

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=GEMINI_API_KEY
)

vectorstore = Chroma(
    collection_name="invoices",
    embedding_function=embeddings,
    persist_directory=CHROMA_PATH
)