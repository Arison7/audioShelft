import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_PREFIX = '@Audioshelf:notes:';

export interface Note {
  id: string;
  text: string;
  timestamp: number;
  createdAt: number; 
}

export const getNotesForFile = async (filePath: string): Promise<Note[]> => {
  try {
    const raw = await AsyncStorage.getItem(NOTES_PREFIX + filePath);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.warn('Failed to load notes', filePath, e);
    return [];
  }
};

export const saveNotesForFile = async (filePath: string, notes: Note[]) => {
  try {
    await AsyncStorage.setItem(NOTES_PREFIX + filePath, JSON.stringify(notes));
  } catch (e) {
    console.warn('Failed to save notes', filePath, e);
  }
};
