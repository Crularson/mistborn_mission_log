const STORAGE_KEY = "kelsiersCrewMissions";

export function getStoredMissions() {
  try {
    const missions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(missions) ? missions : [];
  } catch {
    return [];
  }
}

export function saveMission(mission) {
  const missions = getStoredMissions();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...missions, mission]));
}

export function deleteStoredMission(id) {
  const missions = getStoredMissions().filter((mission) => mission.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
}

export function isStoredMission(id) {
  return getStoredMissions().some((mission) => mission.id === id);
}
