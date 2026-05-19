import { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

type VoiceReadyWaveformProps = {
  active?: boolean;
};

const BAR_COUNT = 5;

export function VoiceReadyWaveform({ active = true }: VoiceReadyWaveformProps) {
  const bars = useRef(Array.from({ length: BAR_COUNT }, () => new Animated.Value(6))).current;

  const barAnims = useMemo(
    () =>
      bars.map((bar) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: 18,
              duration: 220,
              useNativeDriver: false
            }),
            Animated.timing(bar, {
              toValue: 8,
              duration: 260,
              useNativeDriver: false
            })
          ])
        )
      ),
    [bars]
  );

  useEffect(() => {
    if (!active) {
      bars.forEach((bar) => bar.setValue(6));
      return;
    }

    const timers = barAnims.map((anim, index) => setTimeout(() => anim.start(), index * 90));

    return () => {
      timers.forEach((id) => clearTimeout(id));
      barAnims.forEach((anim) => anim.stop());
    };
  }, [active, barAnims, bars]);

  return (
    <View style={styles.row}>
      {bars.map((height, index) => (
        <Animated.View key={index} style={[styles.bar, { height }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  bar: {
    width: 3,
    backgroundColor: "#464690",
    borderRadius: 999
  }
});
