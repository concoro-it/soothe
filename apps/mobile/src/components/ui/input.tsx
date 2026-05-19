import { ForwardedRef, forwardRef } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

import { onboardingPalette } from "@/features/onboarding/OnboardingShell";

function InputBase(props: TextInputProps, ref: ForwardedRef<TextInput>) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor="#8E8F98"
      style={[styles.input, props.style]}
      {...props}
    />
  );
}

export const Input = forwardRef(InputBase);

const styles = StyleSheet.create({
  input: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: onboardingPalette.fieldBorder,
    backgroundColor: onboardingPalette.field,
    paddingHorizontal: 12,
    color: "#2F2F3B",
    fontSize: 16
  }
});
