import React, { useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../context/AppContext"
import { AuthActionTypes } from "../context/reducers/authReducer"
import { retrieveUserData } from "../services/storageService"
import { getAuthToken } from "../services/api"

// Import screens as they are developed
// Auth screens
// import Login from '../screens/Onboarding/Login';
// import Register from '../screens/Onboarding/Register';
// import ForgotPassword from '../screens/Onboarding/ForgotPassword';

// Onboarding screens
// import Welcome from '../screens/Onboarding/Welcome';
// import BusinessInfo from '../screens/Onboarding/BusinessInfo';
// import ChartOfAccounts from '../screens/Onboarding/ChartOfAccounts';
// import BankConnection from '../screens/Onboarding/BankConnection';
// import OnboardingComplete from '../screens/Onboarding/OnboardingComplete';

// Import actual screens
import InvoicesScreen from "../screens/Invoices"
import InvoiceDetailScreen from "../screens/Invoices/InvoiceDetail"
import InvoiceFormScreen from "../screens/Invoices/InvoiceForm"

// Main screens - placeholders until implementation
const DashboardScreen = () => <></>
const AccountsScreen = () => <></>
const TransactionsScreen = () => <></>
const MoreScreen = () => <></>

// Define stacks
const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

// Auth Stack
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Login" component={() => <></>} />
      <Stack.Screen name="Register" component={() => <></>} />
      <Stack.Screen name="ForgotPassword" component={() => <></>} />
    </Stack.Navigator>
  )
}

// Onboarding Stack
const OnboardingStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Welcome" component={() => <></>} />
      <Stack.Screen name="BusinessInfo" component={() => <></>} />
      <Stack.Screen name="ChartOfAccounts" component={() => <></>} />
      <Stack.Screen name="BankConnection" component={() => <></>} />
      <Stack.Screen name="OnboardingComplete" component={() => <></>} />
    </Stack.Navigator>
  )
}

// Invoice Stack
const InvoiceStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true
      }}
    >
      <Stack.Screen
        name="InvoicesList"
        component={InvoicesScreen}
        options={{ title: "Invoices" }}
      />
      <Stack.Screen
        name="InvoiceDetail"
        component={InvoiceDetailScreen}
        options={{ title: "Invoice Details" }}
      />
      <Stack.Screen
        name="InvoiceForm"
        component={InvoiceFormScreen}
        options={({ route }) => ({
          title: (route.params as any)?.invoiceId ? "Edit Invoice" : "New Invoice"
        })}
      />
      <Stack.Screen
        name="NewInvoice"
        component={InvoiceFormScreen}
        options={{ title: "New Invoice" }}
      />
      <Stack.Screen
        name="EditInvoice"
        component={InvoiceFormScreen}
        options={{ title: "Edit Invoice" }}
      />
    </Stack.Navigator>
  )
}

// Main Tab Navigation
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = ""

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Accounts") {
            iconName = focused ? "wallet" : "wallet-outline"
          } else if (route.name === "Transactions") {
            iconName = focused ? "swap-horizontal" : "swap-horizontal-outline"
          } else if (route.name === "Invoices") {
            iconName = focused ? "document-text" : "document-text-outline"
          } else if (route.name === "More") {
            iconName = focused ? "menu" : "menu-outline"
          }

          return <Ionicons name={iconName as any} size={size} color={color} />
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Invoices" component={InvoiceStack} options={{ headerShown: false }} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  )
}

// Root Navigation
const AppNavigation = () => {
  const { authState, dispatch } = useAuth()
  const { isAuthenticated, user, isLoading } = authState

  useEffect(() => {
    // Check for existing auth session on app load
    const checkAuth = async () => {
      try {
        dispatch({ type: AuthActionTypes.LOGIN_REQUEST })

        const token = await getAuthToken()
        const userData = await retrieveUserData()

        if (token && userData) {
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: { token, user: userData }
          })
        } else {
          dispatch({ type: AuthActionTypes.LOGOUT })
        }
      } catch (error) {
        dispatch({ type: AuthActionTypes.LOGOUT })
      }
    }

    checkAuth()
  }, [dispatch])

  if (isLoading) {
    // Show a loading screen here
    return null
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : user && !user.isOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingStack} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigation
