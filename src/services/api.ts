export interface ItemDTO {
  id: number;
  name: string;
  rarity: string;
  level: number;
  attack?: number;
}

export interface NpcDTO {
  id: number;
  name: string;
  position: { x: number; y: number };
  region: string;
}

export interface QuestDTO {
  id: number;
  title: string;
  steps: string[];
  reward: Record<string, unknown>;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5174';

async function fetchJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`${endpoint} -> ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const Api = {
  items: () => fetchJson<ItemDTO[]>('/items'),
  npcs: () => fetchJson<NpcDTO[]>('/npcs'),
  quests: () => fetchJson<QuestDTO[]>('/quests'),
};
