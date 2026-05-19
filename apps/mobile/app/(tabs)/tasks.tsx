import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo, useState } from "react";
import { pressingTasks, TaskItem, upcomingTasks } from "@/features/tasks/mockData";
import { TasksStickyHeader } from "@/features/tasks/TasksStickyHeader";

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const [showRecurringOnly, setShowRecurringOnly] = useState(false);

  const visiblePressing = useMemo(
    () => (showRecurringOnly ? pressingTasks.filter((task) => task.recurring) : pressingTasks),
    [showRecurringOnly]
  );
  const visibleUpcoming = useMemo(
    () => (showRecurringOnly ? upcomingTasks.filter((task) => task.recurring) : upcomingTasks),
    [showRecurringOnly]
  );

  return (
    <View style={styles.root}>
      <TasksStickyHeader title="Tasks" topInset={insets.top} onBack={() => router.replace("/(tabs)/home")} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 64,
            paddingBottom: 106 + Math.max(insets.bottom, 8)
          }
        ]}
      >
        <View style={styles.segmentedControl}>
          <View style={[styles.segment, styles.segmentActive]}>
            <Text style={[styles.segmentText, styles.segmentTextActive]}>My Plate</Text>
          </View>
          <View style={styles.segment}>
            <Text style={styles.segmentText}>Everyone</Text>
          </View>
        </View>

        <Text style={styles.introText}>Here&apos;s what needs attention. Tap any task to open single-task view.</Text>

        <View style={styles.switchCard}>
          <View>
            <Text style={styles.switchTitle}>Recurring only</Text>
            <Text style={styles.switchSubtitle}>Show only recurring tasks in this list.</Text>
          </View>
          <Switch value={showRecurringOnly} onValueChange={setShowRecurringOnly} />
        </View>

        <SectionLabel title="Pressing" />
        <View style={styles.cardsColumn}>
          {visiblePressing.map((task, index) => (
            <TaskItemCard key={task.id} task={task} urgent={index === 0} />
          ))}
          {visiblePressing.length === 0 ? <Text style={styles.emptyHint}>No pressing recurring tasks.</Text> : null}
        </View>

        <SectionLabel title="Upcoming" />
        <View style={styles.cardsColumn}>
          {visibleUpcoming.map((task) => (
            <TaskItemCard key={task.id} task={task} />
          ))}
          {visibleUpcoming.length === 0 ? <Text style={styles.emptyHint}>No upcoming recurring tasks.</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function TaskItemCard({ task, urgent = false }: { task: TaskItem; urgent?: boolean }) {
  return (
    <Pressable onPress={() => router.push(`/task/${task.id}`)} style={({ pressed }) => [styles.card, urgent && styles.cardUrgent, pressed && styles.cardPressed]}>
      <View style={styles.cardTopRow}>
        <View style={styles.checkbox} />

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{task.title}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.dateChip, urgent && styles.dateChipUrgent]}>
              <Ionicons name={task.dueIcon} size={11} color={urgent ? "#ED3B47" : "#7D829D"} />
              <Text style={[styles.dateChipText, urgent && styles.dateChipTextUrgent]}>
                {task.dueText}
                {urgent ? " (Yesterday)" : ""}
              </Text>
            </View>

            {task.chips
              .filter((chip) => chip.label !== "Overdue")
              .map((chip) => (
                <View key={`${task.id}-${chip.label}`} style={styles.metaChip}>
                  {chip.leadingGlyph ? <MaterialCommunityIcons name={chip.leadingGlyph} size={10} color="#ACB0C3" /> : null}
                  <Text style={styles.metaChipText}>{chip.label}</Text>
                </View>
              ))}
          </View>
        </View>
      </View>
    </Pressable>
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
  segmentedControl: {
    marginTop: 10,
    backgroundColor: "#E9E7E1",
    borderRadius: 14,
    padding: 4,
    flexDirection: "row"
  },
  segment: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  segmentActive: {
    backgroundColor: "#FAF9F6",
    shadowColor: "#807B70",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2
    },
    elevation: 1
  },
  segmentText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#6D7197",
    fontWeight: "600"
  },
  segmentTextActive: {
    color: "#373C80",
    fontWeight: "700"
  },
  introText: {
    marginTop: 18,
    color: "#75799B",
    fontSize: 14,
    lineHeight: 21
  },
  switchCard: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3E0D8",
    backgroundColor: "#FAF9F6",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  switchTitle: {
    color: "#3B3F80",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700"
  },
  switchSubtitle: {
    marginTop: 2,
    color: "#8A8EA7",
    fontSize: 12,
    lineHeight: 16
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    color: "#9A9EB2",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700"
  },
  cardsColumn: {
    gap: 12
  },
  emptyHint: {
    color: "#9194AA",
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic"
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#E6E4DE",
    paddingHorizontal: 13,
    paddingVertical: 16
  },
  cardUrgent: {
    borderColor: "#F4D2D5",
    shadowColor: "#D899A1",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2
    }
  },
  cardPressed: {
    transform: [{ scale: 0.997 }],
    opacity: 0.97
  },
  cardTopRow: {
    flexDirection: "row",
    gap: 12
  },
  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#D3D6E1",
    marginTop: 3
  },
  cardBody: {
    flex: 1,
    gap: 8
  },
  cardTitle: {
    color: "#363B80",
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.1,
    fontWeight: "700"
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 7
  },
  dateChip: {
    borderRadius: 8,
    backgroundColor: "#F0EFEC",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3
  },
  dateChipUrgent: {
    backgroundColor: "#FFE8EA"
  },
  dateChipText: {
    color: "#6D7197",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  dateChipTextUrgent: {
    color: "#ED3B47"
  },
  metaChip: {
    borderRadius: 7,
    backgroundColor: "#F0EFEC",
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 3
  },
  metaChipText: {
    color: "#A3A6BA",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700"
  }
});
