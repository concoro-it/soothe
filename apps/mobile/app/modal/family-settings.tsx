import { Text } from "react-native";
import { Panel } from "@/components/Panel";
import { ScreenShell } from "@/components/ScreenShell";

export default function FamilySettingsModal() {
  return (
    <ScreenShell title="Family Settings" subtitle="Members, children, invites, and roles.">
      <Panel>
        <Text>Manage family member roles and invite flow.</Text>
      </Panel>
    </ScreenShell>
  );
}
