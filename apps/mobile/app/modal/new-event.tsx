import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import * as Location from "expo-location";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { createCalendarEvent, updateCalendarEvent, useCalendarEvents } from "@/features/timeline/calendarStore";

type LocationSuggestion = {
  id: string;
  title: string;
  subtitle: string;
  label: string;
  lat: number;
  lon: number;
  distanceKm: number | null;
};

export default function NewEventModal() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ date?: string; eventId?: string }>();
  const events = useCalendarEvents();

  const editingEvent = useMemo(() => events.find((event) => event.id === params.eventId), [events, params.eventId]);

  const initialStart = useMemo(() => {
    const parsed = parseDateKey(params.date);
    if (parsed) {
      parsed.setHours(9, 0, 0, 0);
      return parsed;
    }

    const next = new Date();
    next.setHours(next.getHours() + 1, 0, 0, 0);
    return next;
  }, [params.date]);

  const [title, setTitle] = useState(editingEvent?.title ?? "");
  const [allDay, setAllDay] = useState(editingEvent?.allDay ?? false);
  const [startsAt, setStartsAt] = useState(() => fromDateAndTime(editingEvent?.date, editingEvent?.startTime, initialStart));
  const [endsAt, setEndsAt] = useState(() => fromDateAndTime(editingEvent?.date, editingEvent?.endTime, new Date(initialStart.getTime() + 60 * 60 * 1000)));
  const [location, setLocation] = useState(editingEvent?.location ?? "");
  const [child, setChild] = useState(editingEvent?.child ?? "");
  const [assignee, setAssignee] = useState(editingEvent?.assignee ?? "");
  const [notes, setNotes] = useState(editingEvent?.notes ?? "");
  const [openPicker, setOpenPicker] = useState<null | "startDate" | "startTime" | "endDate" | "endTime">(null);
  const [resolvingLocation, setResolvingLocation] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationInputFocused, setLocationInputFocused] = useState(false);

  function onStartDateChange(_event: DateTimePickerEvent, date?: Date) {
    if (!date) {
      return;
    }

    setStartsAt((current) => {
      const next = new Date(current);
      next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      return next;
    });

    setEndsAt((current) => {
      const next = new Date(current);
      next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());

      const nextStart = new Date(startsAt);
      nextStart.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());

      if (next < nextStart) {
        return new Date(nextStart.getTime() + 30 * 60 * 1000);
      }

      return next;
    });
  }

  function onStartTimeChange(_event: DateTimePickerEvent, time?: Date) {
    if (!time) {
      return;
    }

    setStartsAt((current) => {
      const next = new Date(current);
      next.setHours(time.getHours(), time.getMinutes(), 0, 0);
      return next;
    });

    setEndsAt((current) => {
      const next = new Date(current);
      if (next <= timeToDate(current, time)) {
        return new Date(timeToDate(current, time).getTime() + 30 * 60 * 1000);
      }
      return next;
    });
  }

  function onEndDateChange(_event: DateTimePickerEvent, date?: Date) {
    if (!date) {
      return;
    }

    setEndsAt((current) => {
      const next = new Date(current);
      next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      if (next < startsAt) {
        return new Date(startsAt.getTime() + 30 * 60 * 1000);
      }
      return next;
    });
  }

  function onEndTimeChange(_event: DateTimePickerEvent, time?: Date) {
    if (!time) {
      return;
    }

    setEndsAt((current) => {
      const next = new Date(current);
      next.setHours(time.getHours(), time.getMinutes(), 0, 0);
      if (next < startsAt) {
        return new Date(startsAt.getTime() + 30 * 60 * 1000);
      }
      return next;
    });
  }

  const addDisabled = !title.trim();
  const actionLabel = editingEvent ? "Save" : "Add";
  const headerLabel = editingEvent ? "Edit Event" : "New Event";

  function handleAdd() {
    if (addDisabled) {
      return;
    }

    const normalizedStart = allDay ? "00:00" : formatTime(startsAt);
    const normalizedEnd = allDay ? "23:59" : formatTime(endsAt < startsAt ? new Date(startsAt.getTime() + 30 * 60 * 1000) : endsAt);

    const payload = {
      title: title.trim(),
      date: toDateKey(startsAt),
      startTime: normalizedStart,
      endTime: normalizedEnd,
      location: location.trim() || undefined,
      child: child.trim() || undefined,
      assignee: assignee.trim() || undefined,
      notes: notes.trim() || undefined,
      color: editingEvent?.color ?? pickEventColor(title),
      allDay
    };

    if (editingEvent) {
      updateCalendarEvent(editingEvent.id, payload);
    } else {
      createCalendarEvent(payload);
    }

    router.back();
  }

  async function handleUseCurrentLocation() {
    if (resolvingLocation) {
      return;
    }

    try {
      setResolvingLocation(true);

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Location Permission", "Location access is required to autofill the event location.");
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      setCurrentCoords({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude
      });

      const places = await Location.reverseGeocodeAsync({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude
      });

      const first = places[0];
      const label = formatReverseGeocode(first);

      if (!label) {
        setLocation(`${current.coords.latitude.toFixed(4)}, ${current.coords.longitude.toFixed(4)}`);
        return;
      }

      setLocation(label);
    } catch (_error) {
      Alert.alert("Location Error", "Could not resolve your current location right now.");
    } finally {
      setResolvingLocation(false);
    }
  }

  useEffect(() => {
    const query = location.trim();
    if (query.length < 3 || !locationInputFocused) {
      setLocationSuggestions([]);
      return;
    }

    const timeout = setTimeout(() => {
      void searchLocationSuggestions(query);
    }, 350);

    return () => clearTimeout(timeout);
  }, [location, locationInputFocused, currentCoords]);

  async function searchLocationSuggestions(query: string) {
    try {
      setSearchingLocation(true);

      const params = new URLSearchParams({
        q: query,
        format: "jsonv2",
        limit: "6",
        "accept-language": "en"
      });

      if (currentCoords) {
        const delta = 0.35;
        const left = currentCoords.longitude - delta;
        const right = currentCoords.longitude + delta;
        const top = currentCoords.latitude + delta;
        const bottom = currentCoords.latitude - delta;
        params.set("viewbox", `${left},${top},${right},${bottom}`);
        params.set("bounded", "1");
      }

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        setLocationSuggestions([]);
        return;
      }

      const data = (await response.json()) as Array<{ place_id: number; display_name: string; lat: string; lon: string }>;
      const next = data
        .map((item) => {
          const lat = Number(item.lat);
          const lon = Number(item.lon);
          const { title, subtitle } = splitSuggestionLabel(item.display_name);
          const distanceKm =
            currentCoords === null ? null : getDistanceKm(currentCoords.latitude, currentCoords.longitude, lat, lon);

          return {
            id: String(item.place_id),
            title,
            subtitle,
            label: item.display_name,
            lat,
            lon,
            distanceKm
          };
        })
        .sort((a, b) => {
          if (a.distanceKm === null && b.distanceKm === null) {
            return 0;
          }
          if (a.distanceKm === null) {
            return 1;
          }
          if (b.distanceKm === null) {
            return -1;
          }
          return a.distanceKm - b.distanceKm;
        });

      setLocationSuggestions(next);
    } catch {
      setLocationSuggestions([]);
    } finally {
      setSearchingLocation(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + 4 }]}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

        <Text style={styles.headerTitle}>{headerLabel}</Text>

        <Pressable onPress={handleAdd} disabled={addDisabled}>
          <Text style={[styles.addText, addDisabled && styles.addTextDisabled]}>{actionLabel}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.groupCard}>
          <FormRow label="Title">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Add title"
              placeholderTextColor="#A1A5BA"
              style={styles.inlineInput}
              autoFocus
            />
          </FormRow>

          <Divider />

          <FormRow label="All-day">
            <Switch value={allDay} onValueChange={setAllDay} />
          </FormRow>
        </View>

        <View style={styles.groupCard}>
          <FormRow label="Starts" onPress={() => setOpenPicker((current) => (current === "startDate" ? null : "startDate"))}>
            <Text style={styles.valueText}>{formatDate(startsAt)}</Text>
          </FormRow>
          {openPicker === "startDate" ? (
            <View style={styles.pickerRow}>
              <DateTimePicker value={startsAt} mode="date" display={Platform.OS === "ios" ? "inline" : "default"} onChange={onStartDateChange} />
            </View>
          ) : null}

          {!allDay ? (
            <>
              <Divider />
              <FormRow label="Start time" onPress={() => setOpenPicker((current) => (current === "startTime" ? null : "startTime"))}>
                <Text style={styles.valueText}>{formatTime(startsAt)}</Text>
              </FormRow>
              {openPicker === "startTime" ? (
                <View style={styles.pickerRow}>
                  <DateTimePicker value={startsAt} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onStartTimeChange} />
                </View>
              ) : null}
            </>
          ) : null}

          <Divider />

          <FormRow label="Ends" onPress={() => setOpenPicker((current) => (current === "endDate" ? null : "endDate"))}>
            <Text style={styles.valueText}>{formatDate(endsAt < startsAt ? new Date(startsAt.getTime() + 30 * 60 * 1000) : endsAt)}</Text>
          </FormRow>
          {openPicker === "endDate" ? (
            <View style={styles.pickerRow}>
              <DateTimePicker value={endsAt < startsAt ? new Date(startsAt.getTime() + 30 * 60 * 1000) : endsAt} mode="date" display={Platform.OS === "ios" ? "inline" : "default"} onChange={onEndDateChange} />
            </View>
          ) : null}

          {!allDay ? (
            <>
              <Divider />
              <FormRow label="End time" onPress={() => setOpenPicker((current) => (current === "endTime" ? null : "endTime"))}>
                <Text style={styles.valueText}>{formatTime(endsAt < startsAt ? new Date(startsAt.getTime() + 30 * 60 * 1000) : endsAt)}</Text>
              </FormRow>
              {openPicker === "endTime" ? (
                <View style={styles.pickerRow}>
                  <DateTimePicker
                    value={endsAt < startsAt ? new Date(startsAt.getTime() + 30 * 60 * 1000) : endsAt}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onEndTimeChange}
                  />
                </View>
              ) : null}
            </>
          ) : null}
        </View>

        <View style={styles.groupCard}>
          <View style={styles.locationBlock}>
            <View style={styles.locationTopRow}>
              <Text style={styles.locationLabel}>Location</Text>
              <Pressable style={({ pressed }) => [styles.locationCurrentButton, pressed && styles.locationCurrentButtonPressed]} onPress={() => void handleUseCurrentLocation()}>
                <Ionicons name="navigate-circle-outline" size={14} color="#4B5ED2" />
                <Text style={styles.locationCurrentButtonText}>{resolvingLocation ? "Locating..." : "Current"}</Text>
              </Pressable>
            </View>

            <View style={styles.locationInputWrap}>
              <Ionicons name="location-outline" size={17} color="#7E84A0" />
              <TextInput
                value={location}
                onChangeText={setLocation}
                onFocus={() => setLocationInputFocused(true)}
                onBlur={() => {
                  setTimeout(() => {
                    setLocationInputFocused(false);
                  }, 120);
                }}
                placeholder="Search place, venue, address"
                placeholderTextColor="#A1A5BA"
                style={styles.locationInput}
              />
              {location.trim().length > 0 ? (
                <Pressable onPress={() => setLocation("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color="#B0B6CF" />
                </Pressable>
              ) : null}
            </View>
          </View>

          {locationInputFocused ? (
            <View style={styles.suggestionPanel}>
              {searchingLocation ? <Text style={styles.suggestionHint}>Searching places...</Text> : null}
              {!searchingLocation && location.trim().length >= 3 && locationSuggestions.length === 0 ? <Text style={styles.suggestionHint}>No place found nearby.</Text> : null}
              {locationSuggestions.map((suggestion) => (
                <Pressable
                  key={suggestion.id}
                  style={({ pressed }) => [styles.suggestionItem, pressed && styles.suggestionItemPressed]}
                  onPress={() => {
                    setLocation(suggestion.label);
                    setLocationSuggestions([]);
                    setLocationInputFocused(false);
                    setCurrentCoords({ latitude: suggestion.lat, longitude: suggestion.lon });
                  }}
                >
                  <View style={styles.suggestionLeadingIcon}>
                    <Ionicons name="location" size={14} color="#4D5FAF" />
                  </View>
                  <View style={styles.suggestionBody}>
                    <Text numberOfLines={1} style={styles.suggestionTitle}>
                      {suggestion.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.suggestionSubtitle}>
                      {suggestion.subtitle}
                    </Text>
                  </View>
                  {suggestion.distanceKm !== null ? (
                    <View style={styles.distanceChip}>
                      <Text style={styles.distanceChipText}>{formatDistanceKm(suggestion.distanceKm)}</Text>
                    </View>
                  ) : null}
                </Pressable>
              ))}
            </View>
          ) : null}

          <Divider />

          <FormRow label="Child">
            <TextInput value={child} onChangeText={setChild} placeholder="e.g. Mia" placeholderTextColor="#A1A5BA" style={styles.inlineInput} />
          </FormRow>

          <Divider />

          <FormRow label="Assignee">
            <TextInput value={assignee} onChangeText={setAssignee} placeholder="e.g. Kelly" placeholderTextColor="#A1A5BA" style={styles.inlineInput} />
          </FormRow>
        </View>

        <View style={styles.groupCard}>
          <Text style={styles.notesLabel}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes"
            placeholderTextColor="#A1A5BA"
            style={styles.notesInput}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FormRow({ label, children, onPress }: { label: string; children: ReactNode; onPress?: () => void }) {
  const content = (
    <View style={styles.formRow}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.formValue}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.formRowPressed]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

function Divider() {
  return <View style={styles.divider} />;
}

function parseDateKey(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function timeToDate(base: Date, time: Date) {
  const next = new Date(base);
  next.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return next;
}

function pickEventColor(title: string) {
  const palette = ["#DF839E", "#6EA6F7", "#4A4B84", "#B688E7", "#5DA798"] as const;
  const hash = title
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    .toString(10);

  return palette[Number(hash) % palette.length];
}

function fromDateAndTime(dateKey: string | undefined, time: string | undefined, fallback: Date) {
  const date = parseDateKey(dateKey) ?? new Date(fallback);
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    return date;
  }

  const [hours, minutes] = time.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatReverseGeocode(place: Location.LocationGeocodedAddress | null | undefined) {
  if (!place) {
    return "";
  }

  const line = [place.name, place.street].filter(Boolean).join(" ");
  const cityLine = [place.city, place.region].filter(Boolean).join(", ");

  return [line, cityLine].filter(Boolean).join(" • ");
}

function splitSuggestionLabel(label: string) {
  const [head, ...rest] = label.split(",");
  return {
    title: head?.trim() || label,
    subtitle: rest.join(",").trim() || "Address details unavailable"
  };
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(value: number) {
  return value * (Math.PI / 180);
}

function formatDistanceKm(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F2EFE9"
  },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E1D8"
  },
  cancelText: {
    color: "#6870A4",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "500",
    fontFamily: "Inter"
  },
  headerTitle: {
    color: "#3B3F78",
    fontSize: 20,
    lineHeight: 24,
    fontFamily: "Inter",
    fontWeight: "700"
  },
  addText: {
    color: "#4355BF",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    fontFamily: "Inter"
  },
  addTextDisabled: {
    color: "#A8AFCF"
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 30,
    gap: 14
  },
  groupCard: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E1DDD4",
    backgroundColor: "#FCFBF8"
  },
  formRow: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  formLabel: {
    color: "#5D617E",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
    fontFamily: "Inter"
  },
  formValue: {
    flex: 1,
    alignItems: "flex-end"
  },
  inlineInput: {
    width: "100%",
    color: "#3D426B",
    fontSize: 16,
    textAlign: "right",
    fontFamily: "Inter"
  },
  valueText: {
    color: "#4355BF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: "Inter"
  },
  divider: {
    height: 1,
    backgroundColor: "#E7E4DD",
    marginLeft: 14
  },
  locationBlock: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10
  },
  locationTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  locationLabel: {
    color: "#5D617E",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
    fontFamily: "Inter"
  },
  locationCurrentButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D5DBFA",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  locationCurrentButtonPressed: {
    opacity: 0.9
  },
  locationCurrentButtonText: {
    color: "#4355BF",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    fontFamily: "Inter"
  },
  locationInputWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DADFEB",
    backgroundColor: "#F8F9FF",
    paddingHorizontal: 10,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  locationInput: {
    flex: 1,
    color: "#3D426B",
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter"
  },
  suggestionPanel: {
    marginHorizontal: 12,
    marginBottom: 10,
    marginTop: -2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E5F5",
    backgroundColor: "#F9FAFF",
    padding: 8,
    gap: 6
  },
  suggestionHint: {
    color: "#7E84A0",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter",
    paddingHorizontal: 4,
    paddingVertical: 2
  },
  suggestionItem: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E6F4",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  suggestionItemPressed: {
    backgroundColor: "#F2F5FF"
  },
  suggestionLeadingIcon: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center"
  },
  suggestionBody: {
    flex: 1,
    gap: 2
  },
  suggestionTitle: {
    color: "#38447C",
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter",
    fontWeight: "700"
  },
  suggestionSubtitle: {
    color: "#7A809B",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter"
  },
  distanceChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#F0F3FF",
    borderWidth: 1,
    borderColor: "#DDE3F8"
  },
  distanceChipText: {
    color: "#5662A3",
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter",
    fontWeight: "700"
  },
  pickerRow: {
    borderTopWidth: 1,
    borderTopColor: "#EFECE6",
    backgroundColor: "#FAF8F4"
  },
  notesLabel: {
    paddingHorizontal: 14,
    paddingTop: 12,
    color: "#5D617E",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter"
  },
  notesInput: {
    minHeight: 120,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    color: "#3D426B",
    fontSize: 15,
    lineHeight: 21,
    fontFamily: "Inter"
  },
  formRowPressed: {
    opacity: 0.9
  }
});
