import { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect, useNavigation } from "expo-router";
import { getVotes, saveVotes } from "../../../lib/votesStorage";
import { styles } from "$styles/globalStyles";

const choices = [
  { key: "pour", label: "Pour" },
  { key: "contre", label: "Contre" },
  { key: "abstention", label: "Abstention" },
];

export default function VoteForm() {
  const { id, voter, title } = useLocalSearchParams();
  const router = useRouter();
  const voterName = decodeURIComponent(voter as string);
  const voteTitle = decodeURIComponent(title as string);

  const [step, setStep] = useState<"vote" | "confirm">("vote");
  const [choice, setChoice] = useState<string | null>(null);

  const choiceLabel = choices.find((c) => c.key === choice)?.label ?? "";

  const navigation = useNavigation();




  useEffect(() => {
    navigation.setOptions({
      title: voteTitle, // ou le titre du vote si tu le passes en param
      headerLeft: () => null, // retire le burger
    });
  }, [voterName]);


  async function handleConfirm() {
    const votes = await getVotes();

    const updated = votes.map((v) =>
      String(v.id) === String(id)
        ? {
            ...v,
            voters: v.voters.map((voter) =>
              voter.voter === voterName ? { ...voter, hasVoted: true } : voter
            ),
            ballots: [...(v.ballots ?? []), choice],
          }
        : v
    );
    await saveVotes(updated);
    router.replace(`/votes/${id}/listVoter`);
  }

  useFocusEffect(
    useCallback(() => {
      setStep("vote");
      setChoice(null);
    }, [])
  );


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === "vote" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{voterName}</Text>
          <Text style={styles.text}>Choisissez votre vote :</Text>

          {choices.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={[styles.button, styles.buttonPrimary]}
              onPress={() => {
                setChoice(c.key);
                setStep("confirm");
              }}
            >
              <Text style={styles.buttonText}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {step === "confirm" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Confirmation</Text>
          <Text style={styles.text}>Votant : {voterName}</Text>
          <Text style={styles.text}>Choix : {choiceLabel}</Text>

    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: "#16a34a", // green
        },
      ]}
      onPress={handleConfirm}
    >
      <Text style={styles.buttonText}>
        ✓ Valider définitivement
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: "#fb923c", // orange
        },
      ]}
      onPress={() => setStep("vote")}
    >
      <Text style={styles.buttonText}>
        Modifier
      </Text>
    </TouchableOpacity>
  </View>
      )}
    </ScrollView>
  );
}