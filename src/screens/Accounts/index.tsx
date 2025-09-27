import React, { useState, useEffect } from "react"
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  TouchableOpacity,
  ScrollView
} from "react-native"
import {
  Text,
  Title,
  FAB,
  Searchbar,
  Divider,
  ActivityIndicator,
  List,
  Chip,
  Surface,
  Menu,
  IconButton
} from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useAccounts } from "../../context/AppContext"
import { AccountType, Account } from "../../types"
import { formatCurrency } from "../../utils/currencyUtils"

const ChartOfAccountsScreen = () => {
  const { accountState, dispatch } = useAccounts()
  const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<AccountType | "ALL">("ALL")
  const [menuVisible, setMenuVisible] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  useEffect(() => {
    // In a real app, this would fetch accounts from an API
    dispatch({ type: "FETCH_ACCOUNTS_REQUEST" })

    // Simulate API call
    setTimeout(() => {
      // If we already have accounts, don't overwrite them
      if (accountState.accounts.length === 0) {
        dispatch({
          type: "FETCH_ACCOUNTS_SUCCESS",
          payload: [] // In a real app, this would be the API response
        })
      } else {
        dispatch({
          type: "FETCH_ACCOUNTS_SUCCESS",
          payload: accountState.accounts
        })
      }
    }, 500)
  }, [])

  const openAccountMenu = (account: Account) => {
    setSelectedAccount(account)
    setMenuVisible(true)
  }

  const handleEdit = () => {
    setMenuVisible(false)
    if (selectedAccount) {
      navigation.navigate("EditAccount", { accountId: selectedAccount.id })
    }
  }

  const handleArchive = () => {
    setMenuVisible(false)
    if (selectedAccount) {
      Alert.alert(
        "Archive Account",
        `Are you sure you want to archive ${selectedAccount.name}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Archive",
            style: "destructive",
            onPress: () => {
              dispatch({
                type: "ARCHIVE_ACCOUNT",
                payload: selectedAccount.id
              })
              Alert.alert("Account Archived", "The account has been archived.")
            }
          }
        ]
      )
    }
  }

  const handleDelete = () => {
    setMenuVisible(false)
    if (selectedAccount) {
      Alert.alert(
        "Delete Account",
        `Are you sure you want to delete ${selectedAccount.name}? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              dispatch({
                type: "DELETE_ACCOUNT_REQUEST"
              })

              // In a real app, this would call an API
              setTimeout(() => {
                dispatch({
                  type: "DELETE_ACCOUNT_SUCCESS",
                  payload: selectedAccount.id
                })
                Alert.alert("Account Deleted", "The account has been deleted.")
              }, 500)
            }
          }
        ]
      )
    }
  }

  const renderAccountTypeFilter = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip
          mode={filterType === "ALL" ? "flat" : "outlined"}
          selected={filterType === "ALL"}
          onPress={() => setFilterType("ALL")}
          style={styles.filterChip}
        >
          All
        </Chip>
        <Chip
          mode={filterType === AccountType.ASSET ? "flat" : "outlined"}
          selected={filterType === AccountType.ASSET}
          onPress={() => setFilterType(AccountType.ASSET)}
          style={styles.filterChip}
        >
          Assets
        </Chip>
        <Chip
          mode={filterType === AccountType.LIABILITY ? "flat" : "outlined"}
          selected={filterType === AccountType.LIABILITY}
          onPress={() => setFilterType(AccountType.LIABILITY)}
          style={styles.filterChip}
        >
          Liabilities
        </Chip>
        <Chip
          mode={filterType === AccountType.EQUITY ? "flat" : "outlined"}
          selected={filterType === AccountType.EQUITY}
          onPress={() => setFilterType(AccountType.EQUITY)}
          style={styles.filterChip}
        >
          Equity
        </Chip>
        <Chip
          mode={filterType === AccountType.INCOME ? "flat" : "outlined"}
          selected={filterType === AccountType.INCOME}
          onPress={() => setFilterType(AccountType.INCOME)}
          style={styles.filterChip}
        >
          Income
        </Chip>
        <Chip
          mode={filterType === AccountType.EXPENSE ? "flat" : "outlined"}
          selected={filterType === AccountType.EXPENSE}
          onPress={() => setFilterType(AccountType.EXPENSE)}
          style={styles.filterChip}
        >
          Expenses
        </Chip>
      </ScrollView>
    </View>
  )

  const filteredAccounts = accountState.accounts.filter((account) => {
    // Apply search filter
    const matchesSearch =
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.subtype.toLowerCase().includes(searchQuery.toLowerCase())

    // Apply type filter
    const matchesType = filterType === "ALL" || account.type === filterType

    // Only show active accounts
    const isActive = account.isActive && !account.isArchived

    return matchesSearch && matchesType && isActive
  })

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.ASSET:
        return "bank"
      case AccountType.LIABILITY:
        return "credit-card"
      case AccountType.EQUITY:
        return "chart-pie"
      case AccountType.INCOME:
        return "cash-plus"
      case AccountType.EXPENSE:
        return "cash-minus"
      default:
        return "help-circle"
    }
  }

  const renderAccountItem = ({ item }: { item: Account }) => (
    <List.Item
      title={item.name}
      description={`${item.type} • ${item.subtype
        .replace(/_/g, " ")
        .toLowerCase()}`}
      left={() => (
        <MaterialCommunityIcons
          name={getAccountIcon(item.type)}
          size={24}
          color="#2196F3"
          style={styles.accountIcon}
        />
      )}
      right={() => (
        <View style={styles.rightContent}>
          <Text style={styles.balance}>{formatCurrency(item.balance)}</Text>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => openAccountMenu(item)}
          />
        </View>
      )}
      onPress={() =>
        navigation.navigate("AccountDetails", { accountId: item.id })
      }
      style={styles.accountItem}
    />
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Chart of Accounts</Title>
        <Searchbar
          placeholder="Search accounts"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {renderAccountTypeFilter()}
      </View>

      {accountState.loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading accounts...</Text>
        </View>
      ) : (
        <>
          {filteredAccounts.length > 0 ? (
            <FlatList
              data={filteredAccounts}
              renderItem={renderAccountItem}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={Divider}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="bank-off" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No accounts found</Text>
              <Text style={styles.emptySuggestion}>
                {searchQuery || filterType !== "ALL"
                  ? "Try changing your search or filters"
                  : "Tap the + button to add an account"}
              </Text>
            </View>
          )}
        </>
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate("CreateAccount")}
        label="Add Account"
      />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 100, y: 100 }} // This will be overridden by the component
      >
        <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
        <Menu.Item
          onPress={handleArchive}
          title="Archive"
          leadingIcon="archive"
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
  accountItem: {
    backgroundColor: "#fff",
    paddingVertical: 8
  },
  accountIcon: {
    alignSelf: "center",
    marginLeft: 8,
    marginRight: 0
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center"
  },
  balance: {
    fontWeight: "bold",
    marginRight: 4
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

export default ChartOfAccountsScreen
