import { ObjectId } from "mongodb"

// Invoice model schema
export const InvoiceSchema = {
  name: "invoices",
  fields: {
    _id: "ObjectId",
    userId: "ObjectId (ref: users)",
    invoiceNumber: "String (unique)",
    plan: "String (basic, premium)",
    amount: "Number",
    currency: "String (NGN)",
    status: "String (pending, paid, failed)",
    paystackReference: "String",
    paidAt: "Date",
    createdAt: "Date",
  },
  indexes: [{ userId: 1 }, { invoiceNumber: 1 }, { paystackReference: 1 }],
}

// Helper functions for invoice operations
export const createInvoice = async (db, invoiceData) => {
  const invoices = db.collection("invoices")

  // Generate invoice number
  const count = await invoices.countDocuments()
  const invoiceNumber = `INV-${String(count + 1).padStart(6, "0")}`

  const result = await invoices.insertOne({
    ...invoiceData,
    invoiceNumber,
    currency: "NGN",
    status: "pending",
    createdAt: new Date(),
  })

  return { ...invoiceData, invoiceNumber, _id: result.insertedId }
}

export const updateInvoiceStatus = async (db, reference, status, paidAt = null) => {
  const invoices = db.collection("invoices")
  const updateData = {
    status,
    updatedAt: new Date(),
  }

  if (paidAt) {
    updateData.paidAt = paidAt
  }

  return await invoices.updateOne({ paystackReference: reference }, { $set: updateData })
}

export const getUserInvoices = async (db, userId, limit = 10) => {
  const invoices = db.collection("invoices")
  return await invoices
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
}

export const getInvoiceByReference = async (db, reference) => {
  const invoices = db.collection("invoices")
  return await invoices.findOne({ paystackReference: reference })
}
