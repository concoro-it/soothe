import { useState } from "react";
import { router } from "expo-router";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onboardingPalette, onboardingTypography, OnboardingShell } from "@/features/onboarding/OnboardingShell";

export default function ChildSetupScreen() {
  const [childName, setChildName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  function formatDate(date: Date) {
    const day = `${date.getDate()}`.padStart(2, "0");
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function onValueChangeDate(_: unknown, selectedDate: Date) {
    setBirthDate(selectedDate);
    setShowDatePicker(false);
  }

  function onDismissDatePicker() {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
  }

  return (
    <OnboardingShell
      title={`Center of your\nworld`}
      subtitle="Soothe organizes the everyday chaos around your children. Let's add your first child to get started."
      onBack={() => router.back()}
    >
      <View style={styles.avatarWrap}>
        <Image source={require("../../assets/branding/illustrations/avatar.png")} style={styles.avatar} resizeMode="contain" />
      </View>

      <View style={styles.formBlock}>
        <Text style={onboardingTypography.fieldLabel}>Child's Name</Text>
        <Input value={childName} onChangeText={setChildName} placeholder="Mia Rossi" />

        <Text style={[onboardingTypography.fieldLabel, styles.dateLabel]}>Date of birth</Text>
        <Pressable style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
          <Text style={birthDate ? styles.dateValue : styles.datePlaceholder}>
            {birthDate ? formatDate(birthDate) : "Select from calendar"}
          </Text>
          <MaterialCommunityIcons name="calendar-month-outline" size={18} color="#7B7D86" />
        </Pressable>

        {showDatePicker ? (
          <DateTimePicker
            value={birthDate ?? new Date(2020, 0, 1)}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "calendar"}
            maximumDate={new Date()}
            onValueChange={onValueChangeDate}
            onDismiss={onDismissDatePicker}
            onNeutralButtonPress={onDismissDatePicker}
          />
        ) : null}

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ⓘ</Text>
          <Text style={styles.infoText}>Have more little ones? You can easily add siblings later in your Family Settings.</Text>
        </View>

        <Button style={styles.button} onPress={() => router.push("/onboarding/complete")}>Create Profile</Button>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    marginTop: 18,
    alignItems: "center"
  },
  avatar: {
    width: 120,
    height: 120
  },
  formBlock: {
    marginTop: 18,
    gap: 8
  },
  dateLabel: {
    marginTop: 10
  },
  dateInput: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: onboardingPalette.fieldBorder,
    backgroundColor: onboardingPalette.field,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  datePlaceholder: {
    color: "#8E8F98",
    fontSize: 16
  },
  dateValue: {
    color: "#2F2F3B",
    fontSize: 16
  },
  infoCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#D9D9DB",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    backgroundColor: "transparent"
  },
  infoIcon: {
    color: "#2D2F35",
    fontSize: 14,
    marginTop: 1
  },
  infoText: {
    flex: 1,
    color: "#2F2F36",
    fontSize: 16,
    lineHeight: 24
  },
  button: {
    alignSelf: "center",
    marginTop: 20,
    minWidth: 190
  }
});
