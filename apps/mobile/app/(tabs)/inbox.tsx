import { Link } from "expo-router";
import { Pressable, Text } from "react-native";
import { Panel } from "@/components/Panel";
import { ScreenShell } from "@/components/ScreenShell";

export default function InboxScreen() {
  return (
    <ScreenShell title="Drop it here." subtitle="Upload notes, photos, PDFs, and voice notes.">
      <Panel>
        <Text>Capture composer: Photo, Doc, Voice, Text note</Text>
      </Panel>
      <Panel>
        <Text>Recent Drop</Text>
        <Link href="/modal/review" asChild>
          <Pressable>
            <Text>Open pending AI review</Text>
          </Pressable>
        </Link>
      </Panel>
    </ScreenShell>
  );
}
