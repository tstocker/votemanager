import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { getVotes } from "$lib/votesStorage";
import { useLocalSearchParams, useNavigation, router, useFocusEffect } from "expo-router";
import { styles } from "$styles/globalStyles";

const choices = [
  { key: "pour", label: "Pour" },
  { key: "contre", label: "Contre" },
  { key: "abstention", label: "Abstention" },
];

function percent(value, total) {
  if (!total) return "0 %";
  return `${Math.round((value / total) * 100)} %`;
}

export default function VotePage() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();

  const [vote, setVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        try {
          const votes = await getVotes();
          if (cancelled) return;

          const found = votes.find((v) => v.id === id) ?? null;
          setVote(found);

          if (found) {
            const shortTitle = found.title.length > 22
              ? found.title.slice(0, 22) + "..."
              : found.title;
            navigation.setOptions({ title: shortTitle });
          }
        } catch (e) {
          if (!cancelled) setError("Impossible de charger le vote.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      load();
      return () => { cancelled = true; };
    }, [id])
  );

  if (loading) {
    return <View style={styles.container}><Text style={styles.text}>Chargement...</Text></View>;
  }

  if (error || !vote) {
    return <View style={styles.container}><Text style={styles.text}>{error ?? "Vote introuvable."}</Text></View>;
  }

  const totalVoters = vote.voters.length;
  const totalVoted = vote.voters.filter((v) => v.hasVoted).length;
  const allVoted = totalVoted === totalVoters && totalVoters > 0;

  // Result count
  const results = (vote.ballots ?? []).reduce((acc, b) => {
    if (acc[b] !== undefined) acc[b] += 1;
    return acc;
  }, { pour: 0, contre: 0, abstention: 0 });

  return (
    <ScrollView
      style={{ backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      {/* Informations */}
      <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 20, marginBottom: 14, elevation: 2 }}>
        <Text style={styles.cardTitle}>Informations</Text>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#0f172a", marginTop: 8, marginBottom: 6 }}>
          {vote.title}
        </Text>
        <Text style={styles.text}>{vote.description || "Aucune description"}</Text>
        <Text style={[styles.text, { marginTop: 10 }]}>Gestionnaire : {vote.adminName}</Text>
      </View>

      {/* Results */}
      {allVoted && (
        <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 20, marginBottom: 14, elevation: 2 }}>
          <Text style={styles.cardTitle}>Résultats</Text>

          {choices.map((c) => {
            const value = results[c.key];

            function percentValue(value, total) {
              if (!total) return 0;
              return Math.round((value / total) * 100);
            }
            const pct = percentValue(value, totalVoted);
            return (
              <View key={c.key} style={{ marginBottom: 14 }}>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={{ fontWeight: "600", color: "#0f172a" }}>{c.label}</Text>
                  <Text style={{ fontWeight: "700", color: "#0f172a" }}>
                    {value} voix — {pct} %
                  </Text>
                </View>
                <View style={{ height: 12, backgroundColor: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
                  <View style={{ height: "100%", backgroundColor: "#2563eb", width: `${pct}%` }} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Voters */}
      <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 20, marginBottom: 14, elevation: 2 }}>
        <Text style={styles.cardTitle}>
          Votants — {totalVoted} / {totalVoters}
        </Text>

        {vote.voters.map((v, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 10,
              borderBottomWidth: index !== vote.voters.length - 1 ? 1 : 0,
              borderBottomColor: "#e2e8f0",
            }}
          >
            <Text style={styles.text}>{v.voter}</Text>
            <Text style={{ color: v.hasVoted ? "#16a34a" : "#94a3b8", fontWeight: "500" }}>
              {v.hasVoted ? "A voté" : "En attente"}
            </Text>
          </View>
        ))}
      </View>

      {!allVoted && (
        <TouchableOpacity
          onPress={() => router.push(`/votes/${id}/listVoter`)}
          style={{ backgroundColor: "#2563eb", padding: 14, borderRadius: 16, marginTop: 14, alignItems: "center" }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            Voter ({totalVoted}/{totalVoters})
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}