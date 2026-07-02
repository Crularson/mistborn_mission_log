import { getStoredMissions } from "./storage.js";

export async function fetchStarterMissions() {
  const response = await fetch("./missions.json");

  if (!response.ok) {
    throw new Error("Starter mission archive could not be loaded.");
  }

  return response.json();
}

export async function getAllMissions() {
  const starterMissions = await fetchStarterMissions();
  const savedMissions = getStoredMissions();
  const starterIds = new Set(starterMissions.map((mission) => mission.id));
  const uniqueSavedMissions = savedMissions.filter((mission) => !starterIds.has(mission.id));

  return [...starterMissions, ...uniqueSavedMissions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
}
