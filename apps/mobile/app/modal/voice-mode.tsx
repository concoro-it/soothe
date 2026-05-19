import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VoiceReactiveOrb } from "@/components/voice/VoiceReactiveOrb";

const voicePalette = {
  top: "#F6A7C9",
  bottom: "#3F417E",
  white: "#F6F8FF",
  muted: "rgba(246, 248, 255, 0.78)",
  mutedIcon: "#CFCFD3",
  rose: "#EFA3CB",
  dockBg: "rgba(248, 248, 248, 0.97)"
} as const;

export default function VoiceModeModal() {
  const insets = useSafeAreaInsets();
  const [permissionReady, setPermissionReady] = useState<boolean | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const transitionLockRef = useRef(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const previewSoundRef = useRef<Audio.Sound | null>(null);

  const isRecording = useMemo(() => recording !== null, [recording]);
  const hasReviewReady = recordingUri !== null;

  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);

  useEffect(() => {
    return () => {
      void unloadPreviewSound();
    };
  }, []);

  useEffect(() => {
    if (!recordingUri) {
      void unloadPreviewSound();
    }
  }, [recordingUri]);

  async function unloadPreviewSound() {
    if (!previewSoundRef.current) {
      setIsPreviewPlaying(false);
      return;
    }

    try {
      previewSoundRef.current.setOnPlaybackStatusUpdate(null);
      await previewSoundRef.current.unloadAsync();
    } catch (error) {
      console.warn("Failed to unload preview sound:", error);
    } finally {
      previewSoundRef.current = null;
      setIsPreviewPlaying(false);
    }
  }

  useEffect(() => {
    void requestMicPermission();
  }, []);

  async function requestMicPermission() {
    const permission = await Audio.requestPermissionsAsync();
    setPermissionReady(permission.granted);
    return permission.granted;
  }

  async function startRecording(resetReview: boolean) {
    if (transitionLockRef.current || recordingRef.current) {
      return;
    }

    transitionLockRef.current = true;

    try {
      let micAllowed = permissionReady === true;
      if (permissionReady !== true) {
        micAllowed = await requestMicPermission();
      }
      if (!micAllowed) {
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });
      await unloadPreviewSound();

      const created = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      created.recording.setProgressUpdateInterval(80);
      created.recording.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording) {
          setVoiceLevel(0);
          return;
        }

        if (typeof status.metering === "number") {
          const normalized = Math.min(Math.max((status.metering + 60) / 60, 0), 1);
          setVoiceLevel(normalized);
        }
      });

      if (resetReview) {
        setRecordingUri(null);
      }
      setRecording(created.recording);
    } catch (error) {
      console.warn("Failed to start recording:", error);
    } finally {
      transitionLockRef.current = false;
    }
  }

  async function stopRecording() {
    if (transitionLockRef.current) {
      return;
    }

    const currentRecording = recordingRef.current;
    if (!currentRecording) {
      return;
    }

    transitionLockRef.current = true;

    try {
      currentRecording.setOnRecordingStatusUpdate(null);
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();

      setRecordingUri(uri ?? null);
      setRecording(null);
      setVoiceLevel(0);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false
      });
    } catch (error) {
      console.warn("Failed to stop recording:", error);
    } finally {
      transitionLockRef.current = false;
    }
  }

  async function handleTalkOrbTap() {
    if (permissionReady === null) {
      return;
    }
    if (isRecording) {
      await stopRecording();
      return;
    }
    await startRecording(true);
  }

  async function handleReadyOrbTap() {
    if (transitionLockRef.current || !recordingUri) {
      return;
    }

    transitionLockRef.current = true;
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true
      });

      if (!previewSoundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: recordingUri },
          { shouldPlay: true },
          (status) => {
            if (!status.isLoaded) {
              setIsPreviewPlaying(false);
              return;
            }
            if (status.didJustFinish) {
              setIsPreviewPlaying(false);
              return;
            }
            setIsPreviewPlaying(status.isPlaying);
          }
        );
        previewSoundRef.current = sound;
        setIsPreviewPlaying(true);
        return;
      }

      const status = await previewSoundRef.current.getStatusAsync();
      if (!status.isLoaded) {
        await unloadPreviewSound();
        return;
      }

      if (status.isPlaying) {
        await previewSoundRef.current.pauseAsync();
        setIsPreviewPlaying(false);
      } else {
        await previewSoundRef.current.playAsync();
        setIsPreviewPlaying(true);
      }
    } catch (error) {
      console.warn("Failed to toggle preview playback:", error);
      setIsPreviewPlaying(false);
    } finally {
      transitionLockRef.current = false;
    }
  }

  async function handleSave() {
    if (!hasReviewReady || isRecording) {
      return;
    }
    await unloadPreviewSound();
    router.push("/modal/review");
  }

  const heading = hasReviewReady ? "Voice note ready to review" : "Talk to me";
  const subtitle = "Use your voice to capture tasks, events, reminders or even payments.";
  const reviewHint = isPreviewPlaying ? "Tap pause to stop" : "Tap play to listen";
  const showReviewHint = hasReviewReady && !isPreviewPlaying;

  return (
    <LinearGradient colors={[voicePalette.top, voicePalette.bottom]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 2 }]}>
        <Text style={styles.headerTitle}>Voice mode</Text>
        <Pressable style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={voicePalette.white} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{heading}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.orbShell}>
          {hasReviewReady ? (
            <Pressable style={styles.reviewOrb} onPress={() => void handleReadyOrbTap()}>
              {isPreviewPlaying ? (
                <View style={styles.pauseBadge}>
                  <View style={styles.pauseStick} />
                  <View style={styles.pauseStick} />
                </View>
              ) : (
                <Ionicons name="play-outline" size={54} color={voicePalette.white} />
              )}
            </Pressable>
          ) : (
            <VoiceReactiveOrb isRecording={isRecording} voiceLevel={voiceLevel} loading={permissionReady === null} onPress={() => void handleTalkOrbTap()} />
          )}
        </View>

        {hasReviewReady ? (showReviewHint ? <Text style={styles.hintText}>{reviewHint}</Text> : null) : <Text style={styles.hintText}>{permissionReady ? (isRecording ? "Tap ring to stop" : "Tap ring to start") : "Allow microphone to continue"}</Text>}

        {hasReviewReady ? (
          <Pressable style={[styles.saveButton, showReviewHint ? styles.saveButtonWithHint : styles.saveButtonNoHint, isRecording && styles.saveButtonDisabled]} disabled={isRecording} onPress={() => void handleSave()}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        ) : null}

        {permissionReady === false ? (
          <Pressable style={styles.permissionButton} onPress={() => void requestMicPermission()}>
            <Text style={styles.permissionButtonText}>Allow Microphone</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.bottomDockWrap, { paddingBottom: Math.max(insets.bottom - 6, 0) }]}>
        <View style={styles.bottomDock}>
          <Pressable style={({ pressed }) => [styles.navTap, pressed && styles.pressed]} onPress={() => router.replace("/(tabs)/home")}>
            <Ionicons name="home-outline" size={25} color={voicePalette.mutedIcon} />
          </Pressable>
          <Pressable style={({ pressed }) => [styles.navTap, pressed && styles.pressed]} onPress={() => router.replace("/(tabs)/timeline")}>
            <Ionicons name="calendar-outline" size={24} color={voicePalette.mutedIcon} />
          </Pressable>
          <View style={styles.centerSpacer} />
          <Pressable style={({ pressed }) => [styles.navTap, pressed && styles.pressed]} onPress={() => router.replace("/(tabs)/tasks")}>
            <Ionicons name="list-outline" size={25} color={voicePalette.mutedIcon} />
          </Pressable>
          <Pressable style={({ pressed }) => [styles.navTap, pressed && styles.pressed]} onPress={() => router.push("/modal/payments")}>
            <Ionicons name="card-outline" size={24} color={voicePalette.mutedIcon} />
          </Pressable>
        </View>
        <Pressable style={({ pressed }) => [styles.fabWrap, pressed && styles.fabPressed]} onPress={() => router.replace("/(tabs)/ask")}>
          <View style={styles.fabInner}>
            <Ionicons name="add" size={42} color={voicePalette.white} />
          </View>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  header: {
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerTitle: {
    color: voicePalette.white,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600"
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center"
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 66
  },
  title: {
    color: voicePalette.white,
    fontSize: 32,
    lineHeight: 39,
    textAlign: "center",
    fontFamily: "PPEditorialNew-Regular"
  },
  subtitle: {
    marginTop: 10,
    color: voicePalette.muted,
    textAlign: "center",
    fontSize: 17,
    lineHeight: 23,
    maxWidth: 332,
    fontWeight: "500"
  },
  orbShell: {
    marginTop: 54,
    minHeight: 218,
    alignItems: "center",
    justifyContent: "center"
  },
  reviewOrb: {
    width: 182,
    height: 182,
    borderRadius: 999,
    backgroundColor: voicePalette.rose,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)"
  },
  pauseBadge: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: voicePalette.white,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5
  },
  pauseStick: {
    width: 4,
    height: 12,
    borderRadius: 2,
    backgroundColor: voicePalette.white
  },
  saveButton: {
    minWidth: 120,
    height: 48,
    borderRadius: 999,
    paddingHorizontal: 24,
    backgroundColor: voicePalette.white,
    alignItems: "center",
    justifyContent: "center"
  },
  saveButtonWithHint: {
    marginTop: 46
  },
  saveButtonNoHint: {
    marginTop: 98
  },
  saveButtonDisabled: {
    opacity: 0.55
  },
  saveText: {
    color: "#3C3E80",
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Inter",
    fontWeight: "700"
  },
  hintText: {
    marginTop: 38,
    color: voicePalette.muted,
    textAlign: "center",
    fontSize: 17,
    lineHeight: 23,
    opacity: 0.92,
    fontWeight: "500"
  },
  permissionButton: {
    marginTop: 24,
    height: 44,
    borderRadius: 999,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: "rgba(246, 248, 255, 0.38)",
    alignItems: "center",
    justifyContent: "center"
  },
  permissionButtonText: {
    color: voicePalette.white,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600"
  },
  bottomDockWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center"
  },
  bottomDock: {
    width: "98%",
    maxWidth: 760,
    height: 66,
    borderRadius: 22,
    backgroundColor: voicePalette.dockBg,
    borderWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 14
  },
  centerSpacer: {
    width: 58
  },
  navTap: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  fabWrap: {
    position: "absolute",
    top: -26
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: voicePalette.rose,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#55345A",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6
    },
    elevation: 7
  },
  fabPressed: {
    transform: [{ scale: 0.97 }]
  },
  pressed: {
    opacity: 0.78
  }
});
