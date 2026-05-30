import { GoogleGenerativeAI } from "@google/generative-ai";  //Imports the Gemini SDK from Google's package.
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const extractInvoiceData = async (filePath: string, mimeType: string) => {
    //A MIME type (Multipurpose Internet Mail Extensions type) tells your application what kind of file it is.
  const fileData = fs.readFileSync(filePath);
  const base64File = fileData.toString("base64");

    const prompt = `You are an invoice data extractor. Extract all data from this invoice and return ONLY a valid JSON object with these exact fields:
{
  "invoiceNumber": "",
  "vendorName": "",
  "vendorAddress": "",
  "customerName": "",
  "customerAddress": "",
  "invoiceDate": "",
  "dueDate": "",
  "subtotal": 0,
  "taxAmount": 0,
  "amountDue": 0,
  "currency": "USD",
  "items": [{ "description": "", "quantity": 1, "unitPrice": 0, "amount": 0 }]
}
Return ONLY the JSON. No explanation. No markdown.`;

  const result = await model.generateContent([
    { inlineData: { mimeType, data: base64File } },
    { text: prompt },
  ]);

  const text = result.response.text().trim();
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned); // converting json string into js obj 
};