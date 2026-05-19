import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type VoiceReactiveOrbProps = {
  isRecording: boolean;
  voiceLevel: number;
  loading: boolean;
  onPress: () => void;
};

export function VoiceReactiveOrb({ isRecording, voiceLevel, loading, onPress }: VoiceReactiveOrbProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isRecording) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 620, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.98, duration: 620, useNativeDriver: true })
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [isRecording, pulse]);

  const liveBoost = Math.min(Math.max(voiceLevel, 0), 1);

  return (
    <Pressable onPress={onPress} style={styles.tapArea}>
      <Animated.View
        style={[
          styles.halo,
          {
            opacity: isRecording ? 0.2 + liveBoost * 0.4 : 0.06,
            transform: [{ scale: isRecording ? 0.98 + liveBoost * 0.12 : 1 }, { scale: pulse }]
          }
        ]}
      />

      <View style={[styles.ring, isRecording && styles.ringActive]}>
        <LinearGradient colors={["#F6D4F7", "#D8E5FD", "#C7F2E9"]} start={{ x: 0.14, y: 0.1 }} end={{ x: 0.88, y: 0.92 }} style={styles.core}>
          <View style={styles.blobA} />
          <View style={styles.blobB} />
          <View style={styles.blobC} />
          {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
        </LinearGradient>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tapArea: {
    width: 252,
    height: 252,
    alignItems: "center",
    justifyContent: "center"
  },
  halo: {
    position: "absolute",
    width: 214,
    height: 214,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.72)",
    shadowColor: "#FFE0FA",
    shadowOpacity: 0.42,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 10
    }
  },
  ring: {
    width: 206,
    height: 206,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)"
  },
  ringActive: {
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.92)"
  },
  core: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  blobA: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: "rgba(250, 160, 235, 0.42)",
    top: 30,
    left: 22
  },
  blobB: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: "rgba(148, 239, 227, 0.42)",
    top: 26,
    right: 24
  },
  blobC: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: "rgba(197, 177, 255, 0.34)",
    bottom: 18,
    left: 72
  }
});
