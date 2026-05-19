import { Text } from "react-native";
import { Panel } from "@/components/Panel";
import { ScreenShell } from "@/components/ScreenShell";

export default function ReviewModal() {
  return (
    <ScreenShell title="Review & Save" subtitle="AI suggestions require your confirmation.">
      <Panel>
        <Text>Candidate event, payment, task, and document rows with confidence badges.</Text>
      </Panel>
    </ScreenShell>
  );
}
