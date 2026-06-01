from langchain_core.prompts import PromptTemplate

classify_prompt = PromptTemplate(
    input_variables=["question"],
    template="""
Classify this invoice query as ONLY one word: analytical OR semantic.

analytical = counts, totals, filtering by status/amount/date
semantic = searching invoice content for specific topics or mentions

Query: "{question}"

Reply with ONE word only: analytical OR semantic
"""
)

analytical_prompt = PromptTemplate(
    input_variables=["invoices", "question"],
    template="""
You are an invoice assistant.

Invoice Data:
{invoices}

Question:
{question}

Answer:
"""
)


rag_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""
You are an AI invoice assistant.

Use ONLY the information provided in the context below to answer the user's question.

Rules:
- Do not make up information.
- If the answer is not present in the context, reply:
  "I couldn't find that information in the invoices."
- Be concise and factual.
- If multiple invoices are relevant, mention all relevant invoices.
- Include invoice numbers, vendors, dates, amounts, and statuses when relevant.

Context:
{context}

Question:
{question}

Answer:
"""
)
