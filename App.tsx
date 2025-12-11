import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootStack from './src/navigation/RootStack';
import { NavigationContainer } from '@react-navigation/native';
import { SettingsProvider } from './src/context/SettingsContext';
import { PlaybackProvider } from './src/context/PlaybackContext';
import { AlertProvider } from './src/components/ui/AlertManager';
import { colors } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <PlaybackProvider>
          <AlertProvider>
            <NavigationContainer>
              <StatusBar style="auto" backgroundColor={colors.background} />
              <RootStack />
            </NavigationContainer>
          </AlertProvider>
        </PlaybackProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
