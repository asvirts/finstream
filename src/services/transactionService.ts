// Mock transaction service for development
import { Transaction, JournalEntry } from "../types"

// Mock data
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "trans1",
    description: "Office Supplies Purchase",
    date: new Date("2024-01-15"),
    amount: 250.00,
    isReconciled: false,
    journalEntries: [
      {
        id: "entry1",
        transactionId: "trans1",
        accountId: "acc3", // Office Supplies expense
        type: "debit",
        amount: 250.00,
        description: "Office supplies from Staples",
      },
      {
        id: "entry2",
        transactionId: "trans1",
        accountId: "acc1", // Business Checking
        type: "credit",
        amount: 250.00,
        description: "Payment for office supplies",
      }
    ],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "trans2",
    description: "Client Payment Received",
    date: new Date("2024-01-14"),
    amount: 1500.00,
    isReconciled: true,
    journalEntries: [
      {
        id: "entry3",
        transactionId: "trans2",
        accountId: "acc1", // Business Checking
        type: "debit",
        amount: 1500.00,
        description: "Payment from ABC Corp",
      },
      {
        id: "entry4",
        transactionId: "trans2",
        accountId: "acc2", // Accounts Receivable
        type: "credit",
        amount: 1500.00,
        description: "Payment received for Invoice INV-1001",
      }
    ],
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14"),
  }
]

// Get all transactions with journal entries
export const getTransactions = async (params?: {
  startDate?: string
  endDate?: string
  accountId?: string
}): Promise<Transaction[]> => {
  console.log("Mock: Getting transactions", params)
  let transactions = [...MOCK_TRANSACTIONS]

  if (params?.startDate) {
    const startDate = new Date(params.startDate)
    transactions = transactions.filter(t => t.date >= startDate)
  }

  if (params?.endDate) {
    const endDate = new Date(params.endDate)
    transactions = transactions.filter(t => t.date <= endDate)
  }

  if (params?.accountId) {
    transactions = transactions.filter(t =>
      t.journalEntries.some(e => e.accountId === params.accountId)
    )
  }

  return transactions
}

// Get a specific transaction by ID
export const getTransactionById = async (id: string): Promise<Transaction> => {
  console.log("Mock: Getting transaction by ID", id)
  const transaction = MOCK_TRANSACTIONS.find(t => t.id === id)
  if (!transaction) {
    throw new Error("Transaction not found")
  }
  return transaction
}

// Create a new transaction with journal entries
export const createTransaction = async ({
  transaction,
  entries,
}: {
  transaction: Partial<Transaction>
  entries: Partial<JournalEntry>[]
}): Promise<Transaction> => {
  console.log("Mock: Creating transaction", transaction, entries)

  const newTransaction: Transaction = {
    id: `trans_${Date.now()}`,
    description: transaction.description || '',
    date: transaction.date || new Date(),
    amount: transaction.amount || 0,
    isReconciled: false,
    journalEntries: entries.map((entry, index) => ({
      id: `entry_${Date.now()}_${index}`,
      transactionId: `trans_${Date.now()}`,
      accountId: entry.accountId || '',
      type: entry.type || 'debit',
      amount: entry.amount || 0,
      description: entry.description || '',
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return newTransaction
}

// Update an existing transaction with journal entries
export const updateTransaction = async (
  id: string,
  {
    transaction,
    entries,
  }: { transaction: Partial<Transaction>; entries: Partial<JournalEntry>[] }
): Promise<Transaction> => {
  console.log("Mock: Updating transaction", id, transaction, entries)

  const existingTransaction = await getTransactionById(id)
  const updatedTransaction: Transaction = {
    ...existingTransaction,
    ...transaction,
    journalEntries: entries.map((entry, index) => ({
      id: entry.id || `entry_${Date.now()}_${index}`,
      transactionId: id,
      accountId: entry.accountId || '',
      type: entry.type || 'debit',
      amount: entry.amount || 0,
      description: entry.description || '',
    })),
    updatedAt: new Date(),
  }

  return updatedTransaction
}

// Delete a transaction and its entries
export const deleteTransaction = async (id: string): Promise<void> => {
  console.log("Mock: Deleting transaction", id)
}

// Reconcile or unreconcile a transaction
export const reconcileTransaction = async (
  id: string,
  isReconciled: boolean
): Promise<Transaction> => {
  console.log("Mock: Reconciling transaction", id, isReconciled)
  const transaction = await getTransactionById(id)
  return {
    ...transaction,
    isReconciled,
    updatedAt: new Date(),
  }
}