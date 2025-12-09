import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  AppSettings,
  LayoutType,
  getSettings,
  saveSettings,
} from "../storage/settingsStorage";

interface SettingsContextType {
  settings: AppSettings;
  isLoading: boolean;
  updateLayout: (layout: LayoutType) => Promise<void>;
}

const defaultContext: SettingsContextType = {
  settings: { homeLayout: "list" },
  isLoading: true,
  updateLayout: async () => {},
};

const SettingsContext = createContext<SettingsContextType>(defaultContext);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<AppSettings>({ homeLayout: "list" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loaded = await getSettings();
    setSettings(loaded);
    setIsLoading(false);
  };

  const updateLayout = useCallback(async (layout: LayoutType) => {
    setSettings((prev) => ({ ...prev, homeLayout: layout }));
    await saveSettings({ homeLayout: layout });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateLayout }}>
      {children}
    </SettingsContext.Provider>
  );
};

