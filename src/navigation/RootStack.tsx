import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from './types';
import ShelfScreen from '../screens/ShelfScreen';
import PlayerScreen from '../screens/PlayerScreen';

import { Ionicons } from '@expo/vector-icons'; // Using Ionicons for simplicity

const Tab = createBottomTabNavigator<RootStackParamList>();

const RootStack: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Shelf"
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#3498db' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Shelf') {
            iconName = 'book'; // bookshelf icon
          } else if (route.name === 'Player') {
            iconName = 'play-circle'; // player icon
          } else {
            iconName = 'alert-circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Shelf"
        component={ShelfScreen}
        options={{ title: 'Media Shelf' }}
      />
      <Tab.Screen
        name="Player"
        component={PlayerScreen}
        options={{ title: 'Media Player' }}
      />
    </Tab.Navigator>
  );
};

export default RootStack;
