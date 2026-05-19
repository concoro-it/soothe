import { PropsWithChildren } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const onboardingPalette = {
  background: "#F3F1ED",
  ink: "#40448F",
  muted: "#54598B",
  field: "#F8F8F6",
  fieldBorder: "#D9D9DB",
  button: "#EA9CC7",
  buttonText: "#40448F",
  subtle: "#8B8D96"
} as const;

type Props = PropsWithChildren<{
  title: string;
  subtitle: string;
  onBack?: () => void;
}>;

export function OnboardingShell({ title, subtitle, onBack, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safe}>
      <View style={[styles.headerShell, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <View style={styles.topRow}>
            <Pressable onPress={onBack} disabled={!onBack} style={styles.backTap}>
              <Text style={[styles.backText, !onBack && styles.backHidden]}>‹</Text>
            </Pressable>

            <Image source={require("../../../assets/branding/logo.png")} style={styles.logo} resizeMode="contain" />

            <View style={styles.backTap} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 58 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {children}
      </ScrollView>
    </View>
  );
}

export const onboardingTypography = StyleSheet.create({
  label: {
    color: onboardingPalette.ink,
    fontSize: 35,
    lineHeight: 40,
    fontFamily: "PPEditorialNew-Regular"
  },
  body: {
    color: onboardingPalette.muted,
    fontSize: 17,
    lineHeight: 24
  },
  fieldLabel: {
    color: onboardingPalette.ink,
    fontSize: 14,
    fontWeight: "700"
  }
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: onboardingPalette.background
  },
  headerShell: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: onboardingPalette.background
  },
  headerInner: {
    width: "100%",
    maxWidth: 760,
    marginHorizontal: "auto",
    paddingHorizontal: 26
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingBottom: 0,
    width: "100%",
    maxWidth: 760,
    marginHorizontal: "auto"
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
    justifyContent: "center"
  },
  backText: {
    color: onboardingPalette.ink,
    fontSize: 38,
    lineHeight: 38,
    marginTop: -2
  },
  backHidden: {
    opacity: 0
  },
  logo: {
    width: 122,
    height: 42
  },
  hero: {
    marginTop: 40,
    alignItems: "center",
    gap: 12
  },
  title: {
    color: onboardingPalette.ink,
    fontSize: 52,
    lineHeight: 64,
    textAlign: "center",
    letterSpacing: -0.6,
    fontFamily: "PPEditorialNew-Regular",
    paddingTop: 2
  },
  subtitle: {
    color: onboardingPalette.muted,
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
    maxWidth: 640
  }
});
