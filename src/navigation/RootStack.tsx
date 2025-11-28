import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Import your screen components
// Assuming your screens are located in 'src/screens'
import ShelfScreen from '../screens/ShelfScreen';
import PlayerScreen from '../screens/PlayerScreen'; // Your new screen

// Initialize the stack navigator with the defined types
const Stack = createNativeStackNavigator<RootStackParamList>();

const RootStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Shelf"
      screenOptions={{
        headerStyle: { backgroundColor: '#3498db' }, // Blue header theme
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* Your new screens */}
      <Stack.Screen
        name="Shelf"
        component={ShelfScreen}
        options={{ title: 'Media Shelf' }}
      />
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{ title: 'Media Player' }}
      />

    </Stack.Navigator>
  );
};

export default RootStack;
