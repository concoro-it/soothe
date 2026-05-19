import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarEvent, useCalendarEvents } from "@/features/timeline/calendarStore";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const TODAY = new Date();
const TODAY_KEY = toDateKey(TODAY);

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const events = useCalendarEvents();

  const [monthCursor, setMonthCursor] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selectedDateKey, setSelectedDateKey] = useState(TODAY_KEY);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const monthLabel = useMemo(
    () =>
      monthCursor.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      }),
    [monthCursor]
  );

  const gridDays = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();

    events.forEach((event) => {
      const list = grouped.get(event.date) ?? [];
      list.push(event);
      grouped.set(event.date, list);
    });

    grouped.forEach((list) => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));

    return grouped;
  }, [events]);

  const selectedDateEvents = useMemo(() => {
    const selected = eventsByDate.get(selectedDateKey) ?? [];
    const normalized = searchText.trim().toLowerCase();

    if (!normalized) {
      return selected;
    }

    return selected.filter((event) => {
      const haystack = `${event.title} ${event.location ?? ""} ${event.child ?? ""} ${event.assignee ?? ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [eventsByDate, searchText, selectedDateKey]);

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 20,
            paddingBottom: Math.max(insets.bottom + 24, 36)
          }
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Calendar</Text>
          <View style={styles.headerActions}>
            <IconCircleButton icon="search-outline" onPress={() => setSearchOpen((current) => !current)} />
            <IconCircleButton
              icon="add"
              onPress={() => {
                router.push({
                  pathname: "/modal/new-event",
                  params: { date: selectedDateKey }
                });
              }}
            />
          </View>
        </View>

        {searchOpen ? (
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={16} color="#8C90A7" />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search title, location, child"
              placeholderTextColor="#A6A8B9"
              style={styles.searchInput}
              autoFocus
            />
            {searchText ? (
              <Pressable onPress={() => setSearchText("")}>
                <Ionicons name="close-circle" size={16} color="#A6A8B9" />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={styles.monthHeader}>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <View style={styles.monthActions}>
            <Pressable style={styles.monthActionButton} onPress={() => setMonthCursor(shiftMonth(monthCursor, -1))}>
              <Ionicons name="chevron-back" size={16} color="#6A6D87" />
            </Pressable>
            <Pressable style={styles.monthActionButton} onPress={() => setMonthCursor(shiftMonth(monthCursor, 1))}>
              <Ionicons name="chevron-forward" size={16} color="#6A6D87" />
            </Pressable>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.dayLabelRow}>
            {DAY_LABELS.map((label, index) => (
              <Text key={`${label}-${index}`} style={styles.dayLabel}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {gridDays.map((day) => {
              const dots = eventsByDate.get(day.key) ?? [];
              const selected = day.key === selectedDateKey;

              return (
                <Pressable
                  key={day.key}
                  style={[styles.dayCell, selected && styles.dayCellSelected]}
                  onPress={() => {
                    setSelectedDateKey(day.key);
                    if (day.monthOffset !== 0) {
                      setMonthCursor(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
                    }
                  }}
                >
                  <Text style={[styles.dayNumber, day.monthOffset !== 0 && styles.dayNumberMuted, selected && styles.dayNumberSelected]}>{day.date.getDate()}</Text>
                  <View style={styles.dotRow}>
                    {dots.slice(0, 2).map((event) => (
                      <View key={event.id} style={[styles.dot, { backgroundColor: event.color }]} />
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.scheduleWrap}>
          <Text style={styles.scheduleTitle}>Today&apos;s Schedule</Text>

          {selectedDateEvents.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateTitle}>No events for this date</Text>
              <Text style={styles.emptyStateBody}>Tap + to create a new event in your calendar.</Text>
            </View>
          ) : (
            <View style={styles.scheduleList}>
              {selectedDateEvents.map((event) => (
                <View key={event.id} style={styles.scheduleRow}>
                  <Text style={styles.eventTime}>{event.allDay ? "All Day" : event.startTime}</Text>
                  <Pressable
                    style={({ pressed }) => [styles.eventCard, { borderLeftColor: event.color }, pressed && styles.eventCardPressed]}
                    onPress={() =>
                      router.push({
                        pathname: "/modal/new-event",
                        params: { eventId: event.id, date: selectedDateKey }
                      })
                    }
                  >
                    <View style={styles.eventMain}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventLocation}>{event.location || "No location"}</Text>
                    </View>
                    <View style={styles.badgesRow}>
                      {event.child ? <BadgeBubble label={event.child} tone="rose" /> : null}
                      {event.assignee ? <BadgeBubble label={event.assignee} tone="slate" /> : null}
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function IconCircleButton({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]} onPress={onPress}>
      <Ionicons name={icon} size={21} color="#52577D" />
    </Pressable>
  );
}

function BadgeBubble({ label, tone }: { label: string; tone: "rose" | "slate" }) {
  return (
    <View style={[styles.badgeBubble, tone === "rose" ? styles.badgeRose : styles.badgeSlate]}>
      <Text style={styles.badgeText}>{label.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftMonth(base: Date, amount: number) {
  return new Date(base.getFullYear(), base.getMonth() + amount, 1);
}

function buildMonthGrid(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    return {
      date,
      key: toDateKey(date),
      monthOffset: date.getMonth() - month.getMonth() + (date.getFullYear() - month.getFullYear()) * 12
    };
  });
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F3F0EB"
  },
  content: {
    paddingHorizontal: 18,
    gap: 16
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: {
    color: "#3C3F78",
    fontSize: 32,
    lineHeight: 36,
    fontFamily: "PPEditorialNew-Regular"
  },
  headerActions: {
    flexDirection: "row",
    gap: 10
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#FDFCF9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E6E2DA"
  },
  iconButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9
  },
  searchWrap: {
    marginTop: -2,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2DFD8",
    backgroundColor: "#FCFBF8",
    paddingHorizontal: 12,
    height: 44
  },
  searchInput: {
    flex: 1,
    color: "#505572",
    fontSize: 14,
    fontFamily: "Inter"
  },
  monthHeader: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  monthLabel: {
    fontSize: 28,
    lineHeight: 32,
    color: "#3C3F78",
    fontFamily: "Inter",
    fontWeight: "700"
  },
  monthActions: {
    flexDirection: "row",
    gap: 8
  },
  monthActionButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  calendarCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E1D8",
    backgroundColor: "rgba(255,255,255,0.48)",
    paddingHorizontal: 10,
    paddingVertical: 12
  },
  dayLabelRow: {
    flexDirection: "row"
  },
  dayLabel: {
    flex: 1,
    textAlign: "center",
    color: "#A0A3B6",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    fontFamily: "Inter"
  },
  grid: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap"
  },
  dayCell: {
    width: "14.2857%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    paddingBottom: 8,
    minHeight: 52,
    borderRadius: 12
  },
  dayCellSelected: {
    backgroundColor: "#3C3F78"
  },
  dayNumber: {
    fontSize: 18,
    lineHeight: 22,
    color: "#404471",
    fontFamily: "Inter",
    fontWeight: "600"
  },
  dayNumberMuted: {
    color: "#B7BACA"
  },
  dayNumberSelected: {
    color: "#F9F7F3"
  },
  dotRow: {
    marginTop: 3,
    flexDirection: "row",
    gap: 4,
    minHeight: 8,
    alignItems: "center"
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 999
  },
  scheduleWrap: {
    marginTop: 2,
    borderRadius: 28,
    backgroundColor: "#FBFAF7",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: "#E7E4DD"
  },
  scheduleTitle: {
    fontSize: 24,
    lineHeight: 28,
    color: "#3C3F78",
    fontFamily: "Inter",
    fontWeight: "700"
  },
  scheduleList: {
    marginTop: 16,
    gap: 14
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  eventTime: {
    width: 48,
    paddingTop: 10,
    fontSize: 14,
    lineHeight: 18,
    color: "#9497A8",
    fontFamily: "Inter",
    fontWeight: "600"
  },
  eventCard: {
    flex: 1,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#E2E0D9",
    backgroundColor: "#F0F2F8",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  eventMain: {
    flex: 1,
    gap: 3
  },
  eventTitle: {
    color: "#3F4477",
    fontSize: 18,
    lineHeight: 22,
    fontFamily: "Inter",
    fontWeight: "700"
  },
  eventLocation: {
    color: "#707598",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "500",
    fontFamily: "Inter"
  },
  eventCardPressed: {
    transform: [{ scale: 0.995 }],
    opacity: 0.95
  },
  badgesRow: {
    flexDirection: "row",
    gap: 6
  },
  badgeBubble: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  badgeRose: {
    backgroundColor: "#E8B3C6"
  },
  badgeSlate: {
    backgroundColor: "#6D718D"
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Inter"
  },
  emptyStateCard: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E1D8",
    backgroundColor: "#F8F6F2",
    padding: 14,
    gap: 4
  },
  emptyStateTitle: {
    color: "#4B507E",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter"
  },
  emptyStateBody: {
    color: "#7D819B",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter"
  }
});
