import { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { onboardingPalette } from "@/features/onboarding/OnboardingShell";

type ButtonProps = PropsWithChildren<{
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  style?: ViewStyle;
}>;

export function Button({ children, onPress, variant = "primary", style }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.base, variant === "primary" && styles.primary, variant === "secondary" && styles.secondary, pressed && styles.pressed, style]}
    >
      <Text style={[styles.text, variant === "secondary" && styles.secondaryText, variant === "ghost" && styles.ghostText]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  primary: {
    backgroundColor: onboardingPalette.button
  },
  secondary: {
    borderWidth: 1,
    borderColor: onboardingPalette.fieldBorder,
    backgroundColor: onboardingPalette.field
  },
  text: {
    color: onboardingPalette.buttonText,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    fontFamily: "Inter"
  },
  ghostText: {
    color: onboardingPalette.subtle,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Inter",
    fontWeight: "600"
  },
  secondaryText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    fontFamily: "Inter"
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }]
  }
});
