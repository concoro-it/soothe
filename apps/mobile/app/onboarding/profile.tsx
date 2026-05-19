import { useState } from "react";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onboardingTypography, OnboardingShell } from "@/features/onboarding/OnboardingShell";

const roles = [
  { key: "mother", label: "Mother", icon: "face-woman" as const },
  { key: "father", label: "Father", icon: "face-man" as const },
  { key: "caregiver", label: "Caregiver", icon: "face-woman-outline" as const }
] as const;

export default function ProfileSetupScreen() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]["key"]>("mother");

  return (
    <OnboardingShell
      title={`A little about\nyou`}
      subtitle="You're taking the first step towards less chaos. How should Soothe address you?"
      onBack={() => router.back()}
    >
      <View style={styles.formBlock}>
        <Text style={onboardingTypography.fieldLabel}>Your Name</Text>
        <Input value={name} onChangeText={setName} placeholder="Francesca Rossi" />

        <Text style={[onboardingTypography.fieldLabel, styles.roleLabel]}>You are</Text>
        <View style={styles.rolesRow}>
          {roles.map((item) => {
            const active = role === item.key;
            return (
              <Pressable key={item.key} onPress={() => setRole(item.key)} style={[styles.roleCard, active && styles.roleCardActive]}>
                <MaterialCommunityIcons name={item.icon} size={18} color="#30323A" />
                <Text style={styles.roleText}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Button style={styles.button} onPress={() => router.push("/onboarding/invite")}>Continue</Button>
      </View>

      <View style={styles.bottomArtWrap}>
        <Image source={require("../../assets/branding/illustrations/asset-stack.png")} style={styles.bottomArt} resizeMode="contain" />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  formBlock: {
    marginTop: 26,
    gap: 8
  },
  roleLabel: {
    marginTop: 18
  },
  rolesRow: {
    flexDirection: "row",
    gap: 8
  },
  roleCard: {
    flex: 1,
    minHeight: 82,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ECECEF",
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  roleCardActive: {
    borderColor: "#232429",
    borderWidth: 2,
    backgroundColor: "#F3F3F4"
  },
  roleText: {
    color: "#202022",
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Inter",
    fontWeight: "700",
    textAlign: "center"
  },
  button: {
    alignSelf: "center",
    marginTop: 24,
    minWidth: 166
  },
  bottomArtWrap: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  bottomArt: {
    width: "100%",
    height: 210,
    maxWidth: 360
  }
});
