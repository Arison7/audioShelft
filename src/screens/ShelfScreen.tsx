import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	ScrollView,
	Modal,
	SafeAreaView,
	StatusBar,
	Image,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { RootStackParamList } from "../navigation/types";
import { Directory, File } from "expo-file-system";

// Theme & Components
import { colors, shelfScreenStyles } from "../theme";
import {
	Typography,
	Button,
	Input,
	EmptyState,
	LoadingScreen,
	Card,
	IconButton,
	useAlert,
	PatternSelector,
} from "../components/ui";
import { AudiobookCard, AudiobookGridCard, FolderCard, ShelfView } from "../components";
import { useSettings } from "../context/SettingsContext";
import { usePlayback } from "../context/PlaybackContext";
import { pickCoverImage } from "../utils/coverImage";
import CoverImage from "../components/CoverImage";
import MiniAudioPlayer from "../components/MiniAudioPlayer";

// Helper to get pattern index from ID (same as ShelfView)
const getPatternIndex = (id: string): number => {
	let hash = 0;
	for (let i = 0; i < id.length; i++) {
		hash = ((hash << 5) - hash) + id.charCodeAt(i);
		hash = hash & hash;
	}
	return Math.abs(hash) % 12; // 12 different patterns
};

// ============================================
// SAMPLE DATA - Remove this section for production
// ============================================
const getSampleMediaItems = (): MediaItem[] => {
	return [
		{
			id: generateUniqueId(),
			name: "Pride and Prejudice (Sample)",
			permanentUri: "asset://pride_and_prejudice_sample",
			timestamp: Date.now(),
		},
		{
			id: generateUniqueId(),
			name: "Sherlock Holmes (Sample)",
			permanentUri: "asset://sherlock_holmes_sample",
			timestamp: Date.now() - 1000,
		},
		{
			id: generateUniqueId(),
			name: "The Great Gatsby (Sample)",
			permanentUri: "asset://pride_and_prejudice_sample",
			timestamp: Date.now() - 2000,
		},
		{
			id: generateUniqueId(),
			name: "Moby Dick (Sample)",
			permanentUri: "asset://sherlock_holmes_sample",
			timestamp: Date.now() - 3000,
		},
		{
			id: generateUniqueId(),
			name: "1984 (Sample)",
			permanentUri: "asset://pride_and_prejudice_sample",
			timestamp: Date.now() - 4000,
		},
		{
			id: generateUniqueId(),
			name: "To Kill a Mockingbird (Sample)",
			permanentUri: "asset://sherlock_holmes_sample",
			timestamp: Date.now() - 5000,
		},
	];
};
// ============================================

type ShelfProps = NativeStackScreenProps<RootStackParamList, "Shelf">;

const generateUniqueId = (): string => {
	return `${Date.now()}-${Math.floor(Math.random() * 9999)}`;
};

const ASYNC_STORAGE_KEY = "@MediaShelf:list";

export type MediaItem = {
	id: string;
	name: string;
	permanentUri: string;
	timestamp: number;
	coverImageUri?: string; // Optional cover image URI
	patternIndex?: number; // Pattern index for books without cover (0-5)
};

export type ShelfItem = MediaItem & {
	itemCount: number;
	sortType: "name" | "date";
};

const handleError = (err: unknown) => {
	if (err instanceof Error) {
		if (err.message.includes("User canceled") || err.message.includes("cancelled")) {
			return; // User cancelled, don't show error
		}
	}
	console.error("Document picker error:", err);
};

