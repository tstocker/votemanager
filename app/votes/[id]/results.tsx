import { View, Text, TextInput } from "react-native";
import { useNavigation, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

export default function ResultsPage() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();

  const vote = getVoteById(id);

  useEffect(() => {
    if (vote) {
      navigation.setOptions({
        title: `Résultats - ${vote.title}`, // ← dynamique
      });
    }
  }, [vote]);

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20 }}>
        Résultats du vote
      </Text>

      <Text>Vote ID : {id}</Text>

      {/* Vote infos */}
      <Text style={{ marginTop: 20, fontWeight: "600" }}>
        Informations
      </Text>

      <Text>Nom</Text>
      <Text>Description</Text>
      <Text>Liste des votants</Text>

      {/* ADMIN ACCESS */}
      <Text style={{ marginTop: 20 }}>
        Accès gestionnaire
      </Text>

      <TextInput
        placeholder="Code admin"
        secureTextEntry
        style={{
          borderWidth: 1,
          padding: 10,
          marginTop: 10,
        }}
      />

      {/* Results */}
      <Text style={{ marginTop: 20 }}>
        Résultats
      </Text>

      <Text>Pour / Contre / Abstention...</Text>
    </View>
  );
}