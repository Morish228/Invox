import { Router, Response } from "express";
import Invoice from "../models/Invoice"
import { protect, AuthRequest } from "../middleware/auth";
import { upload } from "../config/multer";

import { extractInvoiceData } from "../services/gemini";
import path from "path";

const invoiceRouter = Router();

// POST /api/invoices — Create invoice
// POST /api/invoices — Create invoice manually
invoiceRouter.post("/", protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const {
      vendorName, vendorAddress, customerName, customerAddress,
      invoiceNumber, subtotal, taxAmount, amountDue,
      currency, invoiceDate, dueDate, items, notes,
    } = req.body;

    const invoice = await Invoice.create({
      userId: req.userId,
      vendorName, vendorAddress, customerName, customerAddress,
      invoiceNumber, subtotal, taxAmount, amountDue,
      currency, invoiceDate, dueDate, items, notes,
      extractedByAI: false,
      status: "pending",
    });

    return res.status(201).json(invoice);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});


// GET /api/invoices — Get all invoices for logged-in user
invoiceRouter.get("/", protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const invoices = await Invoice.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json(invoices);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/invoices/:id — Get single invoice
invoiceRouter.get("/:id", protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.userId });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    return res.status(200).json(invoice);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});



// PUT /api/invoices/:id — Update invoice
invoiceRouter.put("/:id", protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    return res.status(200).json(invoice);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/invoices/:id — Delete invoice  
invoiceRouter.delete("/:id", protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    return res.status(200).json({ message: "Invoice deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});


// POST /api/invoices/upload — Upload invoice file

invoiceRouter.post("/upload", protect, upload.single("file"), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const mimeType = req.file.mimetype;
    const filePath = req.file.path;
    const fileUrl = `/uploads/${req.file.filename}`;

    const extracted = await extractInvoiceData(filePath, mimeType);

    const invoice = await Invoice.create({
      userId: req.userId,
      ...extracted,
      originalFilename: req.file.originalname,
      fileUrl,
      extractedByAI: true,
      status: "completed",
    });

    return res.status(201).json(invoice);
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Extraction failed", error: (error as Error).message });
  }
});
export default invoiceRouter;