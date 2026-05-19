import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type TasksStickyHeaderProps = {
  title: string;
  topInset: number;
  onBack: () => void;
};

export function TasksStickyHeader({ title, topInset, onBack }: TasksStickyHeaderProps) {
  return (
    <View style={[styles.headerShell, { paddingTop: topInset }]}>
      <View style={styles.headerInner}>
        <View style={styles.topRow}>
          <Pressable onPress={onBack} style={({ pressed }) => [styles.backTap, pressed && styles.backTapPressed]} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color="#40448F" />
          </Pressable>

          <Text style={styles.title}>{title}</Text>

          <View style={styles.rightSpacer} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerShell: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: "#F3F1ED"
  },
  headerInner: {
    paddingHorizontal: 20
  },
  topRow: {
    paddingTop: 2,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  backTap: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10
  },
  backTapPressed: {
    backgroundColor: "#E8E5DD"
  },
  title: {
    color: "#40448F",
    fontSize: 25,
    lineHeight: 30,
    letterSpacing: -0.3,
    fontFamily: "PPEditorialNew-Regular"
  },
  rightSpacer: {
    width: 40,
    height: 40
  }
});
