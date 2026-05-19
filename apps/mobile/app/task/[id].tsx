import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { findTaskById } from "@/features/tasks/mockData";
import { TasksStickyHeader } from "@/features/tasks/TasksStickyHeader";

export default function TaskDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const task = useMemo(() => findTaskById(params.id ?? ""), [params.id]);

  const [title, setTitle] = useState(task?.title ?? "Task not found");
  const [assignee, setAssignee] = useState(task?.assignee ?? "");
  const [dueDate, setDueDate] = useState(task?.dueText ?? "");
  const [linkedChild, setLinkedChild] = useState(task?.linkedChild ?? "");
  const [isRecurring, setIsRecurring] = useState(task?.recurring ?? false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  function handleSave() {
    const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    setSaveMessage(`Saved successfully at ${time}`);
  }

  return (
    <View style={styles.root}>
      <TasksStickyHeader title="Task" topInset={insets.top} onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 64,
            paddingBottom: 44 + Math.max(insets.bottom, 8)
          }
        ]}
      >
        <View style={styles.badgeWrap}>
          <Text style={styles.badge}>Task Details</Text>
          <Text style={styles.helper}>Review and update this task&apos;s title, assignee, date, child and recurrence.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Task title</Text>
          <TextInput value={title} onChangeText={setTitle} style={styles.textField} placeholder="What needs to be done?" placeholderTextColor="#9CA0B9" />

          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Assign to</Text>
              <TextInput value={assignee} onChangeText={setAssignee} style={styles.textField} placeholder="Emma" placeholderTextColor="#9CA0B9" />
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Due date</Text>
              <TextInput value={dueDate} onChangeText={setDueDate} style={styles.textField} placeholder="dd/mm/yyyy" placeholderTextColor="#9CA0B9" />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Linked child</Text>
          <TextInput value={linkedChild} onChangeText={setLinkedChild} style={styles.textField} placeholder="Leo / Mia" placeholderTextColor="#9CA0B9" />

          <View style={styles.switchCard}>
            <View>
              <Text style={styles.switchTitle}>Make it recurring</Text>
              <Text style={styles.switchSubtitle}>Repeat daily, weekly or monthly.</Text>
            </View>
            <Switch value={isRecurring} onValueChange={setIsRecurring} />
          </View>

          <Pressable onPress={handleSave} style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>

          {saveMessage ? (
            <View style={styles.savedCard}>
              <Text style={styles.savedTitle}>{saveMessage}</Text>
              <Text style={styles.savedBody}>Title: {title || "-"}</Text>
              <Text style={styles.savedBody}>Assignee: {assignee || "-"}</Text>
              <Text style={styles.savedBody}>Due date: {dueDate || "-"}</Text>
              <Text style={styles.savedBody}>Linked child: {linkedChild || "-"}</Text>
              <Text style={styles.savedBody}>Recurring: {isRecurring ? "Yes" : "No"}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F3F1ED"
  },
  content: {
    paddingHorizontal: 20
  },
  badgeWrap: {
    marginTop: 10
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#E7E8F7",
    color: "#3A3E81",
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 15
  },
  helper: {
    marginTop: 9,
    color: "#747AA2",
    fontSize: 14,
    lineHeight: 20
  },
  formCard: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3E0D8",
    backgroundColor: "#FAFAF8",
    padding: 14,
    gap: 10
  },
  fieldLabel: {
    color: "#8084A0",
    fontSize: 12,
    lineHeight: 16,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700"
  },
  textField: {
    marginTop: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E3E0D8",
    backgroundColor: "#F4F3EE",
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: "#363B80",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600"
  },
  gridRow: {
    flexDirection: "row",
    gap: 10
  },
  gridItem: {
    flex: 1
  },
  switchCard: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E3E0D8",
    backgroundColor: "#F4F3EE",
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  switchTitle: {
    color: "#3B3F80",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700"
  },
  switchSubtitle: {
    marginTop: 1,
    color: "#8A8EA7",
    fontSize: 12,
    lineHeight: 16
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: "#3B3F80",
    paddingVertical: 13,
    alignItems: "center"
  },
  saveButtonPressed: {
    transform: [{ scale: 0.985 }]
  },
  saveButtonText: {
    color: "#F4F5FC",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700"
  },
  savedCard: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CFE6D9",
    backgroundColor: "#EAF7EF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3
  },
  savedTitle: {
    color: "#2C7A4B",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  savedBody: {
    color: "#426150",
    fontSize: 13,
    lineHeight: 18
  }
});
