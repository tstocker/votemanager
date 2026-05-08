import { useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { getVotes, saveVotes } from "../../../lib/votesStorage";
import { useState } from "react";

export default function VotersList() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();

  const [vote, setVote] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        const votes = await getVotes();
        if (cancelled) return;
        const found = votes.find((v) => v.id === id) ?? null;
        setVote(found);
        if (found) navigation.setOptions({ title: found.title });
        setLoading(false);
      }

      load();
      return () => { cancelled = true; };
    }, [id])
  );

  if (loading || !vote) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  const totalVoters = vote.voters.length;
  const totalVoted = vote.voters.filter((v) => v.hasVoted).length;
  const allVoted = totalVoted === totalVoters;

  async function handleCancel() {
    Alert.alert(
      "Annuler le vote",
      "Voulez-vous vraiment annuler ? Les votes enregistrés seront perdus.",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: async () => {
            const votes = await getVotes();
            const updated = votes.map((v) =>
              v.id === id
                ? {
                    ...v,
                    voters: v.voters.map((voter) => ({ ...voter, hasVoted: false })),
                    ballots: [],
                  }
                : v
            );
            await saveVotes(updated);
            router.back();
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      {/* Vote count */}
      <View style={{
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 20,
        marginBottom: 14,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
      }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 4 }}>
          {vote.title}
        </Text>
        <Text style={{ color: "#64748b", fontSize: 13 }}>
          {totalVoted} / {totalVoters} ont voté
        </Text>
      </View>

      {/* Voters list */}
      <View style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        marginBottom: 14,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        overflow: "hidden",
      }}>
        {vote.voters.map((v, index) => (
          <TouchableOpacity
            key={index}
            disabled={v.hasVoted}
            onPress={() => router.push(`/votes/${id}/form?voter=${encodeURIComponent(v.voter)}&title=${encodeURIComponent(vote.title)}`)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: index !== vote.voters.length - 1 ? 1 : 0,
              borderBottomColor: "#e2e8f0",
              opacity: v.hasVoted ? 0.5 : 1,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "500", color: "#0f172a" }}>
              {v.voter}
            </Text>

            <View style={{
              backgroundColor: v.hasVoted ? "#dcfce7" : "#f1f5f9",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
            }}>
              <Text style={{
                fontSize: 12,
                fontWeight: "500",
                color: v.hasVoted ? "#16a34a" : "#94a3b8",
              }}>
                {v.hasVoted ? "A voté" : "En attente"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bouton */}
      {allVoted ? (
        <TouchableOpacity
          onPress={() => router.push(`/votes/${id}`)}
          style={{
            backgroundColor: "#16a34a",
            padding: 14,
            borderRadius: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
            ✓ Valider et voir les résultats
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleCancel}
          style={{
            backgroundColor: "#dc2626",
            padding: 14,
            borderRadius: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
            ✕  Annuler le vote
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}