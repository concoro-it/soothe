import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type PendingPayment = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  dueInDays: number;
  accent: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  iconBackground: string;
  primaryAction: "Pay Now" | "Set Reminder";
};

type PaidPayment = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
};

type SpendingCategory = {
  id: string;
  label: string;
  amount: number;
  dotColor: string;
  fillColor: string;
};

type DraftCategory = "School & Education" | "Home & Utilities" | "Activities & Care" | "Health & Medical";

const BUDGET_LIMIT = 4500;

const initialPendingPayments: PendingPayment[] = [
  {
    id: "pending-school",
    title: "Leo's School Tuition",
    subtitle: "Quarterly fee • Leo",
    amount: 890,
    dueInDays: 3,
    accent: "#EB7D7A",
    iconName: "school-outline",
    iconColor: "#6090F8",
    iconBackground: "#ECF1FF",
    primaryAction: "Pay Now"
  },
  {
    id: "pending-insurance",
    title: "Car Insurance",
    subtitle: "Annual renewal • Family",
    amount: 650,
    dueInDays: 12,
    accent: "#F2A349",
    iconName: "car-outline",
    iconColor: "#69B67D",
    iconBackground: "#EAF8EE",
    primaryAction: "Set Reminder"
  },
  {
    id: "pending-club",
    title: "Soccer Club Fee",
    subtitle: "Season registration • Leo",
    amount: 310,
    dueInDays: 18,
    accent: "#E8C94D",
    iconName: "soccer",
    iconColor: "#8B57D8",
    iconBackground: "#F2EDFB",
    primaryAction: "Set Reminder"
  }
];

const initialPaidPayments: PaidPayment[] = [
  { id: "paid-nanny", title: "Nanny Monthly", subtitle: "Paid Sep 1 • Mom", amount: 800 },
  { id: "paid-electricity", title: "Electricity Bill", subtitle: "Paid Sep 5 • Dad", amount: 240 },
  { id: "paid-dance", title: "Emma's Dance Class", subtitle: "Paid Sep 8 • Mom", amount: 180 }
];

const initialSpendingCategories: SpendingCategory[] = [
  { id: "school", label: "School & Education", amount: 1240, dotColor: "#DEA1BA", fillColor: "#DEA1BA" },
  { id: "home", label: "Home & Utilities", amount: 890, dotColor: "#3D3E67", fillColor: "#3D3E67" },
  { id: "activities", label: "Activities & Care", amount: 520, dotColor: "#6B97E8", fillColor: "#6B97E8" },
  { id: "health", label: "Health & Medical", amount: 340, dotColor: "#68C879", fillColor: "#68C879" }
];

const draftCategoryOptions: DraftCategory[] = ["School & Education", "Home & Utilities", "Activities & Care", "Health & Medical"];

