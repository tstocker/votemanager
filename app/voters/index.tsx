
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { Voter, getVoters, removeVoter } from "@/lib/votersStorage";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function VotersList() {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVoters = useCallback(async () => {
    try {
      const savedVoters = await getVoters();
      setVoters(savedVoters);
      setError("");
    } catch {
      setError("Impossible de charger les votants.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadVoters();
    }, [loadVoters])
  );

  async function handleRemoveVoter(id: string) {
    try {
      await removeVoter(id);
      await loadVoters();
    } catch (error) {
      console.error("Erreur de suppression :", error);
      setError("Impossible de supprimer ce votant.");
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: "#f8fafc" }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 40,
      }}
    >
      <View style={styles.selectedSection}>
        <Text style={styles.sectionTitle}>
          Votants enregistrés ({voters.length})
        </Text>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {loading ? (
          <Text>Chargement...</Text>
        ) : (
          <>
            {voters.map((voter) => (
              <View key={voter.id} style={styles.voterRow}>
                <Text style={styles.voterName}>
                  {voter.prenom} {voter.nom}
                </Text>

                <TouchableOpacity
                  onPress={() => handleRemoveVoter(voter.id)}
                  style={styles.removeButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Retirer ${voter.prenom} ${voter.nom}`}
                >
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color="#ef4444"
                  />
                </TouchableOpacity>
              </View>
            ))}

            {voters.length === 0 && (
              <Text style={styles.emptyText}>
                Aucun votant enregistré.
              </Text>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  voterName: {
    fontSize: 14,
    color: "#334155",
  },
  removeButton: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    padding: 15,
    fontSize: 13,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
  },
});
