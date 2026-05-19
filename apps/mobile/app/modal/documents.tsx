import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CategoryId = string;
type SourceMode = "files" | "scan" | "photo";

type VaultCategory = {
  id: CategoryId;
  label: string;
  fileCount: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
};

type RecentDocument = {
  id: string;
  title: string;
  meta: string;
  icon: keyof typeof Ionicons.glyphMap;
  categoryId: CategoryId;
};

const initialCategories: VaultCategory[] = [
  { id: "school", label: "School", fileCount: 12, icon: "school-outline", iconColor: "#5874D8", iconBackground: "#E9EEFF" },
  { id: "medical", label: "Medical", fileCount: 8, icon: "add-outline", iconColor: "#E06666", iconBackground: "#FCEFEF" },
  { id: "insurance", label: "Insurance", fileCount: 5, icon: "shield-checkmark-outline", iconColor: "#D3883C", iconBackground: "#FCF2E8" },
  { id: "property", label: "Property", fileCount: 14, icon: "home-outline", iconColor: "#3D3F7F", iconBackground: "#EDEEFF" }
];

const initialRecentDocuments: RecentDocument[] = [
  { id: "doc-a", title: "Home_Lease_2024.pdf", meta: "ADDED 2 DAYS AGO • 1.2 MB", icon: "document-text-outline", categoryId: "property" },
  { id: "doc-b", title: "Dental_Claim_Chloe.png", meta: "ADDED YESTERDAY • 840 KB", icon: "image-outline", categoryId: "medical" }
];

const sourceModeLabels: Record<SourceMode, string> = {
  files: "Files",
  scan: "Scan",
  photo: "Photo"
};

