import { useState } from "react";
import { router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnboardingShell, onboardingTypography } from "@/features/onboarding/OnboardingShell";

export default function InviteScreen() {
  const [email, setEmail] = useState("");

  return (
    <OnboardingShell
      title={`Share the\nmental load`}
      subtitle="You don't have to carry it all. Invite your partner or a caregiver to stay effortlessly synced."
      onBack={() => router.back()}
    >
      <View style={styles.formBlock}>
        <Text style={onboardingTypography.fieldLabel}>Partner's Email</Text>
        <Input value={email} onChangeText={setEmail} placeholder="partner@email.com" keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.hint}>They will receive an invitation. You can always do this later if you prefer.</Text>

        <Button style={styles.button} onPress={() => router.push("/onboarding/child")}>Continue</Button>
        <Button variant="ghost" style={styles.skipButton} onPress={() => router.push("/onboarding/child")}>Skip for now</Button>
      </View>

      <View style={styles.bottomArtWrap}>
        <Image source={require("../../assets/branding/illustrations/asset-team.png")} style={styles.bottomArt} resizeMode="contain" />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  formBlock: {
    marginTop: 28,
    gap: 8
  },
  hint: {
    ...onboardingTypography.body,
    color: "#7C7E88",
    marginTop: 4
  },
  button: {
    alignSelf: "center",
    marginTop: 24,
    minWidth: 166
  },
  skipButton: {
    alignSelf: "center",
    marginTop: 2
  },
  bottomArtWrap: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 20
  },
  bottomArt: {
    width: "100%",
    height: 190,
    maxWidth: 420,
    alignSelf: "center"
  }
});