const ShelfScreen: React.FC<ShelfProps> = ({ navigation }) => {
	const insets = useSafeAreaInsets();
	const { settings } = useSettings();
	const { setCurrentTrack } = usePlayback();
	const { showAlert } = useAlert();
	const isGridLayout = settings.homeLayout === "grid";
	const isShelfLayout = settings.homeLayout === "shelf";

	const [mediaList, setMediaList] = useState<(MediaItem | ShelfItem)[]>([]);
	const [loading, setLoading] = useState(true);
	const [isPicking, setIsPicking] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Edit modal state
	const [editModalVisible, setEditModalVisible] = useState(false);
	const [editingItem, setEditingItem] = useState<MediaItem | ShelfItem | null>(null);
	const [editingText, setEditingText] = useState("");
	const [editingCoverUri, setEditingCoverUri] = useState<string | undefined>(undefined);
	const [editingPatternIndex, setEditingPatternIndex] = useState<number | undefined>(undefined);

	// Action sheet for grid items
	const [actionSheetItem, setActionSheetItem] = useState<MediaItem | ShelfItem | null>(null);

	const loadShelf = useCallback(async () => {
		try {
			const storedList = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
			if (storedList) {
				const items: (MediaItem | ShelfItem)[] = JSON.parse(storedList);
				items.sort((a, b) => b.timestamp - a.timestamp);
				setMediaList(items);
			} else {
				// ============================================
				// SAMPLE DATA - Remove for production
				// ============================================
				const sampleItems = getSampleMediaItems();
				setMediaList(sampleItems);
				await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(sampleItems));
				// ============================================
			}
		} catch (e) {
			console.error("Failed to load shelf:", e);
		} finally {
			setLoading(false);
		}
	}, []);

	const saveShelf = useCallback(async (items: (MediaItem | ShelfItem)[]) => {
		try {
			await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(items));
		} catch (e) {
			console.error("Failed to save shelf:", e);
		}
	}, []);

	useEffect(() => {
		loadShelf();
	}, [loadShelf]);

	const handleAddDirectory = async () => {
		// Note: expo-document-picker doesn't support directory picking
		// For now, show an alert that this feature isn't available
		showAlert({
			title: "Directory Selection",
			message: "Directory selection is not available with the current document picker. Please add audio files individually.",
			buttons: [{ text: "OK" }],
		});
	};

	const handleAddFile = async () => {
		setIsPicking(true);
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: "audio/*",
				copyToCacheDirectory: true,
			});
			
			if (!result.canceled && result.assets && result.assets.length > 0) {
				const asset = result.assets[0];
				const newItem: MediaItem = {
					id: generateUniqueId(),
					name: asset.name || "Unknown Audio",
					permanentUri: asset.uri,
					timestamp: Date.now(),
				};
				const updatedList = [newItem, ...mediaList];
				setMediaList(updatedList);
				await saveShelf(updatedList);
			}
		} catch (error: any) {
			if (error.message && !error.message.includes("cancel")) {
				console.error("Error adding file:", error);
			}
		} finally {
			setIsPicking(false);
		}
	};

	const handleDeleteItem = (item: MediaItem | ShelfItem) => {
		showAlert({
			title: "Remove Item",
			message: `Are you sure you want to remove "${item.name}"?`,
			buttons: [
				{ text: "Cancel", style: "cancel" },
				{
					text: "Remove",
					style: "destructive",
					onPress: async () => {
						const updatedList = mediaList.filter((i) => i.id !== item.id);
						setMediaList(updatedList);
						await saveShelf(updatedList);
					},
				},
			],
		});
	};

	const openEditModal = (item: MediaItem | ShelfItem) => {
		setEditingItem(item);
		setEditingText(item.name);
		// Set cover URI and pattern for MediaItems only
		if (!("itemCount" in item)) {
			const mediaItem = item as MediaItem;
			setEditingCoverUri(mediaItem.coverImageUri);
			// Initialize patternIndex: use stored value, or default from ID if no cover
			if (mediaItem.coverImageUri) {
				setEditingPatternIndex(undefined);
			} else {
				setEditingPatternIndex(mediaItem.patternIndex ?? getPatternIndex(item.id));
			}
		} else {
			setEditingCoverUri(undefined);
			setEditingPatternIndex(undefined);
		}
		setEditModalVisible(true);
	};

	const closeEditModal = () => {
		setEditModalVisible(false);
		setEditingItem(null);
		setEditingText("");
		setEditingCoverUri(undefined);
		setEditingPatternIndex(undefined);
	};

	const handlePickCoverImage = async () => {
		const imageUri = await pickCoverImage();
		if (imageUri) {
			setEditingCoverUri(imageUri);
			// Clear pattern when cover is added
			setEditingPatternIndex(undefined);
		}
	};

	const saveEditedName = async () => {
		if (!editingItem) return;
		const trimmed = editingText.trim();
		if (trimmed.length === 0) {
			showAlert({
				title: "Name required",
				message: "Please enter a valid name.",
				buttons: [{ text: "OK" }],
			});
			return;
		}
		const updated = mediaList.map((it) => {
			if (it.id === editingItem.id) {
				// Only update coverImageUri and patternIndex for MediaItem (not ShelfItem)
				if (!("itemCount" in it)) {
					// If there's a cover, clear pattern. If no cover, use the selected pattern
					const finalPatternIndex = editingCoverUri ? undefined : editingPatternIndex;
					return { 
						...it, 
						name: trimmed, 
						coverImageUri: editingCoverUri,
						patternIndex: finalPatternIndex,
					};
				}
				return { ...it, name: trimmed };
			}
			return it;
		});
		setMediaList(updated);
		await saveShelf(updated);
		closeEditModal();
	};

	const handlePlayItem = (item: MediaItem) => {
		setCurrentTrack({
			filePath: item.permanentUri,
			fileName: item.name,
			coverImageUri: item.coverImageUri,
			itemId: item.id,
		});
		navigation.navigate("Player", {
			filePath: item.permanentUri,
			fileName: item.name,
			coverImageUri: item.coverImageUri,
			itemId: item.id,
		});
	};

	const handleOpenShelf = (shelf: ShelfItem) => {
		showAlert({
			title: "Coming Soon",
			message: `"${shelf.name}" folder view is not implemented yet.`,
			buttons: [{ text: "OK" }],
		});
	};

	const handlePlayShelf = (shelf: ShelfItem) => {
		showAlert({
			title: "Coming Soon",
			message: `Play all in "${shelf.name}" is not implemented yet.`,
			buttons: [{ text: "OK" }],
		});
	};

	const showItemActions = (item: MediaItem | ShelfItem) => {
		const isShelf = "itemCount" in item;
		showAlert({
			title: item.name,
			message: "Choose an action",
			buttons: [
				{
					text: isShelf ? "Open" : "Play",
					onPress: () => isShelf ? handleOpenShelf(item as ShelfItem) : handlePlayItem(item as MediaItem),
				},
				{ text: "Rename", onPress: () => openEditModal(item) },
				{ 
					text: "Delete", 
					style: "destructive", 
					onPress: () => {
						// Delay to ensure the first alert is fully dismissed before showing the delete confirmation
						setTimeout(() => {
							handleDeleteItem(item);
						}, 250);
					}
				},
				{ text: "Cancel", style: "cancel" },
			],
		});
	};

	if (loading || isPicking) {
		return (
			<LoadingScreen
				message={isPicking ? "Adding to library..." : "Loading your library..."}
			/>
		);
	}

	// Filter items based on search query
	const filteredList = searchQuery.trim()
		? mediaList.filter((item) =>
				item.name.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: mediaList;

	// Separate folders and media items
	const folders = filteredList.filter((item) => "itemCount" in item) as ShelfItem[];
	const mediaItems = filteredList.filter((item) => !("itemCount" in item)) as MediaItem[];

	return (
		<SafeAreaView style={[shelfScreenStyles.container, { paddingTop: insets.top }]}>
			<StatusBar barStyle="light-content" backgroundColor={colors.background} />

			{/* Header */}
			<View style={shelfScreenStyles.header}>
				<View>
					<Typography variant="h2">Library</Typography>
					<Typography variant="bodySmall" color="muted" style={shelfScreenStyles.subtitle}>
						{searchQuery.trim() 
							? `${filteredList.length} of ${mediaList.length} ${mediaList.length === 1 ? "item" : "items"}`
							: `${mediaList.length} ${mediaList.length === 1 ? "item" : "items"}`
						}
					</Typography>
				</View>
				<View style={shelfScreenStyles.headerActions}>
					<IconButton
						icon="add-circle-outline"
						onPress={() => {
							showAlert({
								title: "Add to Library",
								message: "Choose what you want to add",
								buttons: [
									{
										text: "Add Audio File",
										onPress: handleAddFile,
									},
									{
										text: "Add Folder",
										onPress: handleAddDirectory,
									},
									{
										text: "Cancel",
										style: "cancel",
									},
								],
							});
						}}
						variant="ghost"
						size="md"
					/>
					<IconButton
						icon="settings-outline"
						onPress={() => navigation.navigate("Settings")}
						variant="ghost"
						size="md"
					/>
				</View>
			</View>

			{/* Search Bar */}
			<View style={shelfScreenStyles.searchContainer}>
				<View style={shelfScreenStyles.searchInputWrapper}>
					<Ionicons 
						name="search-outline" 
						size={20} 
						color={colors.textMuted} 
						style={shelfScreenStyles.searchIcon}
					/>
					<Input
						value={searchQuery}
						onChangeText={setSearchQuery}
						placeholder="Search your library..."
						style={shelfScreenStyles.searchInput}
						containerStyle={shelfScreenStyles.searchInputContainer}
					/>
					{searchQuery.length > 0 && (
						<TouchableOpacity
							onPress={() => setSearchQuery("")}
							style={shelfScreenStyles.clearButton}
							activeOpacity={0.7}
						>
							<Ionicons name="close-circle" size={20} color={colors.textMuted} />
						</TouchableOpacity>
					)}
				</View>
			</View>

			{/* Content */}
			{mediaList.length === 0 ? (
				<EmptyState
					icon="library-outline"
					title="Your Library is Empty"
					description="Add audiobooks or folders to start building your collection"
					actionLabel="Add Audiobook"
					onAction={handleAddFile}
				/>
			) : (
				<ScrollView
					style={shelfScreenStyles.scrollView}
					contentContainerStyle={shelfScreenStyles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					{/* Folders Section (always list view) */}
					{folders.length > 0 && (
						<View style={shelfScreenStyles.section}>
							<Typography variant="label" color="muted" style={shelfScreenStyles.sectionTitle}>
								Folders
							</Typography>
							{folders.map((shelf) => (
								<FolderCard
									key={`shelf-${shelf.id}`}
									title={shelf.name}
									itemCount={shelf.itemCount}
									sortType={shelf.sortType}
									onOpen={() => handleOpenShelf(shelf)}
									onPlay={() => handlePlayShelf(shelf)}
									onEdit={() => openEditModal(shelf)}
									onDelete={() => handleDeleteItem(shelf)}
								/>
							))}
						</View>
					)}

					{/* Audiobooks Section */}
					{mediaItems.length > 0 && (
						<View style={shelfScreenStyles.section}>
							{folders.length > 0 && (
								<Typography variant="label" color="muted" style={shelfScreenStyles.sectionTitle}>
									Audiobooks
								</Typography>
							)}

							{isShelfLayout ? (
								// Shelf Layout
								<ShelfView
									items={mediaItems}
									onPlay={handlePlayItem}
									onLongPress={showItemActions}
								/>
							) : isGridLayout ? (
								// Grid Layout
								<View style={shelfScreenStyles.gridContainer}>
									{mediaItems.map((media) => (
										<AudiobookGridCard
											key={`media-${media.id}`}
											title={media.name}
											timestamp={media.timestamp}
											coverImageUri={media.coverImageUri}
											itemId={media.id}
											filePath={media.permanentUri}
											onPlay={() => handlePlayItem(media)}
											onLongPress={() => showItemActions(media)}
										/>
									))}
								</View>
							) : (
								// List Layout
								mediaItems.map((media) => (
									<AudiobookCard
										key={`media-${media.id}`}
										title={media.name}
										timestamp={media.timestamp}
										coverImageUri={media.coverImageUri}
										itemId={media.id}
										filePath={media.permanentUri}
										onPlay={() => handlePlayItem(media)}
										onEdit={() => openEditModal(media)}
										onDelete={() => handleDeleteItem(media)}
									/>
								))
							)}
						</View>
					)}
				</ScrollView>
			)}

			{/* Mini Audio Player */}
			<MiniAudioPlayer />

			{/* Edit Modal */}
			<Modal
				visible={editModalVisible}
				animationType="slide"
				transparent
				onRequestClose={closeEditModal}
			>
				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
				>
					<View style={shelfScreenStyles.modalOverlay}>
						<ScrollView
							contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
							keyboardShouldPersistTaps="handled"
							showsVerticalScrollIndicator={false}
							bounces={false}
						>
							<Card variant="elevated" style={shelfScreenStyles.modalContent}>
								<Typography variant="h3" style={shelfScreenStyles.modalTitle}>
									Edit Book
								</Typography>
								
								{/* Cover Image - Show for MediaItems only */}
								{editingItem && !("itemCount" in editingItem) && (
									<View style={shelfScreenStyles.coverImageSection}>
										<Typography variant="caption" color="secondary" style={shelfScreenStyles.coverLabel}>
											Cover Image
										</Typography>
										<TouchableOpacity
											style={shelfScreenStyles.coverImageContainer}
											onPress={handlePickCoverImage}
											activeOpacity={0.8}
										>
											{editingCoverUri ? (
												<Image
													source={{ uri: editingCoverUri }}
													style={shelfScreenStyles.coverImagePreview}
													resizeMode="cover"
												/>
											) : (
												<CoverImage
													uri={(editingItem as MediaItem).coverImageUri}
													itemId={editingItem.id}
													size={120}
												/>
											)}
											<View style={shelfScreenStyles.coverImageOverlay}>
												<Ionicons name="camera" size={24} color={colors.textPrimary} />
												<Typography
													variant="caption"
													color="primary"
													style={shelfScreenStyles.coverImageText}
												>
													{editingCoverUri || (editingItem as MediaItem).coverImageUri ? "Change" : "Add Cover"}
												</Typography>
											</View>
										</TouchableOpacity>
										{(editingCoverUri || (editingItem as MediaItem).coverImageUri) && (
											<TouchableOpacity
												onPress={() => {
													setEditingCoverUri(undefined);
													// Restore pattern when cover is removed
													if (editingItem && !("itemCount" in editingItem)) {
														const item = editingItem as MediaItem;
														setEditingPatternIndex(item.patternIndex ?? getPatternIndex(item.id));
													}
												}}
												style={shelfScreenStyles.removeCoverButton}
											>
												<Typography variant="caption" color="error">
													Remove Cover
												</Typography>
											</TouchableOpacity>
										)}
									</View>
								)}

								{/* Pattern Selector - Show only when no cover image */}
								{editingItem && !("itemCount" in editingItem) && !editingCoverUri && !(editingItem as MediaItem).coverImageUri && (
									<PatternSelector
										selectedIndex={editingPatternIndex ?? getPatternIndex(editingItem.id)}
										onSelect={(index) => setEditingPatternIndex(index)}
									/>
								)}

								{/* Name Input */}
								<Input
									value={editingText}
									onChangeText={setEditingText}
									placeholder="Enter name..."
									label="Book Name"
									autoFocus={true}
								/>

								<View style={shelfScreenStyles.modalActions}>
									<Button
										title="Cancel"
										onPress={closeEditModal}
										variant="ghost"
										size="md"
									/>
									<Button
										title="Save"
										onPress={saveEditedName}
										variant="primary"
										size="md"
									/>
								</View>
							</Card>
						</ScrollView>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</SafeAreaView>
	);
};

export default ShelfScreen;
