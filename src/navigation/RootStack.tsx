import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import ShelfScreen from "../screens/ShelfScreen";
import PlayerScreen from "../screens/PlayerScreen";
import SettingsScreen from "../screens/SettingsScreen";
import FolderScreen from "../screens/FolderScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootStack: React.FC = () => {
	return (
		<Stack.Navigator
			initialRouteName="Shelf"
			screenOptions={{
				headerShown: false,
				animation: "slide_from_right",
			}}
		>
			<Stack.Screen name="Shelf" component={ShelfScreen} />
			<Stack.Screen 
				name="Player" 
				component={PlayerScreen}
				options={{
					animation: "slide_from_bottom",
				}}
			/>
			<Stack.Screen name="Folder" component={FolderScreen} />
			<Stack.Screen name="Settings" component={SettingsScreen} />
		</Stack.Navigator>
	);
};

export default RootStack;
