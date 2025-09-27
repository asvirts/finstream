import React, { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, Alert } from "react-native"
import {
  Text,
  Title,
  TextInput,
  Button,
  Card,
  IconButton,
  Divider,
  Switch,
  HelperText
} from "react-native-paper"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useInvoices } from "../../context/AppContext"
import { Invoice, InvoiceStatus } from "../../types"
import { InvoiceActionTypes } from "../../context/reducers/invoiceReducer"
import { formatCurrency } from "../../utils/currencyUtils"
import { addDays } from "date-fns"

interface InvoiceItem {
  id: string
  description: string
  quantity: string
  price: string
  taxable: boolean
}

const InvoiceFormScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { invoiceState, dispatch } = useInvoices()
  const { invoiceId } = route.params as { invoiceId?: string }

  const isEditing = !!invoiceId
  const existingInvoice = isEditing
    ? invoiceState.invoices.find(inv => inv.id === invoiceId)
    : null

  const [customerName, setCustomerName] = useState(existingInvoice?.customerName || "")
  const [notes, setNotes] = useState(existingInvoice?.notes || "")
  const [terms, setTerms] = useState(existingInvoice?.terms || "Net 30")
  const [taxRate, setTaxRate] = useState(existingInvoice ? (existingInvoice.taxRate * 100).toString() : "7.0")
  const [items, setItems] = useState<InvoiceItem[]>(
    existingInvoice?.items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity.toString(),
      price: item.price.toString(),
      taxable: item.taxable
    })) || [
      { id: "1", description: "", quantity: "1", price: "0", taxable: true }
    ]
  )

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: "1",
      price: "0",
      taxable: true
    }
    setItems([...items, newItem])
  }

  const removeItem = (itemId: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== itemId))
    }
  }

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: string | boolean) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    ))
  }

  const calculateTotals = () => {
    const taxRateDecimal = parseFloat(taxRate) / 100 || 0
    let subtotal = 0
    let taxableAmount = 0

    items.forEach(item => {
      const quantity = parseFloat(item.quantity) || 0
      const price = parseFloat(item.price) || 0
      const amount = quantity * price
      subtotal += amount
      if (item.taxable) {
        taxableAmount += amount
      }
    })

    const taxAmount = taxableAmount * taxRateDecimal
    const total = subtotal + taxAmount

    return { subtotal, taxAmount, total }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!customerName.trim()) {
      newErrors.customerName = "Customer name is required"
    }

    items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = "Description is required"
      }
      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        newErrors[`item_${index}_quantity`] = "Quantity must be greater than 0"
      }
      if (!item.price || parseFloat(item.price) < 0) {
        newErrors[`item_${index}_price`] = "Price must be 0 or greater"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors and try again.")
      return
    }

    const { subtotal, taxAmount, total } = calculateTotals()
    const today = new Date()

    const invoiceData: Partial<Invoice> = {
      customerName: customerName.trim(),
      notes: notes.trim(),
      terms: terms.trim(),
      taxRate: parseFloat(taxRate) / 100,
      items: items.map(item => ({
        id: item.id,
        invoiceId: invoiceId || "",
        description: item.description.trim(),
        quantity: parseFloat(item.quantity),
        price: parseFloat(item.price),
        amount: parseFloat(item.quantity) * parseFloat(item.price),
        taxable: item.taxable
      })),
      taxAmount,
      subtotal,
      total,
      updatedAt: today
    }

    if (isEditing) {
      dispatch({
        type: InvoiceActionTypes.UPDATE_INVOICE_SUCCESS,
        payload: { ...existingInvoice, ...invoiceData } as Invoice
      })
      Alert.alert("Success", "Invoice updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ])
    } else {
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        invoiceNumber: `INV-${Date.now()}`,
        customerId: `cust_${Date.now()}`,
        date: today,
        dueDate: addDays(today, 30),
        amountPaid: 0,
        status: InvoiceStatus.DRAFT,
        createdAt: today,
        ...invoiceData
      } as Invoice

      dispatch({
        type: InvoiceActionTypes.CREATE_INVOICE_SUCCESS,
        payload: newInvoice
      })
      Alert.alert("Success", "Invoice created successfully!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ])
    }
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.customerCard}>
        <Card.Content>
          <Title>Customer Information</Title>
          <TextInput
            label="Customer Name"
            value={customerName}
            onChangeText={setCustomerName}
            mode="outlined"
            style={styles.input}
            error={!!errors.customerName}
          />
          <HelperText type="error" visible={!!errors.customerName}>
            {errors.customerName}
          </HelperText>
        </Card.Content>
      </Card>

      <Card style={styles.itemsCard}>
        <Card.Content>
          <View style={styles.itemsHeader}>
            <Title>Items</Title>
            <IconButton icon="plus" onPress={addItem} />
          </View>

          {items.map((item, index) => (
            <View key={item.id} style={styles.itemContainer}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemNumber}>Item {index + 1}</Text>
                {items.length > 1 && (
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => removeItem(item.id)}
                  />
                )}
              </View>

              <TextInput
                label="Description"
                value={item.description}
                onChangeText={(value) => updateItem(item.id, "description", value)}
                mode="outlined"
                style={styles.input}
                error={!!errors[`item_${index}_description`]}
              />
              <HelperText type="error" visible={!!errors[`item_${index}_description`]}>
                {errors[`item_${index}_description`]}
              </HelperText>

              <View style={styles.itemRow}>
                <TextInput
                  label="Quantity"
                  value={item.quantity}
                  onChangeText={(value) => updateItem(item.id, "quantity", value)}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                  error={!!errors[`item_${index}_quantity`]}
                />
                <TextInput
                  label="Price"
                  value={item.price}
                  onChangeText={(value) => updateItem(item.id, "price", value)}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                  error={!!errors[`item_${index}_price`]}
                />
              </View>

              <View style={styles.taxableRow}>
                <Text>Taxable</Text>
                <Switch
                  value={item.taxable}
                  onValueChange={(value) => updateItem(item.id, "taxable", value)}
                />
              </View>

              <Text style={styles.itemTotal}>
                Amount: {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0))}
              </Text>

              {index < items.length - 1 && <Divider style={styles.itemDivider} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title>Invoice Settings</Title>
          <TextInput
            label="Tax Rate (%)"
            value={taxRate}
            onChangeText={setTaxRate}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Terms"
            value={terms}
            onChangeText={setTerms}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <Card style={styles.totalCard}>
        <Card.Content>
          <Title>Totals</Title>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax:</Text>
            <Text style={styles.totalValue}>{formatCurrency(taxAmount)}</Text>
          </View>
          <Divider />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
        >
          {isEditing ? "Update Invoice" : "Create Invoice"}
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          Cancel
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
  customerCard: {
    margin: 16,
    marginBottom: 8,
  },
  itemsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  totalCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  input: {
    marginVertical: 4,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemContainer: {
    marginVertical: 8,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  taxableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 8,
  },
  itemDivider: {
    marginTop: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  totalValue: {
    fontWeight: "bold",
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    marginVertical: 8,
  },
  cancelButton: {
    marginVertical: 8,
  },
})

export default InvoiceFormScreen