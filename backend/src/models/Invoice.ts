import mongoose,{Document,Schema} from "mongoose";
export interface ILineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface IInvoice extends Document{
  userId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  originalFilename?: string;
  vendorName: string;
  vendorAddress?: string;
  customerName?: string;
  customerAddress?: string;
  subtotal?: number;
  taxAmount?: number;
  amountDue: number;
  currency: string;
  invoiceDate: Date;
  dueDate?: Date;
  items: ILineItem[];
  status: "pending" | "processing" | "completed" | "failed" | "verified" | "paid" | "archived";
  extractedByAI: boolean;
  fileUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 
// i am telling ts that->
//"An IInvoice object must contain everything that a Mongoose Document contains, plus all these invoice-specific fields."
// now what a mongoose document contains?->
//_id
// save()
// deleteOne()
// isModified()
// toObject()
// toJSON()  and many more 

const LineItemSchema = new Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
});




const InvoiceSchema: Schema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    invoiceNumber: { type: String, default: "" },
    originalFilename: { type: String },
    vendorName: { type: String, required: true },
    vendorAddress: { type: String },
    customerName: { type: String },
    customerAddress: { type: String },
    subtotal: { type: Number },
    taxAmount: { type: Number },
    amountDue: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    invoiceDate: { type: Date },
    dueDate: { type: Date },
    items: { type: [LineItemSchema], default: [] },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "verified", "paid", "archived"],
      default: "pending",
    },
    extractedByAI: { type: Boolean, default: false },
    fileUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<IInvoice>("Invoice", InvoiceSchema);
//TypeScript generic.
//"Documents returned by this model should be treated as IInvoice.