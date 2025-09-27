// Mock authentication service for development
// In a real app, this would integrate with your authentication provider

import { User } from "../types"

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  businessName?: string
}

interface AuthResponse {
  token: string
  user: User
}

// Mock user for development
const MOCK_USER: User = {
  id: "mock-user-id",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  isOnboarded: true,
}

// Mock token
const MOCK_TOKEN = "mock-jwt-token"

// Authenticate user with email and password
export const login = async ({
  email,
  password,
}: LoginCredentials): Promise<AuthResponse> => {
  // Mock implementation
  console.log("Mock login:", email)
  return {
    token: MOCK_TOKEN,
    user: { ...MOCK_USER, email }
  }
}

// Register a new user
export const register = async ({
  email,
  password,
  firstName,
  lastName,
  businessName,
}: RegisterData): Promise<AuthResponse> => {
  // Mock implementation
  console.log("Mock register:", email, firstName, lastName)
  return {
    token: MOCK_TOKEN,
    user: { ...MOCK_USER, email, firstName, lastName }
  }
}

// Get the current authenticated user
export const getCurrentUser = (): Promise<User | null> => {
  // Mock implementation - return user if "logged in"
  return Promise.resolve(MOCK_USER)
}

// Log out the current user
export const logout = async (): Promise<void> => {
  // Mock implementation
  console.log("Mock logout")
}

// Complete the onboarding process for the user
export const completeOnboarding = async (
  data: Partial<User>
): Promise<User> => {
  // Mock implementation
  console.log("Mock complete onboarding:", data)
  return { ...MOCK_USER, ...data, isOnboarded: true }
}

// Request a password reset email
export const forgotPassword = async (
  email: string
): Promise<{ message: string }> => {
  // Mock implementation
  console.log("Mock forgot password:", email)
  return { message: "Password reset email sent" }
}

// Reset password with token
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ message: string }> => {
  // Mock implementation
  console.log("Mock reset password with token:", token)
  return { message: "Password has been reset" }
}

// Change the current user's password
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  // Mock implementation
  console.log("Mock change password")
  return { message: "Password changed" }
}

// Update the current user's profile
export const updateProfile = async (data: Partial<User>): Promise<User> => {
  // Mock implementation
  console.log("Mock update profile:", data)
  return { ...MOCK_USER, ...data }
}