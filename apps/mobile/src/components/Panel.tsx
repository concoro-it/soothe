import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";

export function Panel({ children }: PropsWithChildren) {
  return <View style={styles.panel}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8
  }
});
