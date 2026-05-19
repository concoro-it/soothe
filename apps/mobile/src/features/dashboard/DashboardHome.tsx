import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Alert, Animated, Easing, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

type DropItem = {
  id: string;
  title: string;
  meta: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  muted?: boolean;
};

const initialRecentDrops: DropItem[] = [
  {
    id: "shot-1",
    title: "Screenshot_20260414.png",
    meta: "Added by you • Just now",
    icon: "camera"
  },
  {
    id: "note-1",
    title: '"Remind me to buy diapers..."',
    meta: "Added by you • Just now",
    icon: "camera",
    muted: true
  },
  {
    id: "shot-2",
    title: "Screenshot_20260414.png",
    meta: "Added by you • Just now",
    icon: "camera",
    muted: true
  }
];

export function DashboardHome() {
  const insets = useSafeAreaInsets();
  const [promptText, setPromptText] = useState("");
  const [recentExpanded, setRecentExpanded] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [recentDrops, setRecentDrops] = useState<DropItem[]>(initialRecentDrops);
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const estimatedListHeight = recentDrops.length * 78 + Math.max(0, recentDrops.length - 1) * 10;

  function animateRecent(toValue: 0 | 1) {
    dropdownAnim.stopAnimation();
    Animated.timing(dropdownAnim, {
      toValue,
      duration: 320,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false
    }).start();
  }

  function openRecent() {
    if (recentExpanded) {
      return;
    }

    setRecentExpanded(true);
    animateRecent(1);
  }

  function closeRecent() {
    if (!recentExpanded) {
      return;
    }

    setRecentExpanded(false);
    animateRecent(0);
  }

  function toggleRecent() {
    if (recentExpanded) {
      closeRecent();
      return;
    }

    openRecent();
  }

  function closeProfileMenu() {
    setProfileMenuOpen(false);
  }

  function toggleProfileMenu() {
    setProfileMenuOpen((current) => !current);
  }

  function openRoute(path: "/onboarding/profile" | "/modal/documents" | "/modal/family-settings") {
    closeProfileMenu();
    router.push(path);
  }

  function addRecent(item: DropItem) {
    setRecentDrops((current) => [item, ...current]);
    openRecent();
  }

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Enable camera access to take a photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (result.canceled) {
      return;
    }

    addRecent({
      id: `photo-${Date.now()}`,
      title: result.assets[0].fileName ?? "Camera_Photo.png",
      meta: "Added by you • Just now",
      icon: "camera"
    });
  }

  async function handlePickFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Enable gallery access to select an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      selectionLimit: 1
    });
    if (result.canceled) {
      return;
    }

    addRecent({
      id: `gallery-${Date.now()}`,
      title: result.assets[0].fileName ?? "Screenshot.png",
      meta: "Added by you • Just now",
      icon: "camera"
    });
  }

  function handleAddPress() {
    closeProfileMenu();
    Alert.alert("Add", "Choose an input", [
      { text: "Take photo", onPress: () => void handleTakePhoto() },
      { text: "Pick from gallery", onPress: () => void handlePickFromGallery() },
      { text: "Upload document", onPress: () => void handleDocumentAction() },
      { text: "Cancel", style: "cancel" }
    ]);
  }

  async function handleDocumentAction() {
    const result = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
    if (result.canceled) {
      return;
    }

    addRecent({
      id: `doc-${Date.now()}`,
      title: result.assets[0].name,
      meta: "Added by you • Just now",
      icon: "file-document-outline"
    });
  }

  function handleVoiceAction() {
    closeProfileMenu();
    router.push("/modal/voice-mode");
  }

  function handleSubmitPrompt() {
    const normalized = promptText.trim();
    if (!normalized) {
      return;
    }

    addRecent({
      id: `prompt-${Date.now()}`,
      title: normalized.length > 28 ? `${normalized.slice(0, 28)}...` : normalized,
      meta: "Added by you • Just now",
      icon: "text-box-outline"
    });
    setPromptText("");
  }

  return (
    <LinearGradient colors={["#F6A7C9", "#3F417E"]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.screen, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        bounces
        onScrollBeginDrag={closeProfileMenu}
      >
        <View style={styles.topRowWrap}>
          <View style={styles.topRow}>
            <Image source={require("../../../assets/branding/logo-small.png")} style={styles.cloudMark} resizeMode="contain" tintColor="#FFFFFF" />

            <Pressable style={({ pressed }) => [styles.avatarWrap, pressed && styles.pressed]} onPress={toggleProfileMenu}>
              <Text style={styles.avatarEmoji}>🧑‍🦰</Text>
            </Pressable>
          </View>

          {profileMenuOpen ? (
            <View style={styles.profileMenu}>
              <Pressable style={({ pressed }) => [styles.profileMenuItem, pressed && styles.pressed]} onPress={() => openRoute("/onboarding/profile")}>
                <Text style={styles.profileMenuLabel}>Profile</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.profileMenuItem, pressed && styles.pressed]} onPress={() => openRoute("/modal/documents")}>
                <Text style={styles.profileMenuLabel}>Documents</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.profileMenuItem, pressed && styles.pressed]} onPress={() => openRoute("/modal/family-settings")}>
                <Text style={styles.profileMenuLabel}>Family settings</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.centerBlock}>
          <Text style={styles.heroTitle}>Drop it here.</Text>
          <Text style={styles.heroSubtitle}>I&apos;ll sort out the chaos for you.</Text>

          <View style={styles.inputCard}>
            <TextInput
              value={promptText}
              onChangeText={setPromptText}
              multiline
              placeholder="Type your message here"
              placeholderTextColor="#9B9BA3"
              style={styles.messageInput}
            />

            <View style={styles.inputActionsRow}>
              <View style={styles.leftActions}>
                <Pressable style={({ pressed }) => [styles.iconTap, pressed && styles.pressed]} onPress={handleAddPress}>
                  <Ionicons name="add" size={34} color="#767884" />
                </Pressable>
                <Pressable style={({ pressed }) => [styles.iconTap, pressed && styles.pressed]} onPress={handleVoiceAction}>
                  <Ionicons name="mic-outline" size={25} color="#767884" />
                </Pressable>
              </View>

              <Pressable style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]} onPress={handleSubmitPrompt}>
                <Ionicons name="arrow-up" size={14} color="#C5C6CC" />
              </Pressable>
            </View>
          </View>
        </View>

        {!recentExpanded ? <View style={styles.collapsedSpacer} /> : null}

        <View style={[styles.recentSection, recentExpanded && styles.recentSectionExpanded]}>
          <Pressable style={({ pressed }) => [styles.recentHeaderRow, pressed && styles.pressed]} onPress={toggleRecent}>
            <Text style={styles.recentHeader}>Recent Drops</Text>
            <Ionicons name={recentExpanded ? "chevron-down" : "chevron-up"} size={26} color="#E8E6EC" />
          </Pressable>

          <Animated.View
            style={[
              styles.recentAnimatedWrap,
              {
                height: dropdownAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.max(estimatedListHeight, 1)]
                })
              }
            ]}
          >
            <Animated.View
              style={[
                styles.recentList,
                {
                  transform: [
                    {
                      translateY: dropdownAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [Math.max(estimatedListHeight, 1), 0]
                      })
                    }
                  ]
                }
              ]}
            >
              {recentDrops.map((drop) => (
                <View key={drop.id} style={[styles.dropCard, drop.muted && styles.dropCardMuted]}>
                  <View style={styles.dropIconWrap}>
                    <MaterialCommunityIcons name={drop.icon} size={17} color="#6E6FA2" />
                  </View>

                  <View style={styles.dropBody}>
                    <Text style={styles.dropTitle} numberOfLines={1}>
                      {drop.title}
                    </Text>
                    <Text style={styles.dropMeta} numberOfLines={1}>
                      {drop.meta}
                    </Text>
                  </View>

                  <Pressable style={({ pressed }) => [styles.menuTap, pressed && styles.pressed]}>
                    <Ionicons name="ellipsis-vertical" size={18} color="#74758F" />
                  </Pressable>
                </View>
              ))}
            </Animated.View>
          </Animated.View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  screen: {
    flexGrow: 1,
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 760,
    marginHorizontal: "auto"
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  topRowWrap: {
    position: "relative",
    zIndex: 20
  },
  cloudMark: {
    width: 44,
    height: 36
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#D04C43",
    backgroundColor: "#FFE6C1",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarEmoji: {
    fontSize: 21,
    lineHeight: 24
  },
  profileMenu: {
    position: "absolute",
    top: 48,
    right: 0,
    minWidth: 178,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    backgroundColor: "rgba(41, 36, 71, 0.92)",
    paddingVertical: 8,
    shadowColor: "#170E2E",
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 7 },
    elevation: 8
  },
  profileMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  profileMenuLabel: {
    color: "#F2F0F6",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600"
  },
  centerBlock: {
    marginTop: 208
  },
  heroTitle: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 32,
    lineHeight: 38,
    fontFamily: "PPEditorialNew-Regular"
  },
  heroSubtitle: {
    marginTop: 4,
    color: "#ECEAF1",
    textAlign: "center",
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "500"
  },
  inputCard: {
    marginTop: 30,
    borderRadius: 18,
    backgroundColor: "#EFEFF0",
    borderWidth: 1,
    borderColor: "#D7D7D8",
    minHeight: 112,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12
  },
  messageInput: {
    flex: 1,
    minHeight: 52,
    textAlignVertical: "top",
    fontSize: 16,
    lineHeight: 20,
    color: "#3B3D4E",
    fontWeight: "500"
  },
  inputActionsRow: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  iconTap: {
    minWidth: 34,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center"
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#E5E5E7",
    alignItems: "center",
    justifyContent: "center"
  },
  recentSection: {
    marginTop: "auto"
  },
  recentSectionExpanded: {
    marginTop: 8
  },
  recentAnimatedWrap: {
    marginTop: 10,
    overflow: "hidden"
  },
  collapsedSpacer: {
    flex: 1
  },
  recentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  recentHeader: {
    color: "#DDD8E8",
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "PPEditorialNew-Regular"
  },
  recentList: {
    marginTop: 14,
    gap: 10
  },
  dropCard: {
    borderRadius: 16,
    backgroundColor: "#EFEFEF",
    borderWidth: 1,
    borderColor: "#D7D8DF",
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center"
  },
  dropCardMuted: {
    backgroundColor: "rgba(219, 217, 231, 0.74)",
    borderColor: "rgba(188, 184, 211, 0.84)"
  },
  dropIconWrap: {
    width: 39,
    height: 39,
    borderRadius: 999,
    backgroundColor: "#ECA0C5",
    alignItems: "center",
    justifyContent: "center"
  },
  dropBody: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8
  },
  dropTitle: {
    color: "#5D5F9B",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700"
  },
  dropMeta: {
    color: "#7A7B90",
    marginTop: 1,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "500"
  },
  menuTap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  pressed: {
    opacity: 0.78
  }
});
