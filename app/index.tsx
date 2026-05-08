import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { getVotes } from "$lib/votesStorage";

function getVoteProgress(vote) {
  const total = vote.voters?.length || 0;
  const voted = vote.voters?.filter((v) => v.hasVoted).length || 0;

  if (voted === 0) return { label: "À venir", color: "#2563eb", bg: "#dbeafe" };
  if (voted < total) return { label: `En cours ${voted}/${total}`, color: "#d97706", bg: "#fef3c7" };
  return { label: "✓ Terminé", color: "#16a34a", bg: "#dcfce7" };
}

export default function Home() {
  const [recentVotes, setRecentVotes] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const data = await getVotes();
        setRecentVotes(data.slice(-3).reverse());
      }
      load();
    }, [])
  );

  return (
    <ScrollView
      style={{ backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      {/* Title */}
      <Text style={{ fontSize: 28, fontWeight: "700", color: "#0f172a", marginBottom: 16 }}>
        Suffrage anonyme
      </Text>

      {/* Description */}
      <View style={{
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
      }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 8 }}>
          Comment ça marche ?
        </Text>
        <Text style={{ color: "#475569", lineHeight: 22 }}>
          Un seul téléphone circule parmi les participants. Chaque votant sélectionne
          son nom, choisit son vote en toute confidentialité, puis confirme.
          Les résultats restent masqués jusqu'à ce que tous aient voté.
        </Text>
      </View>

      {/* Create new vote */}
      <TouchableOpacity
        onPress={() => router.push("/create")}
        style={{
          backgroundColor: "#0f172a",
          padding: 16,
          borderRadius: 20,
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
          + Créer un nouveau vote
        </Text>
      </TouchableOpacity>

      {/* Last votes */}
      {recentVotes.length > 0 && (
        <>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 12 }}>
            Votes récents
          </Text>

          {recentVotes.map((v) => {
            const progress = getVoteProgress(v);
            return (
              <TouchableOpacity
                key={v.id}
                onPress={() => router.push(`/votes/${v.id}`)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: "#fff",
                  padding: 16,
                  borderRadius: 20,
                  marginBottom: 14,
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#0f172a" }}>
                  {v.title}
                </Text>

                <View style={{
                  marginTop: 10,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <Text style={{ color: "#64748b", fontSize: 13 }}>
                    {v.voters?.length || 0} votants
                  </Text>

                  <View style={{
                    backgroundColor: progress.bg,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 999,
                  }}>
                    <Text style={{ fontSize: 12, color: progress.color, fontWeight: "500" }}>
                      {progress.label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity onPress={() => router.push("/votes")}>
            <Text style={{ textAlign: "center", color: "#2563eb", fontWeight: "500", marginTop: 4 }}>
              Voir tous les votes →
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}