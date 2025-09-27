// Mock account service for development
import { Account, AccountType, AccountSubtype } from "../types"

// Mock data
const MOCK_ACCOUNTS: Account[] = [
  {
    id: "acc1",
    name: "Business Checking",
    type: AccountType.ASSET,
    subtype: AccountSubtype.BANK,
    balance: 15420.50,
    isArchived: false,
    description: "Main business checking account",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "acc2",
    name: "Accounts Receivable",
    type: AccountType.ASSET,
    subtype: AccountSubtype.ACCOUNTS_RECEIVABLE,
    balance: 8500.00,
    isArchived: false,
    description: "Outstanding customer invoices",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "acc3",
    name: "Office Supplies",
    type: AccountType.EXPENSE,
    subtype: AccountSubtype.OPERATING_EXPENSE,
    balance: 250.00,
    isArchived: false,
    description: "Office supplies and materials",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-05"),
  }
]

// Get all accounts
export const getAccounts = async (): Promise<Account[]> => {
  console.log("Mock: Getting all accounts")
  return MOCK_ACCOUNTS.filter(acc => !acc.isArchived)
}

// Get a specific account by ID
export const getAccountById = async (id: string): Promise<Account> => {
  console.log("Mock: Getting account by ID", id)
  const account = MOCK_ACCOUNTS.find(acc => acc.id === id)
  if (!account) {
    throw new Error("Account not found")
  }
  return account
}

// Create a new account
export const createAccount = async (
  accountData: Partial<Account>
): Promise<Account> => {
  console.log("Mock: Creating account", accountData)
  const newAccount: Account = {
    id: `acc_${Date.now()}`,
    name: accountData.name || '',
    type: accountData.type || AccountType.ASSET,
    subtype: accountData.subtype || AccountSubtype.OTHER_ASSET,
    balance: accountData.balance || 0,
    isArchived: false,
    description: accountData.description,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  return newAccount
}

// Update an existing account
export const updateAccount = async (
  id: string,
  accountData: Partial<Account>
): Promise<Account> => {
  console.log("Mock: Updating account", id, accountData)
  const existingAccount = await getAccountById(id)
  return {
    ...existingAccount,
    ...accountData,
    updatedAt: new Date(),
  }
}

// Delete an account
export const deleteAccount = async (id: string): Promise<void> => {
  console.log("Mock: Deleting account", id)
}

// Archive an account
export const archiveAccount = async (id: string): Promise<Account> => {
  console.log("Mock: Archiving account", id)
  const account = await getAccountById(id)
  return { ...account, isArchived: true, updatedAt: new Date() }
}

// Restore an archived account
export const restoreAccount = async (id: string): Promise<Account> => {
  console.log("Mock: Restoring account", id)
  const account = await getAccountById(id)
  return { ...account, isArchived: false, updatedAt: new Date() }
}

// Get all account types with their subtypes
export const getAccountTypes = async (): Promise<{
  types: AccountType[]
  subtypes: Record<AccountType, AccountSubtype[]>
}> => {
  const types = Object.values(AccountType)
  const subtypes: Record<AccountType, AccountSubtype[]> = {
    [AccountType.ASSET]: [
      AccountSubtype.CASH,
      AccountSubtype.BANK,
      AccountSubtype.ACCOUNTS_RECEIVABLE,
      AccountSubtype.INVENTORY,
      AccountSubtype.FIXED_ASSET,
      AccountSubtype.OTHER_ASSET,
    ],
    [AccountType.LIABILITY]: [
      AccountSubtype.ACCOUNTS_PAYABLE,
      AccountSubtype.CREDIT_CARD,
      AccountSubtype.LOAN,
      AccountSubtype.TAX_PAYABLE,
      AccountSubtype.OTHER_LIABILITY,
    ],
    [AccountType.EQUITY]: [
      AccountSubtype.RETAINED_EARNINGS,
      AccountSubtype.OWNER_EQUITY,
    ],
    [AccountType.INCOME]: [AccountSubtype.SALES, AccountSubtype.OTHER_INCOME],
    [AccountType.EXPENSE]: [
      AccountSubtype.OPERATING_EXPENSE,
      AccountSubtype.PAYROLL,
      AccountSubtype.TAX_EXPENSE,
      AccountSubtype.OTHER_EXPENSE,
    ],
  }
  return { types, subtypes }
}

// Get accounts by type
export const getAccountsByType = async (
  type: AccountType
): Promise<Account[]> => {
  console.log("Mock: Getting accounts by type", type)
  return MOCK_ACCOUNTS.filter(acc => acc.type === type && !acc.isArchived)
}

// Get chart of accounts summary with balances
export const getChartOfAccountsSummary = async (): Promise<{
  assets: number
  liabilities: number
  equity: number
  income: number
  expenses: number
}> => {
  console.log("Mock: Getting chart of accounts summary")
  const summary = {
    assets: 0,
    liabilities: 0,
    equity: 0,
    income: 0,
    expenses: 0,
  }

  MOCK_ACCOUNTS.forEach((acc) => {
    if (acc.isArchived) return
    switch (acc.type) {
      case AccountType.ASSET:
        summary.assets += acc.balance
        break
      case AccountType.LIABILITY:
        summary.liabilities += acc.balance
        break
      case AccountType.EQUITY:
        summary.equity += acc.balance
        break
      case AccountType.INCOME:
        summary.income += acc.balance
        break
      case AccountType.EXPENSE:
        summary.expenses += acc.balance
        break
    }
  })
  return summary
}