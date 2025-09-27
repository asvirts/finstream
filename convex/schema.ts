import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    isOnboarded: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  accounts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.string(),
    balance: v.number(),
    currency: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  transactions: defineTable({
    userId: v.id("users"),
    accountId: v.id("accounts"),
    amount: v.number(),
    description: v.string(),
    category: v.string(),
    type: v.string(), // "income" | "expense"
    date: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_account", ["accountId"]),

  invoices: defineTable({
    userId: v.id("users"),
    invoiceNumber: v.string(),
    customerId: v.string(),
    customerName: v.string(),
    date: v.number(),
    dueDate: v.number(),
    items: v.array(v.object({
      id: v.string(),
      invoiceId: v.string(),
      description: v.string(),
      quantity: v.number(),
      price: v.number(),
      amount: v.number(),
      taxable: v.boolean(),
    })),
    notes: v.optional(v.string()),
    terms: v.optional(v.string()),
    taxRate: v.number(),
    taxAmount: v.number(),
    subtotal: v.number(),
    total: v.number(),
    amountPaid: v.number(),
    status: v.string(), // "draft" | "sent" | "partially_paid" | "paid" | "overdue" | "cancelled"
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"]),

  customers: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});