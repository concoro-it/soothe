import { Text } from "react-native";
import { Panel } from "@/components/Panel";
import { ScreenShell } from "@/components/ScreenShell";

export default function AskScreen() {
  return (
    <ScreenShell title="Ask Soothe" subtitle="Your family's memory, organized and ready.">
      <Panel>
        <Text>Search query input (text and voice).</Text>
      </Panel>
      <Panel>
        <Text>Grounded answer with source cards from payments, docs, and inbox.</Text>
      </Panel>
    </ScreenShell>
  );
}
