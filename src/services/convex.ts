import { ConvexReactClient } from "convex/react";
import Constants from "expo-constants";

const convexUrl = Constants.expoConfig?.extra?.convexUrl as string;

if (!convexUrl) {
  // For development, we'll use a mock URL - user needs to set up Convex deployment
  console.warn("Missing CONVEX_URL environment variable. Using mock URL for development.");
}

export const convex = new ConvexReactClient(convexUrl || "https://mock-convex-url.convex.cloud");