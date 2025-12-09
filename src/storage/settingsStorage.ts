import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "@AudioShelf:settings";

export type LayoutType = "list" | "grid" | "shelf";

export interface AppSettings {
  homeLayout: LayoutType;
  // Add more settings here as needed
}

const defaultSettings: AppSettings = {
  homeLayout: "list",
};

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
    return defaultSettings;
  } catch (error) {
    console.error("Failed to load settings:", error);
    return defaultSettings;
  }
};

export const saveSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
};

export const resetSettings = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error("Failed to reset settings:", error);
  }
};

