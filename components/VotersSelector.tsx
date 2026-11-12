import React, { useRef, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { Voter, getVoters, addVoter } from "@/lib/votersStorage";

type Props = {
  onChange: (voters: Voter[]) => void;
  hasError?: boolean;
};

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

const SEARCH_AREA_HEIGHT = 50;
const RESULT_ROW_HEIGHT = 47;
const EMPTY_RESULT_HEIGHT = 48;
const ADD_BUTTON_HEIGHT = 48;
const SCREEN_MARGIN = 8;
const ANCHOR_GAP = 5;

export default function VotersSelector({
  onChange,
  hasError = false,
}: Props) {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [selectedVoters, setSelectedVoters] = useState<Voter[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const selectorRef = useRef<View>(null);
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: SCREEN_MARGIN,
    width: 280,
    maxHeight: SEARCH_AREA_HEIGHT + EMPTY_RESULT_HEIGHT + ADD_BUTTON_HEIGHT,
  });

useFocusEffect(
  useCallback(() => {
    let isActive = true;

    async function loadVoters() {
      try {
        const savedVoters = await getVoters();

        if (isActive) {
          setVoters(savedVoters);
        }
      } catch (error) {
        console.error("Impossible de charger les votants :", error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadVoters();

    return () => {
      isActive = false;
    };
  }, [])
);

  function normalizeText(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  const searchTerms = normalizeText(searchQuery).split(/\s+/).filter(Boolean);
  const filteredVoters = voters.filter((voter) => {
    const fullName = normalizeText(`${voter.prenom} ${voter.nom}`);
    return searchTerms.every((term) => fullName.includes(term));
  });

  function isSelected(voter: Voter) {
    return selectedVoters.some((selected) => selected.id === voter.id);
  }

  function updateSelection(updated: Voter[]) {
    setSelectedVoters(updated);
    onChange(updated);
  }

  function toggleVoter(voter: Voter) {
    const updated = isSelected(voter)
      ? selectedVoters.filter((selected) => selected.id !== voter.id)
      : [...selectedVoters, voter];

    updateSelection(updated);
  }

  function removeVoter(id: string) {
    updateSelection(selectedVoters.filter((voter) => voter.id !== id));
  }

  function openDropdown() {
    selectorRef.current?.measureInWindow((x, y, width, height) => {
      const resultsHeight =
        filteredVoters.length > 0
          ? filteredVoters.length * RESULT_ROW_HEIGHT
          : EMPTY_RESULT_HEIGHT;
      const desiredHeight =
        SEARCH_AREA_HEIGHT + resultsHeight + ADD_BUTTON_HEIGHT;

      const usableHeight = Math.max(
        1,
        windowHeight - SCREEN_MARGIN * 2
      );
      const menuHeight = Math.min(desiredHeight, usableHeight);
      const spaceBelow = Math.max(
        0,
        windowHeight - SCREEN_MARGIN - y - height - ANCHOR_GAP
      );
      const spaceAbove = Math.max(
        0,
        y - SCREEN_MARGIN - ANCHOR_GAP
      );

      const minimumUsefulHeight =
        SEARCH_AREA_HEIGHT + EMPTY_RESULT_HEIGHT + ADD_BUTTON_HEIGHT;

      let top: number;
      let maxHeight: number;

      if (spaceBelow >= menuHeight) {
        top = y + height + ANCHOR_GAP;
        maxHeight = menuHeight;
      } else if (spaceAbove >= menuHeight) {
        maxHeight = menuHeight;
        top = y - maxHeight - ANCHOR_GAP;
      } else if (Math.max(spaceAbove, spaceBelow) >= minimumUsefulHeight) {
        if (spaceBelow >= spaceAbove) {
          top = y + height + ANCHOR_GAP;
          maxHeight = Math.min(menuHeight, spaceBelow);
        } else {
          maxHeight = Math.min(menuHeight, spaceAbove);
          top = y - maxHeight - ANCHOR_GAP;
        }
      } else {
        maxHeight = usableHeight;
        top = (windowHeight - maxHeight) / 2;
      }

      const safeLeft = Math.max(
        SCREEN_MARGIN,
        Math.min(x, windowWidth - width - SCREEN_MARGIN)
      );

      setDropdownPosition({
        top,
        left: safeLeft,
        width: Math.min(width, windowWidth - SCREEN_MARGIN * 2),
        maxHeight,
      });

      setSearchQuery("");
      setDropdownVisible(true);
    });
  }

  function closeDropdown() {
    setDropdownVisible(false);
    setSearchQuery("");
  }

  async function handleAddVoter() {
    if (!nom.trim() || !prenom.trim() || saving) return;

    setSaving(true);
    setError("");

    const newVoter: Voter = {
      id: Date.now().toString(),
      nom: nom.trim(),
      prenom: prenom.trim(),
    };

    try {
      await addVoter(newVoter);
      setVoters((previous) => [...previous, newVoter]);
      updateSelection([...selectedVoters, newVoter]);
      setNom("");
      setPrenom("");
      setModalVisible(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Impossible d'enregistrer le votant."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Votants</Text>

      <View ref={selectorRef} collapsable={false}>
        <TouchableOpacity
          style={[
           styles.dropdownButton,
           hasError && styles.selectorError,
         ]}
          onPress={openDropdown}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ expanded: dropdownVisible }}
        >
          <Text style={styles.dropdownText}>
            Sélectionner un votant enregistré
          </Text>
          <Text style={styles.arrow}>{dropdownVisible ? "▲" : "▼"}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeDropdown}
      >
        <View style={styles.dropdownModalRoot}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeDropdown}
          />

          <View
            style={[
              styles.dropdownList,
              {
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                maxHeight: dropdownPosition.maxHeight,
              },
            ]}
          >
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un nom ou prénom..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Text style={styles.clearSearch}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={styles.resultsList}
              nestedScrollEnabled
              keyboardShouldPersistTaps="always"
            >
              {loading ? (
                <ActivityIndicator style={styles.loader} />
              ) : filteredVoters.length === 0 ? (
                <Text style={styles.emptyText}>
                  {voters.length === 0
                    ? "Aucun votant enregistré."
                    : "Aucun résultat trouvé."}
                </Text>
              ) : (
                filteredVoters.map((voter) => {
                  const selected = isSelected(voter);
                  return (
                    <TouchableOpacity
                      key={voter.id}
                      style={[
                        styles.dropdownItem,
                        selected && styles.dropdownItemSelected,
                      ]}
                      onPress={() => toggleVoter(voter)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.voterName,
                          selected && styles.voterNameSelected,
                        ]}
                      >
                        {voter.prenom} {voter.nom}
                      </Text>
                      <Text
                        style={[
                          styles.selectionIcon,
                          selected && styles.selectionIconSelected,
                        ]}
                      >
                        {selected ? "✓" : "+"}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.newVoterButton}
              onPress={() => {
                closeDropdown();
                setError("");
                setModalVisible(true);
              }}
            >
              <Text style={styles.newVoterText}>
                + Ajouter un nouveau votant
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.selectedSection}>
        <Text style={styles.sectionTitle}>
          Votants sélectionnés ({selectedVoters.length})
        </Text>
        {selectedVoters.map((voter) => (
          <View key={voter.id} style={styles.voterRow}>
            <Text style={styles.voterName}>
              {voter.prenom} {voter.nom}
            </Text>
            <TouchableOpacity
              onPress={() => removeVoter(voter.id)}
              style={styles.removeButton}
              accessibilityRole="button"
              accessibilityLabel={`Retirer ${voter.prenom} ${voter.nom}`}
            >
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        {selectedVoters.length === 0 && (
          <Text style={styles.emptyText}>Aucun votant sélectionné.</Text>
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouveau votant</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom"
              value={nom}
              onChangeText={setNom}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Prénom"
              value={prenom}
              onChangeText={setPrenom}
              autoCapitalize="words"
            />
            {!!error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!nom.trim() || !prenom.trim() || saving) &&
                  styles.disabledButton,
              ]}
              onPress={handleAddVoter}
              disabled={!nom.trim() || !prenom.trim() || saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 12 },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 10,
  },
  dropdownButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: { color: "#475569", fontSize: 14 },
  arrow: { color: "#64748b" },
  dropdownModalRoot: { flex: 1, backgroundColor: "transparent" },
  dropdownList: {
    position: "absolute",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 22, color: "#64748b", marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14,
    color: "#334155",
  },
  clearSearch: { color: "#94a3b8", fontSize: 17, padding: 5 },
  resultsList: { flexShrink: 1 },
  loader: { padding: 15 },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  dropdownItemSelected: { backgroundColor: "#e5f4e9" },
  voterName: { fontSize: 14, color: "#334155" },
  voterNameSelected: { color: "#236b3a" },
  selectionIcon: { fontSize: 20, color: "#64748b" },
  selectionIconSelected: { color: "#27834a" },
  newVoterButton: {
    padding: 13,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    alignItems: "center",
    backgroundColor: "#eff6ff",
  },
  newVoterText: { color: "#2563eb", fontWeight: "600", fontSize: 14 },
  selectedSection: { marginTop: 18, gap: 8 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  voterRow: {
    backgroundColor: "#f1f5f9",
    borderRadius: 9,
    padding: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  removeButton: { paddingHorizontal: 8, paddingVertical: 3 },
  removeText: { color: "#ef4444", fontSize: 17 },
  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    padding: 15,
    fontSize: 13,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { backgroundColor: "#fff", padding: 22, borderRadius: 14 },
  modalTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 18,
    color: "#1e293b",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 9,
    padding: 13,
    marginBottom: 12,
    color: "#334155",
  },
  saveButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 5,
  },
  disabledButton: { opacity: 0.5 },
  saveButtonText: { color: "#fff", fontWeight: "600" },
  cancelButton: { padding: 13, alignItems: "center" },
  cancelText: { color: "#64748b" },
  errorText: { color: "#dc2626", fontSize: 13, marginBottom: 10 },
  selectorError: {
    borderColor: "#dc2626",
    borderWidth: 1,
  },
});
