import { router } from "expo-router";
import { Image, StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/button";
import { OnboardingShell } from "@/features/onboarding/OnboardingShell";

export default function OnboardingCompleteScreen() {
  return (
    <OnboardingShell
      title="Breathe easy."
      subtitle="Your family's space is ready. Drop your notes, PDFs, and messy thoughts into the Inbox, and let Soothe gently organize them for you."
      onBack={() => router.back()}
    >
      <View style={styles.content}>
        <Button style={styles.button} onPress={() => router.replace("/(tabs)/inbox")}>Go to your Inbox</Button>
      </View>

      <View style={styles.bottomArtWrap}>
        <Image source={require("../../assets/branding/illustrations/asset-final-hug.png")} style={styles.bottomArt} resizeMode="contain" />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 26
  },
  button: {
    alignSelf: "center",
    minWidth: 200
  },
  bottomArtWrap: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 30
  },
  bottomArt: {
    width: "100%",
    height: 350,
    maxWidth: 420,
    alignSelf: "center"
  }
});