export default function DocumentsModal() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState(initialCategories);
  const [recentDocuments, setRecentDocuments] = useState(initialRecentDocuments);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isComposerVisible, setComposerVisible] = useState(false);
  const [sourceMode, setSourceMode] = useState<SourceMode>("files");
  const [draftName, setDraftName] = useState("");
  const [draftCategory, setDraftCategory] = useState<CategoryId>("school");
  const [pickedAsset, setPickedAsset] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isCategoryComposerVisible, setCategoryComposerVisible] = useState(false);
  const [draftCategoryName, setDraftCategoryName] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId | null>(null);
  const [actionDocumentId, setActionDocumentId] = useState<string | null>(null);
  const [isEditDocumentVisible, setEditDocumentVisible] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [editDraftName, setEditDraftName] = useState("");
  const [editDraftCategoryId, setEditDraftCategoryId] = useState<CategoryId>("school");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const normalizedSearchQuery = searchText.trim();
  const hasSearchQuery = normalizedSearchQuery.length > 0;

  const filteredRecentDocuments = useMemo(() => {
    const normalizedQuery = searchText.trim().toLowerCase();
    if (!normalizedQuery) {
      return recentDocuments;
    }

    return recentDocuments.filter((document) => `${document.title} ${document.meta}`.toLowerCase().includes(normalizedQuery));
  }, [recentDocuments, searchText]);

  const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? null;
  const activeCategoryDocuments = activeCategory ? recentDocuments.filter((document) => document.categoryId === activeCategory.id) : [];
  const selectedActionDocument = actionDocumentId ? recentDocuments.find((document) => document.id === actionDocumentId) ?? null : null;
  const editingDocument = editingDocumentId ? recentDocuments.find((document) => document.id === editingDocumentId) ?? null : null;

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  function closeComposer() {
    setComposerVisible(false);
    setSourceMode("files");
    setDraftName("");
    setDraftCategory("school");
    setPickedAsset(null);
  }

  async function handlePickFile() {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true
    });

    if (result.canceled) {
      return;
    }

    const selected = result.assets[0];
    setPickedAsset(selected);

    if (!draftName.trim()) {
      setDraftName(selected.name.replace(/\.[^/.]+$/, ""));
    }
  }

  function handleCreateDocument() {
    const now = new Date();
    const fileBaseName =
      draftName.trim() ||
      pickedAsset?.name?.replace(/\.[^/.]+$/, "") ||
      (sourceMode === "scan" ? `Scan_${now.toISOString().slice(0, 10)}` : sourceMode === "photo" ? `Photo_${now.toISOString().slice(0, 10)}` : "New_Document");

    const extension = sourceMode === "photo" ? ".jpg" : ".pdf";
    const title = fileBaseName.includes(".") ? fileBaseName : `${fileBaseName}${extension}`;
    const meta = `ADDED JUST NOW • ${formatAssetSize(pickedAsset?.size)}`;
    const icon: keyof typeof Ionicons.glyphMap = sourceMode === "photo" ? "image-outline" : "document-text-outline";

    setRecentDocuments((current) => [{ id: `${Date.now()}`, title, meta, icon, categoryId: draftCategory }, ...current].slice(0, 20));
    setCategories((current) =>
      current.map((category) => {
        if (category.id !== draftCategory) {
          return category;
        }
        return { ...category, fileCount: category.fileCount + 1 };
      })
    );

    closeComposer();
  }

  function handleCreateCategory() {
    const label = draftCategoryName.trim();
    if (!label) {
      return;
    }

    const normalizedId = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 20);
    const id = normalizedId || `category-${Date.now()}`;

    setCategories((current) => {
      if (current.some((category) => category.id === id || category.label.toLowerCase() === label.toLowerCase())) {
        return current;
      }
      return [
        ...current,
        {
          id,
          label,
          fileCount: 0,
          icon: "folder-open-outline",
          iconColor: "#4C5CB2",
          iconBackground: "#EAEDFE"
        }
      ];
    });

    setDraftCategory(id);
    setDraftCategoryName("");
    setCategoryComposerVisible(false);
  }

  function openDocumentActions(documentId: string) {
    setActionDocumentId(documentId);
  }

  function startEditingSelectedDocument() {
    if (!selectedActionDocument) {
      return;
    }

    setEditingDocumentId(selectedActionDocument.id);
    setEditDraftName(selectedActionDocument.title);
    setEditDraftCategoryId(selectedActionDocument.categoryId);
    setActionDocumentId(null);
    setEditDocumentVisible(true);
  }

  function saveDocumentEdit() {
    if (!editingDocument) {
      return;
    }

    const nextTitle = editDraftName.trim() || editingDocument.title;
    const nextCategory = editDraftCategoryId;
    const previousCategory = editingDocument.categoryId;

    setRecentDocuments((current) =>
      current.map((document) => {
        if (document.id !== editingDocument.id) {
          return document;
        }
        return {
          ...document,
          title: nextTitle,
          categoryId: nextCategory
        };
      })
    );

    if (previousCategory !== nextCategory) {
      setCategories((current) =>
        current.map((category) => {
          if (category.id === previousCategory) {
            return { ...category, fileCount: Math.max(0, category.fileCount - 1) };
          }
          if (category.id === nextCategory) {
            return { ...category, fileCount: category.fileCount + 1 };
          }
          return category;
        })
      );
    }

    setEditDocumentVisible(false);
    setEditingDocumentId(null);
  }

  function deleteSelectedDocument() {
    if (!selectedActionDocument) {
      return;
    }

    Alert.alert("Delete document", `Delete "${selectedActionDocument.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setRecentDocuments((current) => current.filter((document) => document.id !== selectedActionDocument.id));
          setCategories((current) =>
            current.map((category) => {
              if (category.id !== selectedActionDocument.categoryId) {
                return category;
              }
              return { ...category, fileCount: Math.max(0, category.fileCount - 1) };
            })
          );
          setActionDocumentId(null);
        }
      }
    ]);
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom + 30, 40)
          }
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Vault</Text>
          <View style={styles.headerActions}>
            <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]} onPress={() => setSearchOpen((current) => !current)}>
              <Ionicons name="search-outline" size={21} color="#52577D" />
            </Pressable>
            <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]} onPress={() => setComposerVisible(true)}>
              <Ionicons name="add" size={22} color="#52577D" />
            </Pressable>
          </View>
        </View>

        {searchOpen ? (
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={15} color="#8C90A7" />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search documents"
              placeholderTextColor="#A8A9B5"
              style={styles.searchInput}
              autoFocus
            />
            {searchText ? (
              <Pressable onPress={() => setSearchText("")}>
                <Ionicons name="close-circle" size={16} color="#A6A8B9" />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {!hasSearchQuery ? (
          <>
            <View style={styles.grid}>
              {categories.map((category) => (
                <Pressable key={category.id} style={({ pressed }) => [styles.categoryCard, pressed && styles.categoryCardPressed]} onPress={() => setActiveCategoryId(category.id)}>
                  <View style={[styles.categoryIconWrap, { backgroundColor: category.iconBackground }]}>
                    <Ionicons name={category.icon} size={22} color={category.iconColor} />
                  </View>
                  <Text style={styles.categoryTitle}>{category.label}</Text>
                  <Text style={styles.categoryMeta}>{category.fileCount} FILES</Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={({ pressed }) => [styles.newCategoryButton, pressed && styles.newCategoryButtonPressed]} onPress={() => setCategoryComposerVisible(true)}>
              <Ionicons name="add-circle-outline" size={16} color="#565E8C" />
              <Text style={styles.newCategoryText}>Create category</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.searchSummaryWrap}>
            <Text style={styles.searchSummaryText}>Searching for “{normalizedSearchQuery}”</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>{hasSearchQuery ? "Search Results" : "Recent Documents"}</Text>

        {filteredRecentDocuments.length === 0 && hasSearchQuery ? (
          <View style={styles.emptySearchState}>
            <Text style={styles.emptySearchTitle}>No result found</Text>
            <Text style={styles.emptySearchMeta}>No document matched “{normalizedSearchQuery}”.</Text>
          </View>
        ) : (
          <View style={styles.recentList}>
            {filteredRecentDocuments.map((document) => (
              <View key={document.id} style={styles.documentRow}>
                <View style={styles.documentIconWrap}>
                  <Ionicons name={document.icon} size={19} color="#A9A9AE" />
                </View>
                <View style={styles.documentBody}>
                  <Text style={styles.documentTitle} numberOfLines={1}>
                    {document.title}
                  </Text>
                  <Text style={styles.documentMeta}>{document.meta}</Text>
                </View>
                <Pressable hitSlop={10} onPress={() => openDocumentActions(document.id)}>
                  <Ionicons name="ellipsis-vertical" size={16} color="#7D809E" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={isComposerVisible} animationType="slide" transparent onRequestClose={closeComposer}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={closeComposer} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={8} style={styles.sheetKeyboardWrap}>
            <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 18, 24) }]} onPress={() => undefined}>
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScrollContent}>
                <View style={styles.sheetHeader}>
                  <Pressable onPress={closeComposer}>
                    <Text style={styles.sheetHeaderAction}>Cancel</Text>
                  </Pressable>
                  <Text style={styles.sheetTitle}>New Document</Text>
                  <Pressable onPress={handleCreateDocument}>
                    <Text style={styles.sheetHeaderActionPrimary}>Add</Text>
                  </Pressable>
                </View>

                <View style={styles.sourceChips}>
                  {(Object.keys(sourceModeLabels) as SourceMode[]).map((mode) => (
                    <Pressable key={mode} style={[styles.sourceChip, sourceMode === mode && styles.sourceChipActive]} onPress={() => setSourceMode(mode)}>
                      <Text style={[styles.sourceChipText, sourceMode === mode && styles.sourceChipTextActive]}>{sourceModeLabels[mode]}</Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Document name</Text>
                  <TextInput value={draftName} onChangeText={setDraftName} style={styles.input} placeholder="e.g. Chloe Vaccination" placeholderTextColor="#AEB2C6" />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Category</Text>
                  <View style={styles.categoryChips}>
                    {categories.map((category) => (
                      <Pressable
                        key={category.id}
                        style={[styles.categoryChip, draftCategory === category.id && styles.categoryChipActive]}
                        onPress={() => setDraftCategory(category.id)}
                      >
                        <Text style={[styles.categoryChipText, draftCategory === category.id && styles.categoryChipTextActive]}>{category.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Attachment</Text>
                  <Pressable style={({ pressed }) => [styles.fileRow, pressed && styles.fileRowPressed]} onPress={() => void handlePickFile()}>
                    <View style={styles.fileRowLeading}>
                      <Ionicons name="attach-outline" size={16} color="#5A5F83" />
                    </View>
                    <Text style={styles.fileRowText} numberOfLines={1}>
                      {pickedAsset ? pickedAsset.name : "Choose a file"}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#8C90A7" />
                  </Pressable>
                </View>
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={isCategoryComposerVisible} animationType="slide" transparent onRequestClose={() => setCategoryComposerVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setCategoryComposerVisible(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={8} style={styles.sheetKeyboardWrap}>
            <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 18, 24) }]} onPress={() => undefined}>
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScrollContent}>
                <View style={styles.sheetHeader}>
                  <Pressable onPress={() => setCategoryComposerVisible(false)}>
                    <Text style={styles.sheetHeaderAction}>Cancel</Text>
                  </Pressable>
                  <Text style={styles.sheetTitle}>New Category</Text>
                  <Pressable onPress={handleCreateCategory}>
                    <Text style={styles.sheetHeaderActionPrimary}>Create</Text>
                  </Pressable>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Category name</Text>
                  <TextInput
                    value={draftCategoryName}
                    onChangeText={setDraftCategoryName}
                    style={styles.input}
                    placeholder="e.g. Travel"
                    placeholderTextColor="#AEB2C6"
                    autoFocus
                  />
                </View>
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={activeCategory !== null} animationType="slide" transparent onRequestClose={() => setActiveCategoryId(null)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setActiveCategoryId(null)} />
          <View style={styles.sheetStaticWrap}>
            <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 18, 24) }]} onPress={() => undefined}>
              <View style={styles.sheetHeader}>
                <Pressable onPress={() => setActiveCategoryId(null)}>
                  <Text style={styles.sheetHeaderAction}>Close</Text>
                </Pressable>
                <Text style={styles.sheetTitle}>{activeCategory?.label ?? "Category"}</Text>
                <View style={styles.sheetHeaderSpacer} />
              </View>

              {activeCategoryDocuments.length === 0 ? (
                <View style={styles.emptyCategoryState}>
                  <Text style={styles.emptyCategoryTitle}>No uploaded files yet</Text>
                  <Text style={styles.emptyCategoryMeta}>Use the + button to add documents into this category.</Text>
                </View>
              ) : (
                <View style={styles.categoryDocumentList}>
                  {activeCategoryDocuments.map((document) => (
                    <View key={document.id} style={styles.documentRow}>
                      <View style={styles.documentIconWrap}>
                        <Ionicons name={document.icon} size={19} color="#A9A9AE" />
                      </View>
                      <View style={styles.documentBody}>
                        <Text style={styles.documentTitle} numberOfLines={1}>
                          {document.title}
                        </Text>
                        <Text style={styles.documentMeta}>{document.meta}</Text>
                      </View>
                      <Pressable hitSlop={10} onPress={() => openDocumentActions(document.id)}>
                        <Ionicons name="ellipsis-vertical" size={16} color="#7D809E" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={actionDocumentId !== null} animationType="fade" transparent onRequestClose={() => setActionDocumentId(null)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setActionDocumentId(null)} />
          <View style={styles.sheetStaticWrap}>
            <Pressable style={[styles.sheet, styles.actionSheet, { paddingBottom: Math.max(insets.bottom + 18, 24) }]} onPress={() => undefined}>
              <Text style={styles.actionSheetTitle} numberOfLines={1}>
                {selectedActionDocument?.title ?? "Document"}
              </Text>
              <Pressable style={({ pressed }) => [styles.actionItem, pressed && styles.actionItemPressed]} onPress={startEditingSelectedDocument}>
                <Ionicons name="create-outline" size={17} color="#4E557C" />
                <Text style={styles.actionItemText}>Modify</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.actionItem, pressed && styles.actionItemPressed]} onPress={deleteSelectedDocument}>
                <Ionicons name="trash-outline" size={17} color="#B44747" />
                <Text style={styles.actionItemDangerText}>Delete</Text>
              </Pressable>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={isEditDocumentVisible} animationType="slide" transparent onRequestClose={() => setEditDocumentVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setEditDocumentVisible(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={8} style={styles.sheetKeyboardWrap}>
            <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 18, 24) }]} onPress={() => undefined}>
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScrollContent}>
                <View style={styles.sheetHeader}>
                  <Pressable onPress={() => setEditDocumentVisible(false)}>
                    <Text style={styles.sheetHeaderAction}>Cancel</Text>
                  </Pressable>
                  <Text style={styles.sheetTitle}>Modify Document</Text>
                  <Pressable onPress={saveDocumentEdit}>
                    <Text style={styles.sheetHeaderActionPrimary}>Save</Text>
                  </Pressable>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Document name</Text>
                  <TextInput value={editDraftName} onChangeText={setEditDraftName} style={styles.input} placeholder="Document name" placeholderTextColor="#AEB2C6" />
                </View>

                {!isKeyboardVisible ? (
                  <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>Category</Text>
                    <View style={styles.categoryChips}>
                      {categories.map((category) => (
                        <Pressable
                          key={category.id}
                          style={[styles.categoryChip, editDraftCategoryId === category.id && styles.categoryChipActive]}
                          onPress={() => setEditDraftCategoryId(category.id)}
                        >
                          <Text style={[styles.categoryChipText, editDraftCategoryId === category.id && styles.categoryChipTextActive]}>{category.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text style={styles.keyboardHint}>Dismiss keyboard to edit category.</Text>
                )}
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function formatAssetSize(bytes: number | undefined) {
  if (!bytes || bytes <= 0) {
    return "FILE READY";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F3F0EB"
  },
  content: {
    paddingHorizontal: 16
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  title: {
    color: "#3E3D76",
    fontSize: 32,
    lineHeight: 36,
    fontFamily: "PPEditorialNew-Regular"
  },
  headerActions: {
    flexDirection: "row",
    gap: 10
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#FDFCFA",
    borderWidth: 1,
    borderColor: "#E5E2DB",
    alignItems: "center",
    justifyContent: "center"
  },
  iconButtonPressed: {
    transform: [{ scale: 0.96 }]
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3E0D9",
    backgroundColor: "#FBF9F6",
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14
  },
  searchInput: {
    flex: 1,
    color: "#4E536F",
    fontSize: 14,
    fontWeight: "500"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 6
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#FBFAF8",
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 18,
    minHeight: 158,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ECE7DE",
    shadowColor: "#2F327D",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2
  },
  categoryCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92
  },
  categoryIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  categoryTitle: {
    marginTop: 16,
    color: "#404177",
    fontSize: 26,
    lineHeight: 30,
    fontFamily: "Inter",
    fontWeight: "700"
  },
  categoryMeta: {
    marginTop: 4,
    color: "#8F919A",
    fontSize: 12,
    letterSpacing: 0.7,
    fontWeight: "700"
  },
  sectionTitle: {
    marginTop: 32,
    marginBottom: 10,
    color: "#3E3D76",
    fontSize: 32,
    lineHeight: 36,
    fontFamily: "PPEditorialNew-Regular"
  },
  newCategoryButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DEDBD5",
    backgroundColor: "#F8F6F2",
    minHeight: 34,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  newCategoryButtonPressed: {
    opacity: 0.88
  },
  newCategoryText: {
    color: "#565E8C",
    fontSize: 13,
    fontWeight: "700"
  },
  searchSummaryWrap: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E3DFD6",
    backgroundColor: "#F8F6F2",
    minHeight: 38,
    paddingHorizontal: 12,
    justifyContent: "center"
  },
  searchSummaryText: {
    color: "#636A86",
    fontSize: 13,
    fontWeight: "600"
  },
  recentList: {
    gap: 12
  },
  emptySearchState: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E3DFD6",
    backgroundColor: "#FBF9F6",
    padding: 16
  },
  emptySearchTitle: {
    color: "#434A76",
    fontSize: 16,
    fontWeight: "700"
  },
  emptySearchMeta: {
    marginTop: 5,
    color: "#7C829E",
    fontSize: 13
  },
  documentRow: {
    backgroundColor: "#FBFAF8",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ECE8E0",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    minHeight: 86
  },
  documentIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#F1F0ED",
    alignItems: "center",
    justifyContent: "center"
  },
  documentBody: {
    flex: 1
  },
  documentTitle: {
    color: "#3E4175",
    fontSize: 19,
    lineHeight: 23,
    fontWeight: "700"
  },
  documentMeta: {
    marginTop: 3,
    color: "#97989E",
    fontSize: 12,
    fontWeight: "700"
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end"
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(18,19,23,0.16)"
  },
  sheetKeyboardWrap: {
    flex: 1,
    justifyContent: "flex-end"
  },
  sheetScrollContent: {
    paddingBottom: 6
  },
  sheetStaticWrap: {
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: "#F8F6F2",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: "#E5E1D8",
    maxHeight: "88%"
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  sheetTitle: {
    color: "#30345E",
    fontSize: 17,
    fontWeight: "700"
  },
  sheetHeaderAction: {
    color: "#69709A",
    fontSize: 17
  },
  sheetHeaderActionPrimary: {
    color: "#3C4BC7",
    fontSize: 17,
    fontWeight: "700"
  },
  sheetHeaderSpacer: {
    width: 46
  },
  sourceChips: {
    flexDirection: "row",
    borderRadius: 12,
    backgroundColor: "#ECE9E3",
    padding: 4,
    marginBottom: 14
  },
  sourceChip: {
    flex: 1,
    minHeight: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  sourceChipActive: {
    backgroundColor: "#FFFFFF"
  },
  sourceChipText: {
    color: "#7D82A1",
    fontSize: 13,
    fontWeight: "600"
  },
  sourceChipTextActive: {
    color: "#4E536F"
  },
  inputGroup: {
    marginBottom: 12
  },
  fieldLabel: {
    color: "#626985",
    fontSize: 13,
    marginBottom: 7,
    fontWeight: "600"
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4E2DE",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    color: "#394067",
    fontSize: 15
  },
  categoryChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DCD9D3",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center"
  },
  categoryChipActive: {
    backgroundColor: "#3E437A",
    borderColor: "#3E437A"
  },
  categoryChipText: {
    color: "#5E6486",
    fontSize: 13,
    fontWeight: "600"
  },
  categoryChipTextActive: {
    color: "#F8F9FF"
  },
  fileRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4E2DE",
    backgroundColor: "#FFFFFF",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10
  },
  fileRowPressed: {
    opacity: 0.86
  },
  fileRowLeading: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#EEF1FD",
    alignItems: "center",
    justifyContent: "center"
  },
  fileRowText: {
    flex: 1,
    color: "#4A5073",
    fontSize: 14,
    fontWeight: "500"
  },
  emptyCategoryState: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4E2DE",
    backgroundColor: "#FFFFFF",
    padding: 14
  },
  emptyCategoryTitle: {
    color: "#434A76",
    fontSize: 15,
    fontWeight: "700"
  },
  emptyCategoryMeta: {
    marginTop: 4,
    color: "#7D829E",
    fontSize: 13
  },
  categoryDocumentList: {
    gap: 10
  },
  actionSheet: {
    paddingTop: 16
  },
  actionSheetTitle: {
    color: "#3D426D",
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "600"
  },
  actionItem: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E2D9",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 8
  },
  actionItemPressed: {
    opacity: 0.88
  },
  actionItemText: {
    color: "#4E557C",
    fontSize: 15,
    fontWeight: "600"
  },
  actionItemDangerText: {
    color: "#B44747",
    fontSize: 15,
    fontWeight: "600"
  },
  keyboardHint: {
    color: "#7C829E",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2
  }
});
