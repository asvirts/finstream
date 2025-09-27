import React from "react"
import { View, StyleSheet, ScrollView } from "react-native"
import { Text, Title, Button, Divider, Card } from "react-native-paper"
import { useLocalSearchParams, router } from "expo-router"
import { useInvoices } from "../../context/AppContext"
import { formatCurrency } from "../../utils/currencyUtils"
import { format } from "date-fns"
import { InvoiceStatus } from "../../types"

const InvoiceDetailScreen = () => {
  const { invoiceId } = useLocalSearchParams<{ invoiceId: string }>()
  const { invoiceState } = useInvoices()

  const invoice = invoiceState.invoices.find(inv => inv.id === invoiceId)

  if (!invoice) {
    return (
      <View style={styles.container}>
        <Text>Invoice not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    )
  }

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT: return "#757575"
      case InvoiceStatus.SENT: return "#2196F3"
      case InvoiceStatus.PARTIALLY_PAID: return "#FF9800"
      case InvoiceStatus.PAID: return "#4CAF50"
      case InvoiceStatus.OVERDUE: return "#F44336"
      case InvoiceStatus.CANCELLED: return "#9E9E9E"
      default: return "#757575"
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.invoiceNumber}>{invoice.invoiceNumber}</Title>
          <Text style={[styles.status, { color: getStatusColor(invoice.status) }]}>
            {invoice.status.replace("_", " ").toUpperCase()}
          </Text>
          <Text style={styles.customerName}>{invoice.customerName}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.dateCard}>
        <Card.Content>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Invoice Date:</Text>
            <Text style={styles.dateValue}>{format(invoice.date, "MMM d, yyyy")}</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Due Date:</Text>
            <Text style={styles.dateValue}>{format(invoice.dueDate, "MMM d, yyyy")}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.itemsCard}>
        <Card.Content>
          <Title>Items</Title>
          {invoice.items.map((item, index) => (
            <View key={item.id}>
              <View style={styles.itemRow}>
                <View style={styles.itemDescription}>
                  <Text style={styles.itemTitle}>{item.description}</Text>
                  <Text style={styles.itemDetails}>
                    {item.quantity} × {formatCurrency(item.price)}
                  </Text>
                </View>
                <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
              </View>
              {index < invoice.items.length - 1 && <Divider style={styles.itemDivider} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.totalCard}>
        <Card.Content>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({(invoice.taxRate * 100).toFixed(1)}%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.taxAmount)}</Text>
          </View>
          <Divider />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
          </View>
          {invoice.amountPaid > 0 && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Amount Paid:</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.amountPaid)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Balance Due:</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.total - invoice.amountPaid)}</Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {invoice.notes && (
        <Card style={styles.notesCard}>
          <Card.Content>
            <Title>Notes</Title>
            <Text>{invoice.notes}</Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => router.push({
            pathname: "/invoice-form",
            params: { invoiceId: invoice.id }
          })}
          style={styles.actionButton}
        >
          Edit Invoice
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.actionButton}
        >
          Back to Invoices
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
  customerName: {
    fontSize: 16,
    color: "#757575",
    marginTop: 8,
  },
  dateCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  dateLabel: {
    fontWeight: "bold",
  },
  dateValue: {
    color: "#757575",
  },
  itemsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  itemDescription: {
    flex: 1,
    marginRight: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemDetails: {
    fontSize: 14,
    color: "#757575",
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemDivider: {
    marginVertical: 8,
  },
  totalCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalValue: {
    fontSize: 16,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  notesCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    marginVertical: 8,
  },
})

export default InvoiceDetailScreen