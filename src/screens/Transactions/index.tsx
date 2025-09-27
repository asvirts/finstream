import React, { useState, useEffect } from "react"
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView
} from "react-native"
import {
  Text,
  Title,
  Searchbar,
  Chip,
  Divider,
  FAB,
  ActivityIndicator,
  Menu,
  IconButton,
  Button
} from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
// import { useNavigation } from "@react-navigation/native"
import { useTransactions } from "../../context/AppContext"
import { Transaction } from "../../types"
import { formatCurrency } from "../../utils/currencyUtils"
import TransactionItem from "../../components/ui/TransactionItem"
import {
  format,
  isAfter,
  isBefore,
  parseISO,
  subDays,
  startOfMonth,
  endOfMonth
} from "date-fns"

const TransactionsScreen = () => {
  const { transactionState, dispatch } = useTransactions()
  // const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "week" | "month" | "custom"
  >("all")
  const [filterMenuVisible, setFilterMenuVisible] = useState(false)
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)
  const [actionMenuVisible, setActionMenuVisible] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  useEffect(() => {
    // In a real app, this would fetch transactions from an API
    dispatch({ type: "FETCH_TRANSACTIONS_REQUEST" })

    // Simulate API call with mock data
    setTimeout(() => {
      const mockTransactions = generateMockTransactions()
      dispatch({
        type: "FETCH_TRANSACTIONS_SUCCESS",
        payload: mockTransactions
      })
    }, 1000)
  }, [])

  const generateMockTransactions = (): Transaction[] => {
    const today = new Date()
    const transactions: Transaction[] = [
      {
        id: "t1",
        date: today,
        description: "Client Payment - ABC Corp",
        reference: "INV-1001",
        entries: [
          {
            id: "e1",
            transactionId: "t1",
            accountId: "a1",
            amount: 1500,
            memo: "Payment for services"
          },
          {
            id: "e2",
            transactionId: "t1",
            accountId: "a2",
            amount: -1500,
            memo: "Revenue recognition"
          }
        ],
        isReconciled: true,
        createdAt: today,
        updatedAt: today
      },
      {
        id: "t2",
        date: subDays(today, 1),
        description: "Office Supplies",
        reference: "PO-245",
        entries: [
          {
            id: "e3",
            transactionId: "t2",
            accountId: "a3",
            amount: 125.99,
            memo: "Office supplies"
          },
          {
            id: "e4",
            transactionId: "t2",
            accountId: "a1",
            amount: -125.99,
            memo: "Bank payment"
          }
        ],
        isReconciled: false,
        createdAt: subDays(today, 1),
        updatedAt: subDays(today, 1)
      },
      {
        id: "t3",
        date: subDays(today, 2),
        description: "Rent Payment",
        reference: "RENT-MAY",
        entries: [
          {
            id: "e5",
            transactionId: "t3",
            accountId: "a3",
            amount: 1200,
            memo: "Monthly office rent"
          },
          {
            id: "e6",
            transactionId: "t3",
            accountId: "a1",
            amount: -1200,
            memo: "Bank payment"
          }
        ],
        isReconciled: false,
        createdAt: subDays(today, 2),
        updatedAt: subDays(today, 2)
      }
    ]
    return transactions
  }

  const handleTransactionPress = (transaction: Transaction) => {
    // TODO: Create transaction detail screen
    console.log("Transaction pressed:", transaction.id)
  }

  const handleTransactionLongPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setActionMenuVisible(true)
  }

  const handleEdit = () => {
    setActionMenuVisible(false)
    if (selectedTransaction) {
      navigation.navigate("EditTransaction", {
        transactionId: selectedTransaction.id
      })
    }
  }

  const handleDelete = () => {
    setActionMenuVisible(false)
    if (selectedTransaction) {
      // In a real app, this would call an API to delete the transaction
      dispatch({ type: "DELETE_TRANSACTION_REQUEST" })

      // Simulate API call
      setTimeout(() => {
        dispatch({
          type: "DELETE_TRANSACTION_SUCCESS",
          payload: selectedTransaction.id
        })
      }, 500)
    }
  }

  const handleReverse = () => {
    setActionMenuVisible(false)
    if (selectedTransaction) {
      // Navigate to create a reversing entry
      navigation.navigate("ReverseTransaction", {
        transactionId: selectedTransaction.id,
        date: new Date()
      })
    }
  }

  const applyDateFilter = (transaction: Transaction): boolean => {
    const today = new Date()

    switch (dateFilter) {
      case "today":
        return (
          format(transaction.date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
        )

      case "week":
        const oneWeekAgo = subDays(today, 7)
        return isAfter(transaction.date, oneWeekAgo)

      case "month":
        const firstOfMonth = startOfMonth(today)
        const lastOfMonth = endOfMonth(today)
        return (
          isAfter(transaction.date, firstOfMonth) &&
          isBefore(transaction.date, lastOfMonth)
        )

      case "custom":
        if (!startDate && !endDate) return true

        if (startDate && endDate) {
          return (
            isAfter(transaction.date, startDate) &&
            isBefore(transaction.date, endDate)
          )
        }

        if (startDate && !endDate) {
          return isAfter(transaction.date, startDate)
        }

        if (!startDate && endDate) {
          return isBefore(transaction.date, endDate)
        }

        return true

      case "all":
      default:
        return true
    }
  }

  const filteredTransactions = transactionState.transactions.filter(
    (transaction) => {
      // Apply search filter
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.reference
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.entries.some((entry) =>
          entry.memo?.toLowerCase().includes(searchQuery.toLowerCase())
        )

      // Apply date filter
      const matchesDateFilter = applyDateFilter(transaction)

      return matchesSearch && matchesDateFilter
    }
  )

  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  )

  const renderDateFilterChips = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip
          selected={dateFilter === "all"}
          onPress={() => setDateFilter("all")}
          style={styles.filterChip}
        >
          All
        </Chip>
        <Chip
          selected={dateFilter === "today"}
          onPress={() => setDateFilter("today")}
          style={styles.filterChip}
        >
          Today
        </Chip>
        <Chip
          selected={dateFilter === "week"}
          onPress={() => setDateFilter("week")}
          style={styles.filterChip}
        >
          This Week
        </Chip>
        <Chip
          selected={dateFilter === "month"}
          onPress={() => setDateFilter("month")}
          style={styles.filterChip}
        >
          This Month
        </Chip>
        <Chip
          selected={dateFilter === "custom"}
          onPress={() => setDateFilter("custom")}
          style={styles.filterChip}
        >
          Custom Range
        </Chip>
      </ScrollView>
    </View>
  )

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    // Calculate total amount of the transaction
    const amount = item.entries.reduce(
      (sum, entry) => (entry.amount > 0 ? sum + entry.amount : sum),
      0
    )

    return (
      <TransactionItem
        transaction={item}
        onPress={() => handleTransactionPress(item)}
        onLongPress={() => handleTransactionLongPress(item)}
      />
    )
  }

  if (transactionState.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Transactions</Title>
        <Searchbar
          placeholder="Search transactions"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {renderDateFilterChips()}
      </View>

      {sortedTransactions.length > 0 ? (
        <FlatList
          data={sortedTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={Divider}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="receipt-text-outline"
            size={64}
            color="#ccc"
          />
          <Text style={styles.emptyText}>No transactions found</Text>
          <Text style={styles.emptySuggestion}>
            {searchQuery || dateFilter !== "all"
              ? "Try changing your search or filters"
              : "Tap the + button to add a transaction"}
          </Text>
        </View>
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate("NewTransaction")}
        label="Add Transaction"
      />

      <Menu
        visible={actionMenuVisible}
        onDismiss={() => setActionMenuVisible(false)}
        anchor={{ x: 100, y: 100 }}
      >
        <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
        <Menu.Item
          onPress={handleReverse}
          title="Reverse"
          leadingIcon="refresh"
        />
        <Divider />
        <Menu.Item onPress={handleDelete} title="Delete" leadingIcon="delete" />
      </Menu>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0"
  },
  title: {
    marginLeft: 16,
    marginBottom: 16
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 1,
    backgroundColor: "#f9f9f9"
  },
  filterContainer: {
    paddingHorizontal: 8,
    marginBottom: 8
  },
  filterChip: {
    marginHorizontal: 4
  },
  listContent: {
    paddingBottom: 80
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16
  },
  emptySuggestion: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0
  }
})

export default TransactionsScreen
