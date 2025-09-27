import { convex } from "./convex"
import { Invoice, InvoiceItem, InvoiceStatus, Customer } from "../types"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"

// Mock user ID for development - in a real app, this would come from authentication
const MOCK_USER_ID = "mock-user-id" as Id<"users">

// Helper function to convert Convex invoice to app Invoice type
const convertConvexInvoice = (convexInvoice: any): Invoice => ({
  ...convexInvoice,
  date: new Date(convexInvoice.date),
  dueDate: new Date(convexInvoice.dueDate),
  createdAt: new Date(convexInvoice.createdAt),
  updatedAt: new Date(convexInvoice.updatedAt),
})

// Get all invoices with optional filters
export const getInvoices = async (params?: {
  status?: InvoiceStatus
  startDate?: string
  endDate?: string
  customerId?: string
}): Promise<Invoice[]> => {
  try {
    const convexInvoices = await convex.query(api.invoices.getInvoices, {
      userId: MOCK_USER_ID
    })

    let invoices = convexInvoices.map(convertConvexInvoice)

    // Apply filters
    if (params?.status) {
      invoices = invoices.filter(inv => inv.status === params.status)
    }
    if (params?.startDate) {
      const startDate = new Date(params.startDate)
      invoices = invoices.filter(inv => inv.date >= startDate)
    }
    if (params?.endDate) {
      const endDate = new Date(params.endDate)
      invoices = invoices.filter(inv => inv.date <= endDate)
    }
    if (params?.customerId) {
      invoices = invoices.filter(inv => inv.customerId === params.customerId)
    }

    return invoices
  } catch (error) {
    console.error("Error fetching invoices:", error)
    throw error
  }
}

// Get a specific invoice by ID
export const getInvoiceById = async (id: string): Promise<Invoice> => {
  try {
    const convexInvoice = await convex.query(api.invoices.getInvoice, {
      id: id as Id<"invoices">
    })

    if (!convexInvoice) {
      throw new Error("Invoice not found")
    }

    return convertConvexInvoice(convexInvoice)
  } catch (error) {
    console.error("Error fetching invoice:", error)
    throw error
  }
}

// Create a new invoice with items
export const createInvoice = async ({
  invoice,
  items,
}: {
  invoice: Partial<Invoice>
  items: Partial<InvoiceItem>[]
}): Promise<Invoice> => {
  try {
    // Convert items to the expected format
    const formattedItems = items.map(item => ({
      id: item.id || `item_${Date.now()}_${Math.random()}`,
      invoiceId: invoice.id || '',
      description: item.description || '',
      quantity: item.quantity || 0,
      price: item.price || 0,
      amount: item.amount || 0,
      taxable: item.taxable || false,
    }))

    const invoiceId = await convex.mutation(api.invoices.createInvoice, {
      userId: MOCK_USER_ID,
      invoiceNumber: invoice.invoiceNumber || `INV-${Date.now()}`,
      customerId: invoice.customerId || '',
      customerName: invoice.customerName || '',
      date: invoice.date?.getTime() || Date.now(),
      dueDate: invoice.dueDate?.getTime() || Date.now(),
      items: formattedItems,
      notes: invoice.notes,
      terms: invoice.terms,
      taxRate: invoice.taxRate || 0,
      taxAmount: invoice.taxAmount || 0,
      subtotal: invoice.subtotal || 0,
      total: invoice.total || 0,
      amountPaid: invoice.amountPaid || 0,
      status: invoice.status || InvoiceStatus.DRAFT,
    })

    return await getInvoiceById(invoiceId)
  } catch (error) {
    console.error("Error creating invoice:", error)
    throw error
  }
}

