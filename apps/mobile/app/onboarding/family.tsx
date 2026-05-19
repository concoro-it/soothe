import { useState } from "react";
import { router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnboardingShell, onboardingPalette, onboardingTypography } from "@/features/onboarding/OnboardingShell";

export default function FamilySetupScreen() {
  const [familyName, setFamilyName] = useState("");

  return (
    <OnboardingShell
      title={`A quiet place for\nyour family`}
      subtitle="Let's build a shared, organized home for all those scattered notes, dates, and documents."
      onBack={() => router.back()}
    >
      <View style={styles.formBlock}>
        <Text style={onboardingTypography.fieldLabel}>Family Name</Text>
        <Input value={familyName} onChangeText={setFamilyName} placeholder="The Rossi Family" />

        <Button style={styles.button} onPress={() => router.push("/onboarding/profile")}>
          Continue
        </Button>
      </View>

      <View style={styles.bottomArtWrap}>
        <Image source={require("../../assets/branding/illustrations/asset-family-hug.png")} style={styles.bottomArt} resizeMode="contain" />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  formBlock: {
    marginTop: 28,
    gap: 8
  },
  button: {
    alignSelf: "center",
    marginTop: 24,
    minWidth: 166
  },
  bottomArtWrap: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 20
  },
  bottomArt: {
    width: "100%",
    height: 300,
    maxWidth: 420,
    alignSelf: "center"
  }
});
