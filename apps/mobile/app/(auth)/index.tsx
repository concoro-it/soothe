import { router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { onboardingPalette } from "@/features/onboarding/OnboardingShell";

export default function AuthScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <View style={styles.content}>
        <Image source={require("../../assets/branding/logo.png")} style={styles.logo} resizeMode="contain" />

        <View style={styles.hero}>
          <Text style={styles.title}>Calm for busy families</Text>
          <Text style={styles.subtitle}>Soothe helps parents handle family logistics with less stress and more clarity.</Text>
        </View>

        <Card style={styles.actionCard}>
          <Button onPress={() => router.push("/onboarding/family")}>Create account</Button>
          <Button variant="secondary" onPress={() => router.replace("/(tabs)/home")}>
            Continue with Google
          </Button>
        </Card>

        <View style={styles.bottomArt}>
          <Image source={require("../../assets/branding/illustrations/asset-house.png")} style={styles.heroImage} resizeMode="contain" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: onboardingPalette.background
  },
  glowOne: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(45, 49, 125, 0.10)",
    top: 80,
    right: -80
  },
  glowTwo: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(238, 159, 200, 0.15)",
    bottom: 160,
    left: -120
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    marginHorizontal: "auto",
    width: "100%",
    maxWidth: 760
  },
  logo: {
    width: 180,
    height: 60,
    alignSelf: "center"
  },
  hero: {
    marginTop: 28,
    alignItems: "center",
    gap: 10
  },
  title: {
    color: onboardingPalette.ink,
    fontFamily: "PPEditorialNew-Regular",
    fontSize: 56,
    lineHeight: 68,
    letterSpacing: -0.6,
    textAlign: "center",
    paddingTop: 2
  },
  subtitle: {
    color: onboardingPalette.muted,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 26,
    maxWidth: 650
  },
  actionCard: {
    marginTop: 24,
    gap: 10
  },
  bottomArt: {
    flex: 1,
    justifyContent: "flex-end",
    margin: 0,
    padding: 0
  },
  heroImage: {
    width: "100%",
    maxWidth: 400,
    height: 220,
    alignSelf: "center",
    margin: 0
  }
});
