import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import AudioPlayer from './src/compoments/AudioPlayer';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RootStack from './src/navigation/RootStack';
import { NavigationContainer } from '@react-navigation/native';



export default function App() {
  return (
    <NavigationContainer>
      {/* RootStack contains all your configured screens (Home, Shelf, Player, Profile) */}
      <RootStack />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
