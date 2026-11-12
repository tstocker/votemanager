
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Voter = {
  id: string;
  nom: string;
  prenom: string;
};

const KEY = "voters-storage";

export async function getVoters(): Promise<Voter[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addVoter(voter: Voter): Promise<void> {
  const voters = await getVoters();

  const exists = voters.some(
    (v) =>
      v.nom.toLowerCase() === voter.nom.toLowerCase() &&
      v.prenom.toLowerCase() === voter.prenom.toLowerCase()
  );

  if (exists) {
    throw new Error("Ce votant existe déjà.");
  }

  const updated = [...voters, voter];

  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

export async function removeVoter(id: string): Promise<void> {
  const voters = await getVoters();

  const exists = voters.some((voter) => voter.id === id);

  if (!exists) {
    throw new Error("Ce votant n'existe pas.");
  }

  const updated = voters.filter((voter) => voter.id !== id);

  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}


export async function saveVoters(voters: Voter[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(voters));
}
