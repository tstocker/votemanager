
import { useState } from "react";
import {
  ScrollView,
  TextInput,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { addVote } from "$lib/votesStorage";
import { styles } from "$styles/globalStyles";
import VotersSelector from "$components/VotersSelector";
import { Voter } from "$lib/votersStorage";

const errorStyle = {
  color: "#dc2626",
  fontSize: 12,
  fontStyle: "italic" as const,
  marginTop: 4,
  marginBottom: 12,
};

const getInputStyle = (hasError: boolean) => [
  styles.input,
  hasError && {
    borderColor: "#dc2626",
    borderWidth: 1,
  },
];

export default function CreateVote() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [selectedVoters, setSelectedVoters] = useState<Voter[]>([]);

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    adminName: "",
    voters: "",
  });

  function parseVoters(voters: Voter[]) {
    return voters.map((v) => ({
      voter: `${v.prenom} ${v.nom}`,
      hasVoted: false,
    }));
  }

  function validateForm() {
    const newErrors = {
      title: title.trim() ? "" : "Le titre est obligatoire.",
      description: description.trim()
        ? ""
        : "La description est obligatoire.",
      adminName: adminName.trim()
        ? ""
        : "Le nom du gestionnaire est obligatoire.",
      voters:
        selectedVoters.length > 0
          ? ""
          : "Veuillez sélectionner au moins un votant.",
    };

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === "");
  }

  async function create() {
    if (!validateForm()) return;

    const voters = parseVoters(selectedVoters);

    const newVote = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      adminName: adminName.trim(),
      adminCode,
      voters,
      ballotBox: [],
      hasVoted: {},
    };

    try {
      await addVote(newVote);

      setTitle("");
      setDescription("");
      setAdminName("");
      setAdminCode("");
      setSelectedVoters([]);

      setErrors({
        title: "",
        description: "",
        adminName: "",
        voters: "",
      });

      router.push("/votes");
    } catch (error) {
      console.error("Erreur lors de la création du vote :", error);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      <Text style={styles.title}>Créer un vote</Text>

      <Text style={styles.label}>Titre</Text>
      <TextInput
       style={getInputStyle(!!errors.title)}
       onChangeText={(value) => {
         setTitle(value);
         if (value.trim()) {
           setErrors((prev) => ({ ...prev, title: "" }));
         }
       }}
       value={title}
      />
      {errors.title !== "" && (
       <Text style={errorStyle}>{errors.title}</Text>
      )}

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={getInputStyle(!!errors.description)}
        onChangeText={(value) => {
          setDescription(value);
          if (value.trim()) {
            setErrors((prev) => ({ ...prev, description: "" }));
          }
        }}
        value={description}
      />
      {errors.description !== "" && (
        <Text style={errorStyle}>{errors.description}</Text>
      )}

      <Text style={styles.label}>Gestionnaire</Text>
      <TextInput
        style={getInputStyle(!!errors.adminName)}
        onChangeText={(value) => {
          setAdminName(value);
          if (value.trim()) {
            setErrors((prev) => ({ ...prev, adminName: "" }));
          }
        }}
        value={adminName}
      />
      {errors.adminName !== "" && (
        <Text style={errorStyle}>{errors.adminName}</Text>
      )}

      <Text style={styles.label}>Code admin</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        onChangeText={setAdminCode}
        value={adminCode}
      />


      <VotersSelector
        onChange={(voters) => {
          setSelectedVoters(voters);
          if (voters.length > 0) {
            setErrors((prev) => ({ ...prev, voters: "" }));
          }
        }}
        hasError={!!errors.voters}
      />

      {errors.voters !== "" && (
        <Text style={errorStyle}>{errors.voters}</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={create}>
        <Text style={styles.buttonText}>Créer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
