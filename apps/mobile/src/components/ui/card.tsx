import { PropsWithChildren } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { onboardingPalette } from "@/features/onboarding/OnboardingShell";

type CardProps = PropsWithChildren<{
  style?: ViewStyle;
}>;

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: onboardingPalette.field,
    borderWidth: 1.5,
    borderColor: onboardingPalette.fieldBorder,
    shadowColor: "#171535",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  }
});
