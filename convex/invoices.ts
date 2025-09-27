import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all invoices for a user
export const getInvoices = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get a single invoice by ID
export const getInvoice = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new invoice
export const createInvoice = mutation({
  args: {
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
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("invoices", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an existing invoice
export const updateInvoice = mutation({
  args: {
    id: v.id("invoices"),
    invoiceNumber: v.optional(v.string()),
    customerId: v.optional(v.string()),
    customerName: v.optional(v.string()),
    date: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    items: v.optional(v.array(v.object({
      id: v.string(),
      invoiceId: v.string(),
      description: v.string(),
      quantity: v.number(),
      price: v.number(),
      amount: v.number(),
      taxable: v.boolean(),
    }))),
    notes: v.optional(v.string()),
    terms: v.optional(v.string()),
    taxRate: v.optional(v.number()),
    taxAmount: v.optional(v.number()),
    subtotal: v.optional(v.number()),
    total: v.optional(v.number()),
    amountPaid: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete an invoice
export const deleteInvoice = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Update invoice status
export const updateInvoiceStatus = mutation({
  args: {
    id: v.id("invoices"),
    status: v.string(),
    amountPaid: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.amountPaid !== undefined) {
      updates.amountPaid = args.amountPaid;
    }

    await ctx.db.patch(args.id, updates);
  },
});