// Update an existing invoice with items
export const updateInvoice = async (
  id: string,
  {
    invoice,
    items,
  }: { invoice: Partial<Invoice>; items: Partial<InvoiceItem>[] }
): Promise<Invoice> => {
  try {
    const updateData: any = {}

    if (invoice.invoiceNumber) updateData.invoiceNumber = invoice.invoiceNumber
    if (invoice.customerId) updateData.customerId = invoice.customerId
    if (invoice.customerName) updateData.customerName = invoice.customerName
    if (invoice.date) updateData.date = invoice.date.getTime()
    if (invoice.dueDate) updateData.dueDate = invoice.dueDate.getTime()
    if (invoice.notes !== undefined) updateData.notes = invoice.notes
    if (invoice.terms !== undefined) updateData.terms = invoice.terms
    if (invoice.taxRate !== undefined) updateData.taxRate = invoice.taxRate
    if (invoice.taxAmount !== undefined) updateData.taxAmount = invoice.taxAmount
    if (invoice.subtotal !== undefined) updateData.subtotal = invoice.subtotal
    if (invoice.total !== undefined) updateData.total = invoice.total
    if (invoice.amountPaid !== undefined) updateData.amountPaid = invoice.amountPaid
    if (invoice.status) updateData.status = invoice.status

    // Update items if provided
    if (items && items.length > 0) {
      const formattedItems = items.map(item => ({
        id: item.id || `item_${Date.now()}_${Math.random()}`,
        invoiceId: id,
        description: item.description || '',
        quantity: item.quantity || 0,
        price: item.price || 0,
        amount: item.amount || 0,
        taxable: item.taxable || false,
      }))
      updateData.items = formattedItems
    }

    await convex.mutation(api.invoices.updateInvoice, {
      id: id as Id<"invoices">,
      ...updateData,
    })

    return await getInvoiceById(id)
  } catch (error) {
    console.error("Error updating invoice:", error)
    throw error
  }
}

// Delete an invoice and its items
export const deleteInvoice = async (id: string): Promise<void> => {
  try {
    await convex.mutation(api.invoices.deleteInvoice, {
      id: id as Id<"invoices">
    })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    throw error
  }
}

// Mark invoice status
export const markInvoiceAsSent = async (id: string): Promise<Invoice> => {
  try {
    await convex.mutation(api.invoices.updateInvoiceStatus, {
      id: id as Id<"invoices">,
      status: InvoiceStatus.SENT,
    })
    return await getInvoiceById(id)
  } catch (error) {
    console.error("Error marking invoice as sent:", error)
    throw error
  }
}

export const markInvoiceAsPaid = async (id: string): Promise<Invoice> => {
  try {
    const invoice = await getInvoiceById(id)
    await convex.mutation(api.invoices.updateInvoiceStatus, {
      id: id as Id<"invoices">,
      status: InvoiceStatus.PAID,
      amountPaid: invoice.total,
    })
    return await getInvoiceById(id)
  } catch (error) {
    console.error("Error marking invoice as paid:", error)
    throw error
  }
}

// Mock customer functions - in a real app, these would use Convex customer queries
export const getCustomers = async (): Promise<Customer[]> => {
  // Mock data for now
  return [
    {
      id: "cust1",
      name: "Acme Corporation",
      email: "billing@acme.com",
      phone: "+1-555-0123",
      address: "123 Business St, City, State 12345",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "cust2",
      name: "TechStart Inc.",
      email: "accounts@techstart.com",
      phone: "+1-555-0456",
      address: "456 Innovation Ave, Tech City, TC 67890",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]
}

export const getCustomerById = async (id: string): Promise<Customer> => {
  const customers = await getCustomers()
  const customer = customers.find(c => c.id === id)
  if (!customer) {
    throw new Error("Customer not found")
  }
  return customer
}

export const createCustomer = async (
  customerData: Partial<Customer>
): Promise<Customer> => {
  // Mock implementation
  const customer: Customer = {
    id: `cust_${Date.now()}`,
    name: customerData.name || '',
    email: customerData.email,
    phone: customerData.phone,
    address: customerData.address,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  return customer
}

export const updateCustomer = async (
  id: string,
  customerData: Partial<Customer>
): Promise<Customer> => {
  // Mock implementation
  const existingCustomer = await getCustomerById(id)
  return {
    ...existingCustomer,
    ...customerData,
    updatedAt: new Date(),
  }
}

export const deleteCustomer = async (id: string): Promise<void> => {
  // Mock implementation
  console.log(`Deleted customer ${id}`)
}

export const getCustomerInvoices = async (
  customerId: string
): Promise<Invoice[]> => {
  try {
    return await getInvoices({ customerId })
  } catch (error) {
    console.error("Error fetching customer invoices:", error)
    throw error
  }
}