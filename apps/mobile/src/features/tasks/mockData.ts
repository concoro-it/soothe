import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export type TaskChip = {
  label: string;
  leadingGlyph?: keyof typeof MaterialCommunityIcons.glyphMap;
};

export type TaskItem = {
  id: string;
  section: "pressing" | "upcoming";
  title: string;
  dueText: string;
  dueIcon: keyof typeof Ionicons.glyphMap;
  chips: TaskChip[];
  assignee: string;
  linkedChild: string;
  source: string;
  recurring: boolean;
};

export const taskItems: TaskItem[] = [
  {
    id: "consent-form",
    section: "pressing",
    title: "Sign kindergarten consent form",
    dueText: "Overdue",
    dueIcon: "alert-circle-outline",
    chips: [{ label: "Overdue" }, { label: "Leo" }, { label: "From Inbox", leadingGlyph: "file-document-outline" }],
    assignee: "Emma",
    linkedChild: "Leo",
    source: "Inbox",
    recurring: false
  },
  {
    id: "diapers",
    section: "pressing",
    title: "Buy diapers (Size 4)",
    dueText: "Today",
    dueIcon: "calendar-outline",
    chips: [{ label: "Mia" }, { label: "From Voice Note", leadingGlyph: "microphone-outline" }],
    assignee: "Emma",
    linkedChild: "Mia",
    source: "Voice Note",
    recurring: false
  },
  {
    id: "nanny",
    section: "upcoming",
    title: "Pay Nanny (Sarah)",
    dueText: "Friday",
    dueIcon: "calendar-outline",
    chips: [{ label: "Weekly", leadingGlyph: "repeat" }],
    assignee: "Dad",
    linkedChild: "Family",
    source: "Manual",
    recurring: true
  },
  {
    id: "pediatrician",
    section: "upcoming",
    title: "Book pediatrician appointment for 3-year checkup",
    dueText: "No specific date",
    dueIcon: "calendar-outline",
    chips: [{ label: "Leo" }],
    assignee: "Emma",
    linkedChild: "Leo",
    source: "Manual",
    recurring: false
  }
];

export const pressingTasks = taskItems.filter((task) => task.section === "pressing");
export const upcomingTasks = taskItems.filter((task) => task.section === "upcoming");

export function findTaskById(id: string) {
  return taskItems.find((task) => task.id === id);
}
