import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RemindersModal() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Notifications</Text>
          <Pressable>
            <Text style={styles.clearAll}>Clear all</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <View style={styles.urgentDot} />
            <Text style={styles.sectionLabel}>URGENT</Text>
          </View>

          <View style={styles.urgentCard}>
            <View style={styles.urgentTopRow}>
              <View style={styles.iconBadgeDanger}>
                <Ionicons name="alert" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.urgentTextWrap}>
                <Text style={styles.urgentTitle}>School Payment Reminder</Text>
                <Text style={styles.urgentDescription}>
                  The tuition fee for Leo&apos;s autumn term is due tomorrow. Please settle to avoid late fees.
                </Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <Pressable style={styles.primaryAction}>
                <Text style={styles.primaryActionText}>Pay Now</Text>
              </Pressable>
              <Pressable style={styles.secondaryAction}>
                <Text style={styles.secondaryActionText}>Later</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TODAY</Text>

          <View style={styles.card}>
            <View style={styles.iconBadgeInfo}>
              <Ionicons name="medical-outline" size={18} color="#6D93E8" />
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Pediatrician Appointment</Text>
              <Text style={styles.cardSubtitle}>In 2 hours • Dr. Miller&apos;s Clinic</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.iconBadgeNeutral}>
              <Ionicons name="car-outline" size={18} color="#4C4F73" />
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Leo is ready for pickup</Text>
              <Text style={styles.cardSubtitle}>15 mins ago • St. Mary&apos;s School</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.iconBadgeNeutral}>
              <Ionicons name="mail-outline" size={18} color="#4C4F73" />
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>New message from Dad</Text>
              <Text style={styles.cardSubtitle}>&quot;I&apos;ll be late for dinner today, working on a big project.&quot;</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F4F2"
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 26
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4
  },
  title: {
    fontFamily: "PPEditorialNew-Regular",
    fontSize: 32,
    lineHeight: 36,
    color: "#35385F"
  },
  clearAll: {
    fontFamily: "Inter",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: "#43466A"
  },
  section: {
    gap: 16
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  urgentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E25B57"
  },
  sectionLabel: {
    fontFamily: "Inter",
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: 0.6,
    color: "#A0A6B4",
    fontWeight: "700"
  },
  urgentCard: {
    backgroundColor: "#FCFAFA",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#ECE8E7",
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 18,
    shadowColor: "#453F63",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6
    },
    elevation: 2
  },
  urgentTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14
  },
  urgentTextWrap: {
    flex: 1,
    gap: 8
  },
  iconBadgeDanger: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8ECEC"
  },
  urgentTitle: {
    fontFamily: "Inter",
    fontSize: 19,
    lineHeight: 24,
    color: "#3E4166",
    fontWeight: "700"
  },
  urgentDescription: {
    fontFamily: "Inter",
    fontSize: 16,
    lineHeight: 23,
    color: "#6A6F80",
    fontWeight: "500"
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  primaryAction: {
    flex: 1,
    height: 44,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3E416A"
  },
  primaryActionText: {
    fontFamily: "Inter",
    fontSize: 16,
    lineHeight: 20,
    color: "#FFFFFF",
    fontWeight: "700"
  },
  secondaryAction: {
    minWidth: 74,
    height: 44,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: "#E9EAF0"
  },
  secondaryActionText: {
    fontFamily: "Inter",
    fontSize: 16,
    lineHeight: 20,
    color: "#8B91A5",
    fontWeight: "700"
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ECE9E7",
    backgroundColor: "#FBFAF8"
  },
  iconBadgeInfo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FB"
  },
  iconBadgeNeutral: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F1F4"
  },
  cardTextWrap: {
    flex: 1,
    gap: 4
  },
  cardTitle: {
    fontFamily: "Inter",
    fontSize: 17,
    lineHeight: 22,
    color: "#3E4166",
    fontWeight: "700"
  },
  cardSubtitle: {
    fontFamily: "Inter",
    fontSize: 15,
    lineHeight: 20,
    color: "#6C7182",
    fontWeight: "500"
  }
});
