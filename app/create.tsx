import { useState } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { addVote } from "$lib/votesStorage";
import { styles } from "$styles/globalStyles";

export default function CreateVote() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminCode, setAdminCode] = useState("");

  const [votersText, setVotersText] = useState("");

  function parseVoters(text: string) {
    return text
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => ({
        voter: v,
        hasVoted: false,
      }));
  }

  async function create() {
    const voters = parseVoters(votersText);

    const newVote = {
      id: Date.now().toString(),
      title,
      description,
      adminName,
      adminCode,
      voters,
      ballotBox: [],
      hasVoted: {},
    };

    await addVote(newVote);

    // reset form
    setTitle("");
    setDescription("");
    setAdminName("");
    setAdminCode("");
    setVotersText("");

    router.push("/votes");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un vote</Text>

      <Text style={styles.label}>Titre</Text>
      <TextInput
        style={styles.input}
        onChangeText={setTitle}
        value={title}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        onChangeText={setDescription}
        value={description}
      />

      <Text style={styles.label}>Gestionnaire</Text>
      <TextInput
        style={styles.input}
        onChangeText={setAdminName}
        value={adminName}
      />

      <Text style={styles.label}>Code admin</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        onChangeText={setAdminCode}
        value={adminCode}
      />

      <Text style={styles.label}>Votants (1 par ligne)</Text>
      <TextInput
        style={[styles.input, { height: 120 }]}
        multiline
        placeholder={"Jean Dupont\nMarie Martin\nAli Ahmed"}
        placeholderTextColor="#94a3b8"
        onChangeText={setVotersText}
        value={votersText}
      />

      <TouchableOpacity style={styles.button} onPress={create}>
        <Text style={styles.buttonText}>Créer</Text>
      </TouchableOpacity>
    </View>
  );
}