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
  Button,
  Badge
} from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useInvoices } from "../../context/AppContext"
import { Invoice, InvoiceStatus } from "../../types"
import { InvoiceActionTypes } from "../../context/reducers/invoiceReducer"
import { formatCurrency } from "../../utils/currencyUtils"
import { format, isAfter, isBefore, parseISO, subDays } from "date-fns"

const InvoicesScreen = () => {
  const { invoiceState, dispatch } = useInvoices()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [actionMenuVisible, setActionMenuVisible] = useState(false)

  useEffect(() => {
    // In a real app, this would fetch invoices from an API
    dispatch({ type: InvoiceActionTypes.FETCH_INVOICES_REQUEST })

    // Simulate API call with mock data
    setTimeout(() => {
      const mockInvoices = generateMockInvoices()
      dispatch({
        type: InvoiceActionTypes.FETCH_INVOICES_SUCCESS,
        payload: mockInvoices
      })
    }, 1000)
  }, [])

  const generateMockInvoices = (): Invoice[] => {
    const today = new Date()
    const invoices: Invoice[] = [
      {
        id: "inv1",
        invoiceNumber: "INV-1001",
        customerId: "cust1",
        customerName: "Acme Corporation",
        date: today,
        dueDate: subDays(today, -14), // 2 weeks later
        items: [
          {
            id: "item1",
            invoiceId: "inv1",
            description: "Web Development Services",
            quantity: 40,
            price: 100,
            amount: 4000,
            taxable: true
          },
          {
            id: "item2",
            invoiceId: "inv1",
            description: "Domain Registration",
            quantity: 1,
            price: 15,
            amount: 15,
            taxable: false
          }
        ],
        notes: "Payment due within 14 days.",
        terms: "Net 14",
        taxRate: 0.07,
        taxAmount: 280,
        subtotal: 4015,
        total: 4295,
        amountPaid: 0,
        status: InvoiceStatus.SENT,
        createdAt: today,
        updatedAt: today
      },
      {
        id: "inv2",
        invoiceNumber: "INV-1002",
        customerId: "cust2",
        customerName: "TechStart Inc.",
        date: subDays(today, 21),
        dueDate: subDays(today, 7),
        items: [
          {
            id: "item3",
            invoiceId: "inv2",
            description: "Mobile App Design",
            quantity: 1,
            price: 2500,
            amount: 2500,
            taxable: true
          }
        ],
        taxRate: 0.07,
        taxAmount: 175,
        subtotal: 2500,
        total: 2675,
        amountPaid: 1000,
        status: InvoiceStatus.PARTIALLY_PAID,
        createdAt: subDays(today, 21),
        updatedAt: subDays(today, 14)
      },
      {
        id: "inv3",
        invoiceNumber: "INV-1003",
        customerId: "cust3",
        customerName: "Global Solutions Ltd.",
        date: subDays(today, 45),
        dueDate: subDays(today, 15),
        items: [
          {
            id: "item4",
            invoiceId: "inv3",
            description: "SEO Services - Monthly",
            quantity: 1,
            price: 950,
            amount: 950,
            taxable: true
          },
          {
            id: "item5",
            invoiceId: "inv3",
            description: "Content Writing",
            quantity: 5,
            price: 120,
            amount: 600,
            taxable: true
          }
        ],
        taxRate: 0.07,
        taxAmount: 108.5,
        subtotal: 1550,
        total: 1658.5,
        amountPaid: 1658.5,
        status: InvoiceStatus.PAID,
        createdAt: subDays(today, 45),
        updatedAt: subDays(today, 30)
      },
      {
        id: "inv4",
        invoiceNumber: "INV-1004",
        customerId: "cust1",
        customerName: "Acme Corporation",
        date: subDays(today, 10),
        dueDate: subDays(today, -4),
        items: [
          {
            id: "item6",
            invoiceId: "inv4",
            description: "Website Maintenance",
            quantity: 10,
            price: 85,
            amount: 850,
            taxable: true
          }
        ],
        taxRate: 0.07,
        taxAmount: 59.5,
        subtotal: 850,
        total: 909.5,
        amountPaid: 0,
        status: InvoiceStatus.OVERDUE,
        createdAt: subDays(today, 10),
        updatedAt: subDays(today, 10)
      }
    ]
    return invoices
  }

  const handleInvoicePress = (invoice: Invoice) => {
    router.push({
      pathname: "/invoice-detail",
      params: { invoiceId: invoice.id }
    })
  }

  const handleInvoiceLongPress = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setActionMenuVisible(true)
  }

  const handleEdit = () => {
    setActionMenuVisible(false)
    if (selectedInvoice) {
      router.push({
        pathname: "/invoice-form",
        params: { invoiceId: selectedInvoice.id }
      })
    }
  }

  const handleDelete = () => {
    setActionMenuVisible(false)
    if (selectedInvoice) {
      // In a real app, this would call an API to delete the invoice
      dispatch({ type: InvoiceActionTypes.DELETE_INVOICE_REQUEST })

      // Simulate API call
      setTimeout(() => {
        dispatch({
          type: InvoiceActionTypes.DELETE_INVOICE_SUCCESS,
          payload: selectedInvoice.id
        })
      }, 500)
    }
  }

  const handleRecordPayment = () => {
    setActionMenuVisible(false)
    if (selectedInvoice) {
      // TODO: Create record payment screen
      console.log("Record payment for invoice:", selectedInvoice.id)
    }
  }

  const handleSendInvoice = () => {
    setActionMenuVisible(false)
    if (selectedInvoice) {
      // TODO: Create send invoice screen
      console.log("Send invoice:", selectedInvoice.id)
    }
  }

  const filteredInvoices = invoiceState.invoices.filter((invoice) => {
    // Apply search filter
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.items.some((item) =>
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )

    // Apply status filter
    const matchesStatus =
      statusFilter === "ALL" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sort invoices by date (newest first)
  const sortedInvoices = [...filteredInvoices].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  )

  const getStatusBadgeColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return "#757575" // Gray
      case InvoiceStatus.SENT:
        return "#2196F3" // Blue
      case InvoiceStatus.PARTIALLY_PAID:
        return "#FF9800" // Orange
      case InvoiceStatus.PAID:
        return "#4CAF50" // Green
      case InvoiceStatus.OVERDUE:
        return "#F44336" // Red
      case InvoiceStatus.CANCELLED:
        return "#9E9E9E" // Gray
      default:
        return "#757575" // Default Gray
    }
  }

  const renderStatusFilterChips = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip
          selected={statusFilter === "ALL"}
          onPress={() => setStatusFilter("ALL")}
          style={styles.filterChip}
        >
          All
        </Chip>
        <Chip
          selected={statusFilter === InvoiceStatus.DRAFT}
          onPress={() => setStatusFilter(InvoiceStatus.DRAFT)}
          style={styles.filterChip}
        >
          Draft
        </Chip>
        <Chip
          selected={statusFilter === InvoiceStatus.SENT}
          onPress={() => setStatusFilter(InvoiceStatus.SENT)}
          style={styles.filterChip}
        >
          Sent
        </Chip>
        <Chip
          selected={statusFilter === InvoiceStatus.PARTIALLY_PAID}
          onPress={() => setStatusFilter(InvoiceStatus.PARTIALLY_PAID)}
          style={styles.filterChip}
        >
          Partially Paid
        </Chip>
        <Chip
          selected={statusFilter === InvoiceStatus.PAID}
          onPress={() => setStatusFilter(InvoiceStatus.PAID)}
          style={styles.filterChip}
        >
          Paid
        </Chip>
        <Chip
          selected={statusFilter === InvoiceStatus.OVERDUE}
          onPress={() => setStatusFilter(InvoiceStatus.OVERDUE)}
          style={[styles.filterChip, styles.overdueChip]}
        >
          Overdue
        </Chip>
      </ScrollView>
    </View>
  )

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <TouchableOpacity
      style={styles.invoiceItem}
      onPress={() => handleInvoicePress(item)}
      onLongPress={() => handleInvoiceLongPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.invoiceHeader}>
        <View>
          <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
          <Text style={styles.customerName}>{item.customerName}</Text>
        </View>
        <View>
          <Badge
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBadgeColor(item.status) }
            ]}
          >
            {item.status.replace("_", " ")}
          </Badge>
          <Text style={styles.invoiceTotal}>{formatCurrency(item.total)}</Text>
        </View>
      </View>

      <View style={styles.invoiceFooter}>
        <Text style={styles.dateText}>
          Created: {format(item.date, "MMM d, yyyy")}
        </Text>
        <Text
          style={[
            styles.dueDateText,
            item.status === InvoiceStatus.OVERDUE && styles.overdueDateText
          ]}
        >
          Due: {format(item.dueDate, "MMM d, yyyy")}
        </Text>
      </View>

      {item.status === InvoiceStatus.PARTIALLY_PAID && (
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentText}>
            Paid: {formatCurrency(item.amountPaid)} of{" "}
            {formatCurrency(item.total)}
          </Text>
          <View style={styles.paymentBar}>
            <View
              style={[
                styles.paymentBarFill,
                { width: `${(item.amountPaid / item.total) * 100}%` }
              ]}
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  )

  if (invoiceState.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading invoices...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Invoices</Title>
        <Searchbar
          placeholder="Search invoices"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {renderStatusFilterChips()}
      </View>

      {sortedInvoices.length > 0 ? (
        <FlatList
          data={sortedInvoices}
          renderItem={renderInvoiceItem}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={Divider}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={64}
            color="#ccc"
          />
          <Text style={styles.emptyText}>No invoices found</Text>
          <Text style={styles.emptySuggestion}>
            {searchQuery || statusFilter !== "ALL"
              ? "Try changing your search or filters"
              : "Tap the + button to create an invoice"}
          </Text>
        </View>
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => router.push("/invoice-form")}
        label="New Invoice"
      />

      <Menu
        visible={actionMenuVisible}
        onDismiss={() => setActionMenuVisible(false)}
        anchor={{ x: 100, y: 100 }}
      >
        <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
        <Menu.Item
          onPress={handleSendInvoice}
          title="Send"
          leadingIcon="email-send"
        />
        <Menu.Item
          onPress={handleRecordPayment}
          title="Record Payment"
          leadingIcon="cash"
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
  overdueChip: {
    borderColor: "#F44336"
  },
  listContent: {
    paddingBottom: 80
  },
  invoiceItem: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "bold"
  },
  customerName: {
    fontSize: 14,
    color: "#757575",
    marginTop: 2
  },
  statusBadge: {
    alignSelf: "flex-end",
    marginBottom: 4
  },
  invoiceTotal: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right"
  },
  invoiceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8
  },
  dateText: {
    fontSize: 12,
    color: "#757575"
  },
  dueDateText: {
    fontSize: 12,
    color: "#757575"
  },
  overdueDateText: {
    color: "#F44336",
    fontWeight: "bold"
  },
  paymentInfo: {
    marginTop: 8
  },
  paymentText: {
    fontSize: 12,
    color: "#FF9800",
    marginBottom: 4
  },
  paymentBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2
  },
  paymentBarFill: {
    height: "100%",
    backgroundColor: "#FF9800",
    borderRadius: 2
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

export default InvoicesScreen
