from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from models import vectorstore

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)


def index_invoice_pdf(req):

    reader = PdfReader(req.file_path)

    
    text = ""
    for page in reader.pages:
        text+= page.extract_text() or""  # if page return none 
        
    if not text.strip():
          # strip -> remove white space from front and back 
                          # not of empty is true 
        return {"message": "No text extracted"}

    chunks = splitter.split_text(text)


    
    metadatas = []
    for chunk in chunks:


        metadatas.append({
            "invoice_id": req.invoice_id,
            "vendor": req.vendor_name,
            "status": req.status
        })

    ids = []

    for i in range(len(chunks)):
        ids.append(f"{req.invoice_id}_chunk_{i}")

    vectorstore.add_texts(
        texts=chunks,
        metadatas=metadatas,
        ids=ids,
    )

    return {"message": f"Indexed {len(chunks)} chunks"}