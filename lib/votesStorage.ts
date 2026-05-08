import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "votes-storage";

export async function getVotes() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addVote(vote) {
  const votes = await getVotes();

  const updated = [...votes, vote];

  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

export async function saveVotes(votes) {
  await AsyncStorage.setItem(KEY, JSON.stringify(votes));
}