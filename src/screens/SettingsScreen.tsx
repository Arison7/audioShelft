import React from "react";
import {
	View,
	ScrollView,
	SafeAreaView,
	StatusBar,
	TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../navigation/types";
import { useSettings } from "../context/SettingsContext";
import { LayoutType } from "../storage/settingsStorage";

// Theme & Components
import { colors, settingsScreenStyles } from "../theme";
import { Typography, Card, useAlert } from "../components/ui";

type SettingsProps = NativeStackScreenProps<RootStackParamList, "Settings">;

interface SettingRowProps {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	description?: string;
	onPress?: () => void;
	rightElement?: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({
	icon,
	label,
	description,
	onPress,
	rightElement,
}) => {
	const content = (
		<View style={settingsScreenStyles.settingRow}>
			<View style={settingsScreenStyles.settingIcon}>
				<Ionicons name={icon} size={22} color={colors.primary} />
			</View>
			<View style={settingsScreenStyles.settingContent}>
				<Typography variant="body" weight="medium">
					{label}
				</Typography>
				{description && (
					<Typography variant="caption" color="muted" style={settingsScreenStyles.settingDesc}>
						{description}
					</Typography>
				)}
			</View>
			{rightElement || (
				<Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
			)}
		</View>
	);

	if (onPress) {
		return (
			<TouchableOpacity onPress={onPress} activeOpacity={0.7}>
				{content}
			</TouchableOpacity>
		);
	}
	return content;
};

interface LayoutOptionProps {
	type: LayoutType;
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	isSelected: boolean;
	onSelect: () => void;
}

const LayoutOption: React.FC<LayoutOptionProps> = ({
	type,
	icon,
	label,
	isSelected,
	onSelect,
}) => (
	<TouchableOpacity
		style={[settingsScreenStyles.layoutOption, isSelected && settingsScreenStyles.layoutOptionSelected]}
		onPress={onSelect}
		activeOpacity={0.8}
	>
		<View
			style={[
				settingsScreenStyles.layoutIconContainer,
				isSelected && settingsScreenStyles.layoutIconContainerSelected,
			]}
		>
			<Ionicons
				name={icon}
				size={28}
				color={isSelected ? colors.primary : colors.textMuted}
			/>
		</View>
		<Typography
			variant="bodySmall"
			color={isSelected ? "accent" : "secondary"}
			weight={isSelected ? "semiBold" : "regular"}
		>
			{label}
		</Typography>
		{isSelected && (
			<View style={settingsScreenStyles.checkmark}>
				<Ionicons name="checkmark-circle" size={20} color={colors.primary} />
			</View>
		)}
	</TouchableOpacity>
);

const SettingsScreen: React.FC<SettingsProps> = ({ navigation }) => {
	const { settings, updateLayout } = useSettings();
	const { showAlert } = useAlert();

	const handleClearCache = () => {
		showAlert({
			title: "Clear Cache",
			message: "This will remove all saved data including your library and notes. This action cannot be undone.",
			buttons: [
				{ text: "Cancel", style: "cancel" },
				{
					text: "Clear",
					style: "destructive",
					onPress: async () => {
						await AsyncStorage.clear();
						showAlert({
							title: "Done",
							message: "Cache cleared. Please restart the app.",
							buttons: [{ text: "OK" }],
						});
					},
				},
			],
		});
	};

	return (
		<SafeAreaView style={settingsScreenStyles.container}>
			<StatusBar barStyle="light-content" backgroundColor={colors.background} />

			{/* Header */}
			<View style={settingsScreenStyles.header}>
				<Typography variant="h2">Settings</Typography>
				<Typography variant="bodySmall" color="muted" style={settingsScreenStyles.subtitle}>
					Customize your experience
				</Typography>
			</View>

			<ScrollView
				style={settingsScreenStyles.scrollView}
				contentContainerStyle={settingsScreenStyles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Appearance Section */}
				<View style={settingsScreenStyles.section}>
					<Typography variant="label" color="muted" style={settingsScreenStyles.sectionTitle}>
						Appearance
					</Typography>
					<Card variant="outlined" padding="none">
						<View style={settingsScreenStyles.settingRow}>
							<View style={settingsScreenStyles.settingIcon}>
								<Ionicons name="grid-outline" size={22} color={colors.primary} />
							</View>
							<View style={settingsScreenStyles.settingContent}>
								<Typography variant="body" weight="medium">
									Library Layout
								</Typography>
								<Typography variant="caption" color="muted" style={settingsScreenStyles.settingDesc}>
									Choose how your audiobooks are displayed
								</Typography>
							</View>
						</View>

						{/* Layout Options */}
						<View style={settingsScreenStyles.layoutOptions}>
							<LayoutOption
								type="list"
								icon="list"
								label="List"
								isSelected={settings.homeLayout === "list"}
								onSelect={() => updateLayout("list")}
							/>
							<LayoutOption
								type="grid"
								icon="grid"
								label="Grid"
								isSelected={settings.homeLayout === "grid"}
								onSelect={() => updateLayout("grid")}
							/>
							<LayoutOption
								type="shelf"
								icon="library"
								label="Shelf"
								isSelected={settings.homeLayout === "shelf"}
								onSelect={() => updateLayout("shelf")}
							/>
						</View>
					</Card>
				</View>

				{/* Playback Section */}
				<View style={settingsScreenStyles.section}>
					<Typography variant="label" color="muted" style={settingsScreenStyles.sectionTitle}>
						Playback
					</Typography>
					<Card variant="outlined" padding="none">
						<SettingRow
							icon="play-skip-forward"
							label="Skip Duration"
							description="15 seconds"
						/>
						<View style={settingsScreenStyles.divider} />
						<SettingRow
							icon="moon-outline"
							label="Sleep Timer"
							description="Off"
						/>
					</Card>
				</View>

				{/* Data Section */}
				<View style={settingsScreenStyles.section}>
					<Typography variant="label" color="muted" style={settingsScreenStyles.sectionTitle}>
						Data
					</Typography>
					<Card variant="outlined" padding="none">
						<SettingRow
							icon="cloud-download-outline"
							label="Export Library"
							description="Save your library as a backup"
						/>
						<View style={settingsScreenStyles.divider} />
						<SettingRow
							icon="trash-outline"
							label="Clear Cache"
							description="Remove all saved data"
							onPress={handleClearCache}
						/>
					</Card>
				</View>

				{/* About Section */}
				<View style={settingsScreenStyles.section}>
					<Typography variant="label" color="muted" style={settingsScreenStyles.sectionTitle}>
						About
					</Typography>
					<Card variant="outlined" padding="none">
						<SettingRow
							icon="information-circle-outline"
							label="Version"
							rightElement={
								<Typography variant="bodySmall" color="muted">
									1.0.0
								</Typography>
							}
						/>
					</Card>
				</View>

				{/* Footer */}
				<View style={settingsScreenStyles.footer}>
					<Typography variant="caption" color="muted" align="center">
						AudioShelf
					</Typography>
					<Typography variant="caption" color="muted" align="center">
						Made with ♥ for audiobook lovers
					</Typography>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default SettingsScreen;

