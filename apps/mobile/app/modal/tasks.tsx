import { Text } from "react-native";
import { Panel } from "@/components/Panel";
import { ScreenShell } from "@/components/ScreenShell";

export default function TasksModal() {
  return (
    <ScreenShell title="Tasks" subtitle="My plate and Everyone views.">
      <Panel>
        <Text>Task list + create/edit with due date, assignee, linked child, recurring flag.</Text>
      </Panel>
    </ScreenShell>
  );
}
