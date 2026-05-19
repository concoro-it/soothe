import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { colors } from "@/theme/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#CFCFD3",
        tabBarInactiveTintColor: "#CFCFD3",
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            home: "home-outline",
            timeline: "calendar-outline",
            ask: "add-outline",
            tasks: "list-outline",
            payments: "card-outline"
          };

          return <Ionicons name={iconMap[route.name] ?? "ellipse-outline"} size={size + 2} color={color} />;
        }
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="timeline" options={{ title: "Timeline" }} />
      <Tabs.Screen
        name="ask"
        options={{
          title: "Ask",
          tabBarButton: (props) => <CenterFabButton {...props} />
        }}
      />
      <Tabs.Screen name="inbox" options={{ href: null }} />
      <Tabs.Screen name="tasks" options={{ title: "Tasks" }} />
      <Tabs.Screen
        name="payments"
        options={{
          title: "Payments",
          tabBarButton: () => <PaymentsTabButton />
        }}
      />
      <Tabs.Screen name="more" options={{ href: null }} />
    </Tabs>
  );
}

function CenterFabButton(props: BottomTabBarButtonProps) {
  return (
    <Pressable onPress={props.onPress} onLongPress={props.onLongPress} style={({ pressed }) => [styles.fabButton, pressed && styles.fabPressed]}>
      <View style={styles.fabInner}>
        <Ionicons name="add" size={38} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

function PaymentsTabButton() {
  return (
    <Pressable style={({ pressed }) => [styles.paymentsButton, pressed && styles.paymentsButtonPressed]} onPress={() => router.push("/modal/payments")}>
      <Ionicons name="card-outline" size={24} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 4,
    right: 4,
    bottom: 0,
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
    backgroundColor: "rgba(248, 248, 248, 0.97)",
    borderTopWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#363A76",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 9
  },
  fabButton: {
    top: -32,
    justifyContent: "center",
    alignItems: "center"
  },
  fabInner: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: "#EB9AC6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#55345A",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6
    },
    elevation: 7
  },
  fabPressed: {
    transform: [{ scale: 0.97 }]
  },
  paymentsButton: {
    minWidth: 52,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center"
  },
  paymentsButtonPressed: {
    opacity: 0.72
  }
});
