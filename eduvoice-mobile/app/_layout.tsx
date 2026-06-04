import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Colors, Typography } from "../lib/theme";
import { useTopicsStore } from "../store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      networkMode: "offlineFirst",
    },
  },
});

function AppBootstrap({ children }: { children: React.ReactNode }) {
  const syncFromBackend = useTopicsStore((s) => s.syncFromBackend);

  useEffect(() => {
    syncFromBackend();
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppBootstrap>
        <Tabs
          screenOptions={{
            tabBarStyle: {
              backgroundColor: "#111827",
              borderTopColor: "#1E293B",
              borderTopWidth: 1,
              paddingBottom: 8,
              paddingTop: 6,
              height: 62,
            },
            tabBarActiveTintColor: "#6366F1",
            tabBarInactiveTintColor: "#64748B",
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: "600",
              marginTop: 2,
            },
            headerStyle: { backgroundColor: "#0A0E1A" },
            headerTintColor: "#F1F5F9",
            headerTitleStyle: {
              fontFamily: Typography.display,
              fontSize: 17,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Planning",
              tabBarLabel: "Planning",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="calendar-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="vocal"
            options={{
              title: "Entraînement",
              tabBarLabel: "Vocal",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="mic-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="dashboard"
            options={{
              title: "Progression",
              tabBarLabel: "Stats",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="bar-chart-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="viewer"
            options={{
              title: "Concepts",
              tabBarLabel: "3D",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="cube-outline" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </AppBootstrap>
    </QueryClientProvider>
  );
}
