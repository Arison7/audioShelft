import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	ScrollView,
	SafeAreaView,
	StatusBar,
	TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Directory, File } from "expo-file-system";
import { RootStackParamList } from "../navigation/types";
import { colors, shelfScreenStyles } from "../theme";
import {
	Typography,
	EmptyState,
	LoadingScreen,
	IconButton,
} from "../components/ui";
import { AudiobookCard } from "../components";
import { usePlayback } from "../context/PlaybackContext";

type FolderScreenProps = NativeStackScreenProps<RootStackParamList, "Folder">;

interface FolderFile {
	name: string;
	uri: string;
	isDirectory: boolean;
}

const FolderScreen: React.FC<FolderScreenProps> = ({ navigation, route }) => {
	const { folderUri, folderName } = route.params;
	const insets = useSafeAreaInsets();
	const { setCurrentTrack } = usePlayback();
	const [files, setFiles] = useState<FolderFile[]>([]);
	const [loading, setLoading] = useState(true);
	const [audioFiles, setAudioFiles] = useState<FolderFile[]>([]);

	const loadFolderContents = useCallback(async () => {
		try {
			setLoading(true);
			const directory = new Directory(folderUri);
			const items = directory.list();
			
			const folderFiles: FolderFile[] = [];
			const audio: FolderFile[] = [];

			for (const item of items) {
				if (item instanceof File) {
					const fileName = item.name.toLowerCase();
					// Check if it's an audio file
					if (
						fileName.endsWith(".mp3") ||
						fileName.endsWith(".m4a") ||
						fileName.endsWith(".wav") ||
						fileName.endsWith(".aac") ||
						fileName.endsWith(".ogg") ||
						fileName.endsWith(".flac") ||
						fileName.endsWith(".mp4")
					) {
						const fileInfo: FolderFile = {
							name: item.name,
							uri: item.uri,
							isDirectory: false,
						};
						folderFiles.push(fileInfo);
						audio.push(fileInfo);
					}
				}
			}

			// Sort files by name
			folderFiles.sort((a, b) => a.name.localeCompare(b.name));
			audio.sort((a, b) => a.name.localeCompare(b.name));

			setFiles(folderFiles);
			setAudioFiles(audio);
		} catch (error) {
			console.error("Failed to load folder contents:", error);
		} finally {
			setLoading(false);
		}
	}, [folderUri]);

	useEffect(() => {
		loadFolderContents();
	}, [loadFolderContents]);

	const handlePlayFile = (file: FolderFile) => {
		setCurrentTrack({
			filePath: file.uri,
			fileName: file.name,
			itemId: `${folderUri}-${file.name}`,
		});
		navigation.navigate("Player", {
			filePath: file.uri,
			fileName: file.name,
			itemId: `${folderUri}-${file.name}`,
		});
	};

	const handlePlayAll = () => {
		if (audioFiles.length > 0) {
			// Play the first file
			handlePlayFile(audioFiles[0]);
		}
	};

	if (loading) {
		return (
			<LoadingScreen message="Loading folder contents..." />
		);
	}

	return (
		<SafeAreaView style={[shelfScreenStyles.container, { paddingTop: insets.top }]}>
			<StatusBar barStyle="light-content" backgroundColor={colors.background} />

			{/* Header */}
			<View style={shelfScreenStyles.header}>
				<View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
					<IconButton
						icon="arrow-back"
						onPress={() => navigation.goBack()}
						variant="ghost"
						size="md"
					/>
					<View>
						<Typography variant="h2">{folderName}</Typography>
						<Typography variant="bodySmall" color="muted" style={shelfScreenStyles.subtitle}>
							{audioFiles.length} {audioFiles.length === 1 ? "audio file" : "audio files"}
						</Typography>
					</View>
				</View>
				{audioFiles.length > 0 && (
					<IconButton
						icon="play-circle"
						onPress={handlePlayAll}
						variant="primary"
						size="md"
					/>
				)}
			</View>

			{/* Content */}
			{audioFiles.length === 0 ? (
				<EmptyState
					icon="folder-outline"
					title="No Audio Files"
					description="This folder doesn't contain any audio files"
				/>
			) : (
				<ScrollView
					style={shelfScreenStyles.scrollView}
					contentContainerStyle={shelfScreenStyles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={shelfScreenStyles.section}>
						{audioFiles.map((file, index) => (
							<AudiobookCard
								key={`file-${index}-${file.name}`}
								title={file.name}
								timestamp={Date.now()}
								filePath={file.uri}
								itemId={`${folderUri}-${file.name}`}
								onPlay={() => handlePlayFile(file)}
								onEdit={() => {
									// Edit not available for folder files
								}}
								onDelete={() => {
									// Delete not available for folder files
								}}
							/>
						))}
					</View>
				</ScrollView>
			)}
		</SafeAreaView>
	);
};

export default FolderScreen;

