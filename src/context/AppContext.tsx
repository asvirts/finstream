import React, { createContext, useReducer, useContext, ReactNode } from "react"
import {
  authReducer,
  initialAuthState,
  AuthState,
  AuthAction
} from "./reducers/authReducer"
import {
  accountReducer,
  initialAccountState,
  AccountState,
  AccountAction
} from "./reducers/accountReducer"
import {
  transactionReducer,
  initialTransactionState,
  TransactionState,
  TransactionAction
} from "./reducers/transactionReducer"
import {
  invoiceReducer,
  initialInvoiceState,
  InvoiceState,
  InvoiceAction
} from "./reducers/invoiceReducer"

// Define the global app state interface that combines all state slices
export interface AppState {
  auth: AuthState
  account: AccountState
  transaction: TransactionState
  invoice: InvoiceState
}

// Define the app action types as a union of all possible actions
export type AppAction =
  | AuthAction
  | AccountAction
  | TransactionAction
  | InvoiceAction

// Define a separate type for dispatch that accepts any action
export type AppDispatch = (action: AppAction) => void

// Create the initial state
const initialAppState: AppState = {
  auth: initialAuthState,
  account: initialAccountState,
  transaction: initialTransactionState,
  invoice: initialInvoiceState
}

// Create the app context with initial values
const AppContext = createContext<{
  state: AppState
  dispatch: AppDispatch
}>({
  state: initialAppState,
  dispatch: () => null
})

// Create a combined reducer that routes actions to the appropriate sub-reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  return {
    auth: authReducer(state.auth, action as AuthAction),
    account: accountReducer(state.account, action as AccountAction),
    transaction: transactionReducer(
      state.transaction,
      action as TransactionAction
    ),
    invoice: invoiceReducer(state.invoice, action as InvoiceAction)
  }
}

// Create the app provider component
interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// Create a custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext)

  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }

  return context
}

// Export custom hooks for each slice of state to make component code cleaner
export const useAuth = () => {
  const { state, dispatch } = useAppContext()
  return { authState: state.auth, dispatch }
}

export const useAccounts = () => {
  const { state, dispatch } = useAppContext()
  return { accountState: state.account, dispatch }
}

export const useTransactions = () => {
  const { state, dispatch } = useAppContext()
  return { transactionState: state.transaction, dispatch }
}

export const useInvoices = () => {
  const { state, dispatch } = useAppContext()
  return { invoiceState: state.invoice, dispatch }
}

