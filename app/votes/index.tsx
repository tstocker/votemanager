import { useState, useCallback } from "react";
import { useFocusEffect, router } from "expo-router";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getVotes } from "$lib/votesStorage";

function getVoteProgress(vote) {
  const total = vote.voters?.length || 0;
  const voted = vote.voters?.filter((v) => v.hasVoted).length || 0;

  if (voted === 0) {
    return { label: "À venir", color: "#2563eb", bg: "#dbeafe" };
  }

  if (voted < total) {
    return { label: `En cours ${voted}/${total}`, color: "#d97706", bg: "#fef3c7" };
  }

  return { label: "✓ Terminé", color: "#16a34a", bg: "#dcfce7" };
}

export default function VotesList() {
  const [votes, setVotes] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const data = await getVotes();
        setVotes(data);
      }
      load();
    }, [])
  );

  return (
    <ScrollView
      style={{ backgroundColor: "#f8fafc" }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 40,
      }}
    >
      {votes.map((v) => {
        const progress = getVoteProgress(v);

        return (
          <TouchableOpacity
            key={v.id}
            onPress={() =>
              router.push(`/votes/${v.id}`)
            }
            activeOpacity={0.85}
            style={{
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 20,
              marginBottom: 14,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#0f172a",
              }}
            >
              {v.title}
            </Text>

            <View
              style={{
                marginTop: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                {v.voters?.length || 0} votants
              </Text>

              <View
                style={{
                  backgroundColor: progress.bg,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: progress.color,
                    fontWeight: "500",
                  }}
                >
                  {progress.label}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}