export default function PaymentsModal() {
  const insets = useSafeAreaInsets();
  const [pendingPayments, setPendingPayments] = useState(initialPendingPayments);
  const [paidPayments, setPaidPayments] = useState(initialPaidPayments);
  const [spendingCategories, setSpendingCategories] = useState(initialSpendingCategories);
  const [showAllPaid, setShowAllPaid] = useState(false);

  const [isComposerVisible, setComposerVisible] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftAmount, setDraftAmount] = useState("");
  const [draftDays, setDraftDays] = useState("7");
  const [draftOwner, setDraftOwner] = useState("");
  const [draftCategory, setDraftCategory] = useState<DraftCategory>("School & Education");

  const totalPendingAmount = useMemo(() => pendingPayments.reduce((sum, payment) => sum + payment.amount, 0), [pendingPayments]);
  const totalPaidAmount = useMemo(() => paidPayments.reduce((sum, payment) => sum + payment.amount, 0), [paidPayments]);
  const totalSpent = totalPendingAmount + totalPaidAmount;
  const usageRatio = Math.min(totalSpent / BUDGET_LIMIT, 1);
  const usagePercent = Math.round((totalSpent / BUDGET_LIMIT) * 100);
  const remainingAmount = Math.max(BUDGET_LIMIT - totalSpent, 0);

  const displayedPaid = showAllPaid ? paidPayments : paidPayments.slice(0, 3);

  function closeComposer() {
    setComposerVisible(false);
    setDraftTitle("");
    setDraftAmount("");
    setDraftDays("7");
    setDraftOwner("");
    setDraftCategory("School & Education");
  }

  function parseAmount(input: string) {
    const normalized = input.replace(/[^\d.]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
  }

  function parseDays(input: string) {
    const parsed = Number(input.replace(/[^\d]/g, ""));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 7;
    }
    return Math.min(parsed, 90);
  }

  function categoryMeta(category: DraftCategory) {
    switch (category) {
      case "School & Education":
        return {
          subtitle: `Quarterly fee • ${draftOwner.trim() || "Family"}`,
          accent: "#EB7D7A",
          iconName: "school-outline" as const,
          iconColor: "#6090F8",
          iconBackground: "#ECF1FF",
          spendId: "school"
        };
      case "Home & Utilities":
        return {
          subtitle: `Monthly utility • ${draftOwner.trim() || "Family"}`,
          accent: "#F2A349",
          iconName: "home-lightning-bolt-outline" as const,
          iconColor: "#3D3E67",
          iconBackground: "#EBEBFF",
          spendId: "home"
        };
      case "Activities & Care":
        return {
          subtitle: `Activity plan • ${draftOwner.trim() || "Kids"}`,
          accent: "#E8C94D",
          iconName: "basketball" as const,
          iconColor: "#6B97E8",
          iconBackground: "#EAF1FF",
          spendId: "activities"
        };
      case "Health & Medical":
      default:
        return {
          subtitle: `Health expense • ${draftOwner.trim() || "Family"}`,
          accent: "#6FCC86",
          iconName: "medical-bag" as const,
          iconColor: "#5ABF73",
          iconBackground: "#EAF8EE",
          spendId: "health"
        };
    }
  }

  function handleAddPayment() {
    const title = draftTitle.trim();
    if (!title) {
      return;
    }

    const amount = parseAmount(draftAmount);
    if (amount <= 0) {
      return;
    }

    const dueInDays = parseDays(draftDays);
    const meta = categoryMeta(draftCategory);

    const createdPayment: PendingPayment = {
      id: `pending-${Date.now()}`,
      title,
      subtitle: meta.subtitle,
      amount,
      dueInDays,
      accent: meta.accent,
      iconName: meta.iconName,
      iconColor: meta.iconColor,
      iconBackground: meta.iconBackground,
      primaryAction: dueInDays <= 5 ? "Pay Now" : "Set Reminder"
    };

    setPendingPayments((current) => [createdPayment, ...current]);

    setSpendingCategories((current) =>
      current.map((category) => {
        if (category.id !== meta.spendId) {
          return category;
        }

        return {
          ...category,
          amount: category.amount + amount
        };
      })
    );

    closeComposer();
  }

  function handlePendingAction(payment: PendingPayment) {
    if (payment.primaryAction === "Set Reminder") {
      setPendingPayments((current) =>
        current.map((entry) => {
          if (entry.id !== payment.id) {
            return entry;
          }

          return {
            ...entry,
            dueInDays: Math.max(entry.dueInDays - 2, 1),
            primaryAction: entry.dueInDays <= 3 ? "Pay Now" : "Set Reminder"
          };
        })
      );
      return;
    }

    setPendingPayments((current) => current.filter((entry) => entry.id !== payment.id));

    const paidDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });

    setPaidPayments((current) => [
      {
        id: `paid-${payment.id}`,
        title: payment.title,
        subtitle: `Paid ${paidDate} • ${extractOwnerLabel(payment.subtitle)}`,
        amount: payment.amount
      },
      ...current
    ]);
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom + 28, 36)
          }
        ]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Payments</Text>
            <Text style={styles.subtitle}>Track and plan your family expenses</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]} onPress={() => setComposerVisible(true)}>
            <Ionicons name="add" size={22} color="#52577D" />
          </Pressable>
        </View>

        <View style={styles.budgetCard}>
          <View style={styles.budgetHeaderRow}>
            <Text style={styles.budgetLabel}>MONTHLY BUDGET</Text>
            <Ionicons name="pie-chart-outline" size={18} color="#5D628B" />
          </View>

          <View style={styles.budgetTotalsRow}>
            <Text style={styles.budgetAmount}>${formatCurrency(totalSpent)}</Text>
            <Text style={styles.budgetMax}> / ${formatCurrency(BUDGET_LIMIT)}</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${usageRatio * 100}%` }]} />
          </View>

          <View style={styles.budgetMetaRow}>
            <Text style={styles.budgetUsageText}>{usagePercent}% used</Text>
            <Text style={styles.budgetRemainText}>${formatCurrency(remainingAmount)} remaining</Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderTitleRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Pending Payments</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{pendingPayments.length}</Text>
            </View>
          </View>
          <Text style={styles.sectionAmount}>${formatCurrency(totalPendingAmount)} due</Text>
        </View>

        <View style={styles.pendingList}>
          {pendingPayments.map((payment) => (
            <View key={payment.id} style={[styles.pendingCard, { borderLeftColor: payment.accent }]}>
              <View style={styles.pendingTopRow}>
                <View style={styles.pendingMainRow}>
                  <View style={[styles.pendingIconWrap, { backgroundColor: payment.iconBackground }]}> 
                    <MaterialCommunityIcons name={payment.iconName} size={18} color={payment.iconColor} />
                  </View>

                  <View style={styles.pendingTextWrap}>
                    <Text style={styles.pendingTitle}>{payment.title}</Text>
                    <Text style={styles.pendingSubtitle}>{payment.subtitle}</Text>
                  </View>
                </View>

                <Text style={styles.pendingAmount}>${formatCurrency(payment.amount)}</Text>
              </View>

              <View style={styles.pendingBottomRow}>
                <Text style={[styles.dueText, payment.dueInDays <= 4 ? styles.dueTextUrgent : styles.dueTextNormal]}>
                  • Due in {payment.dueInDays} days
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    payment.primaryAction === "Pay Now" ? styles.payNowButton : styles.reminderButton,
                    pressed && styles.buttonPressed
                  ]}
                  onPress={() => handlePendingAction(payment)}
                >
                  <Text style={payment.primaryAction === "Pay Now" ? styles.payNowText : styles.reminderText}>{payment.primaryAction}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitleBlock}>Spending by Category</Text>

        <View style={styles.categoriesCard}>
          {spendingCategories.map((category) => {
            const width = Math.min((category.amount / BUDGET_LIMIT) * 2.1, 1) * 100;

            return (
              <View key={category.id} style={styles.categoryRow}>
                <View style={styles.categoryLabelWrap}>
                  <View style={[styles.categoryDot, { backgroundColor: category.dotColor }]} />
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                </View>

                <View style={styles.categoryBarTrack}>
                  <View style={[styles.categoryBarFill, { width: `${Math.max(width, 12)}%`, backgroundColor: category.fillColor }]} />
                </View>

                <Text style={styles.categoryAmount}>${formatCurrency(category.amount)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Paid This Month</Text>
          <Text style={styles.paidTotalText}>${formatCurrency(totalPaidAmount)} total</Text>
        </View>

        <View style={styles.paidCard}>
          {displayedPaid.map((payment) => (
            <View key={payment.id} style={styles.paidRow}>
              <View style={styles.paidMainRow}>
                <View style={styles.paidIconWrap}>
                  <Ionicons name="checkmark" size={16} color="#39A85D" />
                </View>

                <View style={styles.paidTextWrap}>
                  <Text style={styles.paidTitle}>{payment.title}</Text>
                  <Text style={styles.paidSubtitle}>{payment.subtitle}</Text>
                </View>
              </View>

              <Text style={styles.paidAmount}>${formatCurrency(payment.amount)}</Text>
            </View>
          ))}

          {paidPayments.length > 3 ? (
            <Pressable style={({ pressed }) => [styles.viewAllButton, pressed && styles.viewAllButtonPressed]} onPress={() => setShowAllPaid((current) => !current)}>
              <Text style={styles.viewAllText}>{showAllPaid ? "SHOW LESS" : "VIEW ALL PAID"}</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={isComposerVisible} animationType="slide" transparent onRequestClose={closeComposer}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={closeComposer} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={8} style={styles.sheetKeyboardWrap}>
            <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 18, 24) }]} onPress={() => undefined}>
              <View style={styles.sheetHandle} />

              <View style={styles.sheetHeaderRow}>
                <Pressable onPress={closeComposer}>
                  <Text style={styles.sheetHeaderAction}>Cancel</Text>
                </Pressable>
                <Text style={styles.sheetTitle}>New Payment</Text>
                <Pressable onPress={handleAddPayment}>
                  <Text style={styles.sheetHeaderActionPrimary}>Add</Text>
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sheetContent}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Title</Text>
                  <TextInput
                    value={draftTitle}
                    onChangeText={setDraftTitle}
                    placeholder="e.g. Music School Fee"
                    placeholderTextColor="#A7ACBE"
                    style={styles.formInput}
                    autoFocus
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Amount</Text>
                  <TextInput
                    value={draftAmount}
                    onChangeText={setDraftAmount}
                    placeholder="e.g. 420"
                    placeholderTextColor="#A7ACBE"
                    keyboardType="decimal-pad"
                    style={styles.formInput}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Due In (days)</Text>
                  <TextInput
                    value={draftDays}
                    onChangeText={setDraftDays}
                    placeholder="e.g. 7"
                    placeholderTextColor="#A7ACBE"
                    keyboardType="number-pad"
                    style={styles.formInput}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Owner</Text>
                  <TextInput
                    value={draftOwner}
                    onChangeText={setDraftOwner}
                    placeholder="e.g. Leo"
                    placeholderTextColor="#A7ACBE"
                    style={styles.formInput}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Category</Text>
                  <View style={styles.categoryChipRow}>
                    {draftCategoryOptions.map((option) => (
                      <Pressable
                        key={option}
                        style={[styles.categoryChip, draftCategory === option && styles.categoryChipActive]}
                        onPress={() => setDraftCategory(option)}
                      >
                        <Text style={[styles.categoryChipText, draftCategory === option && styles.categoryChipTextActive]}>{option}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US");
}

function extractOwnerLabel(subtitle: string) {
  const parts = subtitle.split("•");
  if (parts.length < 2) {
    return "Family";
  }

  return parts[1].trim();
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F4F2EE"
  },
  content: {
    paddingHorizontal: 14
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14
  },
  title: {
    fontFamily: "PPEditorialNew-Regular",
    fontSize: 32,
    lineHeight: 36,
    color: "#3D3E67"
  },
  subtitle: {
    marginTop: 4,
    fontFamily: "Inter",
    fontSize: 14,
    lineHeight: 18,
    color: "#6A6E87"
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#FCFAF8",
    borderWidth: 1,
    borderColor: "#E3DFD8",
    alignItems: "center",
    justifyContent: "center"
  },
  iconButtonPressed: {
    transform: [{ scale: 0.96 }]
  },
  budgetCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: "#ECE8E0",
    marginBottom: 22,
    shadowColor: "#23274A",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 2
  },
  budgetHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  budgetLabel: {
    fontFamily: "Inter",
    color: "#A6A8B3",
    fontSize: 12,
    letterSpacing: 0.9,
    fontWeight: "700"
  },
  budgetTotalsRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "flex-end"
  },
  budgetAmount: {
    fontFamily: "Inter",
    fontSize: 50,
    lineHeight: 52,
    fontWeight: "800",
    color: "#3D3E67"
  },
  budgetMax: {
    fontFamily: "Inter",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
    color: "#A8ABB7",
    marginBottom: 4
  },
  progressTrack: {
    marginTop: 18,
    height: 14,
    borderRadius: 999,
    backgroundColor: "#EEECE8",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#C9B3E8"
  },
  budgetMetaRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  budgetUsageText: {
    fontFamily: "Inter",
    fontSize: 14,
    color: "#7B7F95",
    fontWeight: "700"
  },
  budgetRemainText: {
    fontFamily: "Inter",
    fontSize: 16,
    color: "#3DA45D",
    fontWeight: "700"
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  sectionHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  sectionDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: "#DE4C48"
  },
  sectionTitle: {
    fontFamily: "PPEditorialNew-Regular",
    fontSize: 32,
    lineHeight: 36,
    color: "#3D3E67"
  },
  sectionTitleBlock: {
    fontFamily: "PPEditorialNew-Regular",
    fontSize: 32,
    lineHeight: 36,
    color: "#3D3E67",
    marginTop: 18,
    marginBottom: 12
  },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#F2DEDD",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8
  },
  countBadgeText: {
    fontFamily: "Inter",
    fontSize: 12,
    color: "#B46868",
    fontWeight: "700"
  },
  sectionAmount: {
    fontFamily: "Inter",
    fontSize: 14,
    color: "#444767",
    fontWeight: "700"
  },
  pendingList: {
    gap: 12
  },
  pendingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#ECE8E0",
    borderLeftWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 14
  },
  pendingTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  pendingMainRow: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
    paddingRight: 8
  },
  pendingIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  pendingTextWrap: {
    flex: 1
  },
  pendingTitle: {
    fontFamily: "Inter",
    fontSize: 18,
    lineHeight: 22,
    color: "#3D3E67",
    fontWeight: "700"
  },
  pendingSubtitle: {
    marginTop: 2,
    fontFamily: "Inter",
    fontSize: 13,
    lineHeight: 17,
    color: "#9B9EAA",
    fontWeight: "500"
  },
  pendingAmount: {
    fontFamily: "Inter",
    fontSize: 21,
    lineHeight: 24,
    color: "#3D3E67",
    fontWeight: "800"
  },
  pendingBottomRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  dueText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "700"
  },
  dueTextUrgent: {
    color: "#E06360"
  },
  dueTextNormal: {
    color: "#D0832F"
  },
  payNowButton: {
    minHeight: 38,
    borderRadius: 14,
    paddingHorizontal: 20,
    backgroundColor: "#3F406A",
    alignItems: "center",
    justifyContent: "center"
  },
  payNowText: {
    fontFamily: "Inter",
    color: "#F8F8FF",
    fontSize: 15,
    fontWeight: "700"
  },
  reminderButton: {
    minHeight: 38,
    borderRadius: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  reminderText: {
    fontFamily: "Inter",
    color: "#4C4F70",
    fontSize: 15,
    fontWeight: "700"
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }]
  },
  categoriesCard: {
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE8E0",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  categoryLabelWrap: {
    width: "40%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  categoryDot: {
    width: 14,
    height: 14,
    borderRadius: 999
  },
  categoryLabel: {
    flex: 1,
    fontFamily: "Inter",
    fontSize: 14,
    lineHeight: 18,
    color: "#3D3E67",
    fontWeight: "700"
  },
  categoryBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#EFEDE8",
    overflow: "hidden"
  },
  categoryBarFill: {
    height: "100%",
    borderRadius: 999
  },
  categoryAmount: {
    minWidth: 64,
    textAlign: "right",
    fontFamily: "Inter",
    fontSize: 16,
    color: "#3D3E67",
    fontWeight: "800"
  },
  paidTotalText: {
    fontFamily: "Inter",
    fontSize: 16,
    color: "#3DA45D",
    fontWeight: "800"
  },
  paidCard: {
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE8E0",
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 12,
    marginBottom: 8
  },
  paidRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  paidMainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 10
  },
  paidIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "#E3F5E8",
    alignItems: "center",
    justifyContent: "center"
  },
  paidTextWrap: {
    flex: 1
  },
  paidTitle: {
    fontFamily: "Inter",
    fontSize: 16,
    lineHeight: 20,
    color: "#3D3E67",
    fontWeight: "700"
  },
  paidSubtitle: {
    marginTop: 1,
    fontFamily: "Inter",
    fontSize: 13,
    lineHeight: 17,
    color: "#9B9EAA",
    fontWeight: "600"
  },
  paidAmount: {
    fontFamily: "Inter",
    fontSize: 20,
    lineHeight: 22,
    color: "#3D3E67",
    fontWeight: "800"
  },
  viewAllButton: {
    marginTop: 4,
    minHeight: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  viewAllButtonPressed: {
    opacity: 0.8
  },
  viewAllText: {
    fontFamily: "Inter",
    fontSize: 25,
    lineHeight: 30,
    letterSpacing: 0.4,
    color: "#3D3E67",
    fontWeight: "800"
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end"
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(18,19,23,0.2)"
  },
  sheetKeyboardWrap: {
    flex: 1,
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: "#F8F6F2",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: "#E5E1D8",
    paddingHorizontal: 16,
    paddingTop: 10,
    maxHeight: "84%"
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#D2CFC9",
    alignSelf: "center",
    marginBottom: 10
  },
  sheetHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14
  },
  sheetHeaderAction: {
    fontFamily: "Inter",
    fontSize: 17,
    color: "#7A809E"
  },
  sheetTitle: {
    fontFamily: "Inter",
    fontSize: 17,
    color: "#353A60",
    fontWeight: "700"
  },
  sheetHeaderActionPrimary: {
    fontFamily: "Inter",
    fontSize: 17,
    color: "#3E4BC4",
    fontWeight: "700"
  },
  sheetContent: {
    paddingBottom: 8
  },
  formGroup: {
    marginBottom: 12
  },
  formLabel: {
    marginBottom: 6,
    fontFamily: "Inter",
    fontSize: 13,
    color: "#666C88",
    fontWeight: "600"
  },
  formInput: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4E2DE",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    fontFamily: "Inter",
    fontSize: 15,
    color: "#41476C"
  },
  categoryChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  categoryChip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DDD9D2",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  categoryChipActive: {
    backgroundColor: "#3F4277",
    borderColor: "#3F4277"
  },
  categoryChipText: {
    fontFamily: "Inter",
    fontSize: 13,
    color: "#596086",
    fontWeight: "600"
  },
  categoryChipTextActive: {
    color: "#F7F8FF"
  }
});
