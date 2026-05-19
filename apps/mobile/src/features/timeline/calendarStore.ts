import { useSyncExternalStore } from "react";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  child?: string;
  assignee?: string;
  color: string;
  allDay: boolean;
  notes?: string;
};

type CreateCalendarEventInput = Omit<CalendarEvent, "id">;
type UpdateCalendarEventInput = Omit<CalendarEvent, "id">;
const TODAY_KEY = formatDateKey(new Date());

const seedEvents: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "School Drop-off",
    date: TODAY_KEY,
    startTime: "08:00",
    endTime: "08:30",
    location: "St. Mary's Primary",
    child: "Mia",
    assignee: "Kelly",
    color: "#DF839E",
    allDay: false
  },
  {
    id: "evt-2",
    title: "Weekly Grocery Run",
    date: TODAY_KEY,
    startTime: "11:30",
    endTime: "12:15",
    location: "Whole Foods Market",
    assignee: "Daniel",
    color: "#6EA6F7",
    allDay: false
  },
  {
    id: "evt-3",
    title: "Soccer Practice",
    date: TODAY_KEY,
    startTime: "16:00",
    endTime: "17:30",
    location: "Central Park Field 4",
    child: "Leo",
    assignee: "Kelly",
    color: "#4A4B84",
    allDay: false
  }
];

let events: CalendarEvent[] = seedEvents;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((listener) => listener());
}

function getSnapshot() {
  return events;
}

export function useCalendarEvents() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function createCalendarEvent(input: CreateCalendarEventInput) {
  const nextEvent: CalendarEvent = {
    ...input,
    id: `evt-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`
  };

  events = [nextEvent, ...events];
  emit();

  return nextEvent;
}

export function updateCalendarEvent(id: string, input: UpdateCalendarEventInput) {
  const eventIndex = events.findIndex((event) => event.id === id);
  if (eventIndex < 0) {
    return null;
  }

  const nextEvent: CalendarEvent = {
    ...input,
    id
  };

  events = events.map((event) => (event.id === id ? nextEvent : event));
  emit();

  return nextEvent;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
