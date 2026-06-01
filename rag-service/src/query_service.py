import json
from bson import ObjectId
from langchain.chains import RetrievalQA
from langchain_core.output_parsers import StrOutputParser
from langchain.retrievers.multi_query import MultiQueryRetriever
from models import llm, vectorstore
from db import invoices_col
from prompts import (
    classify_prompt,
    analytical_prompt,
    rag_prompt,
)

parser = StrOutputParser()

classify_chain = classify_prompt | llm | parser
analytical_chain = analytical_prompt | llm | parser


def query_invoice(question: str, user_id: str):

    classification = (
        classify_chain
        .invoke({"question": question})
        .strip()
        .lower()
    )

    if "analytical" in classification:
        try:
            uid = ObjectId(user_id)
        except:
            uid = user_id
        invoices = list(
            invoices_col.find({"userId": uid})
        )

        # for inv in invoices:
        #     inv["_id"] = str(inv["_id"])
        #     inv["userId"] = str(inv["userId"])

        answer = analytical_chain.invoke({
            "invoices": json.dumps(  # converting python list into a json obj
                invoices[:20], # slicung and only first 20 docs
                default=str # some things are not json convertable in mongo doc like objec id so convert it into string 
            ),
            "question": question
        })

        return {
            "answer": answer,
            "type": "analytical"
        }

    mqr = MultiQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(
        search_kwargs={"k": 5}
    ),
    llm=llm
)

    docs = mqr.invoke(question)
    context = ""
    for doc in docs:
        context += doc.page_content
    chain = rag_prompt | llm | parser
    answer =  chain.invoke({'context':context,'question':question})
    return {
        "answer": answer,
        "type": "semantic"
    }