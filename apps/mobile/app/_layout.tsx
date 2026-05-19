import { Stack } from "expo-router";
import { useFonts } from "expo-font";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "PPEditorialNew-Regular": require("../assets/branding/fonts/PPEditorialNew-Regular.ttf"),
    "PPEditorialNew-Italic": require("../assets/branding/fonts/PPEditorialNew-Italic.ttf")
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="task/[id]" />
      <Stack.Screen name="modal/review" options={{ presentation: "modal" }} />
      <Stack.Screen name="modal/voice-mode" options={{ presentation: "modal" }} />
      <Stack.Screen name="modal/tasks" options={{ presentation: "modal" }} />
      <Stack.Screen name="modal/payments" options={{ presentation: "modal" }} />
      <Stack.Screen name="modal/documents" options={{ presentation: "modal" }} />
      <Stack.Screen name="modal/reminders" options={{ presentation: "modal" }} />
      <Stack.Screen name="modal/family-settings" options={{ presentation: "modal" }} />
      <Stack.Screen name="modal/new-event" options={{ presentation: "modal" }} />
    </Stack>
  );
}
