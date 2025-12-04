import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	Button,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	Platform,
	TextInput,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import {
	pick,
	pickDirectory,
	errorCodes,
	isErrorWithCode,
} from "@react-native-documents/picker";
import { RootStackParamList } from "../navigation/types";
import { Directory, File } from "expo-file-system";

type ShelfProps = NativeStackScreenProps<RootStackParamList, "Shelf">;

// --- ID Generation Replacement ---
// Combines current timestamp with a small random number to prevent collisions
const generateUniqueId = (): string => {
	return `${Date.now()}-${Math.floor(Math.random() * 9999)}`;
};

const ASYNC_STORAGE_KEY = "@MediaShelf:list";

// Audio File Metadata Structure
export type MediaItem = {
	id: string;
	name: string;
	permanentUri: string;
	timestamp: number;
}
export type ShelfItem = MediaItem & {
	itemCount: number;
	sortType: "name" | "date";
}
const handleError = (err: unknown) => {
	if (isErrorWithCode(err)) {
		switch (err.code) {
			case errorCodes.IN_PROGRESS:
				console.warn(
					"user attempted to present a picker, but a previous one was already presented"
				);
				break;
			case errorCodes.UNABLE_TO_OPEN_FILE_TYPE:
				break;
			case errorCodes.OPERATION_CANCELED:
				// ignore
				break;
			default:
				console.error(err);
		}
	} else {
		console.error(err);
	}
};

const ShelfScreen: React.FC<ShelfProps> = ({ navigation }) => {
	const [mediaList, setMediaList] = useState<(MediaItem | ShelfItem)[]>([]);
	const [loading, setLoading] = useState(true);
	const [isPicking, setIsPicking] = useState(false);

	// for inline editing of names
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingText, setEditingText] = useState<string>("");

	// Load Data from AsyncStorage
	const loadShelf = useCallback(async () => {
		try {
			const storedList = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
			if (storedList) {
				const items: (MediaItem | ShelfItem)[] = JSON.parse(storedList);
				items.sort((a, b) => b.timestamp - a.timestamp);
				setMediaList(items);
			}
		} catch (e) {
			console.error("Failed to load shelf from AsyncStorage:", e);
		} finally {
			setLoading(false);
		}
	}, []);

	// Save Data to AsyncStorage
	const saveShelf = useCallback(async (items: (MediaItem | ShelfItem)[]) => {
		try {
			await AsyncStorage.setItem(
				ASYNC_STORAGE_KEY,
				JSON.stringify(items)
			);
		} catch (e) {
			console.error("Failed to save shelf to AsyncStorage:", e);
		}
	}, []);

	// Load shelf on component mount
	useEffect(() => {
		loadShelf();
	}, [loadShelf]);

	const handleAddDictionary = async () => {
		setIsPicking(true);
		try {
			const result = await pickDirectory({
				requestLongTermAccess: true,
			});
			// Iterate through files in the selected directory
			const directory = new Directory(result.uri);
      const fileCount = directory.list().filter(file => file instanceof File ).length;
      const newShelf : ShelfItem = {
        id: generateUniqueId(),
        name: directory.name,
        permanentUri: result.uri,
        timestamp: Date.now(),
        itemCount: fileCount, // Placeholder, will be updated
        sortType: "date", // Default sort type
      }
      // Update the medial List 
      setMediaList((prev) => [newShelf, ...prev]);
      await saveShelf([newShelf, ...mediaList]);


		} catch (error) {
			handleError(error);
		}

		setIsPicking(false);
	};

	const handleAddFile = async () => {
		setIsPicking(true);
		try {
			const [result] = await pick({
				mode: "open",
				type: "audio/*",
				requestLongTermAccess: true,
			});
			if (result.error === null && result.name) {
				let externalUri = result.uri;
				const fileName = result.name;

				const newItem: MediaItem = {
					id: generateUniqueId(),
					name: fileName,
					permanentUri: externalUri, // Store the (now persistently accessible) URI
					timestamp: Date.now(),
				};

				const updatedList = [newItem, ...mediaList];
				setMediaList(updatedList);
				await saveShelf(updatedList); // Persist to local storage
			}
		} catch (error: any) {
			// we don't need to alert on user cancellation
			if (error.name !== "UserCancelledError") {
				console.error("Error adding file to shelf:", error);
			}
		} finally {
			setIsPicking(false);
		}
	};

	// Support deletion for both MediaItem and ShelfItem
	const handleDeleteItem = async (itemToDelete: MediaItem | ShelfItem) => {
		Alert.alert(
			"Delete",
			`Are you sure you want to remove "${itemToDelete.name}"?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						const updatedList = mediaList.filter(
							(item) => item.id !== itemToDelete.id
						);
						setMediaList(updatedList);
						await saveShelf(updatedList);
					},
				},
			]
		);
	};

	// Edit a name inline
	const startEditName = (item: MediaItem | ShelfItem) => {
		setEditingId(item.id);
		setEditingText(item.name);
	};

	const cancelEditName = () => {
		setEditingId(null);
		setEditingText("");
	};

	const saveEditedName = async () => {
		if (!editingId) return;
		const trimmed = editingText.trim();
		if (trimmed.length === 0) {
			Alert.alert("Name required", "Please enter a valid name.");
			return;
		}

		const updated = mediaList.map((it) =>
			it.id === editingId ? { ...it, name: trimmed } : it
		);
		setMediaList(updated);
		await saveShelf(updated);
		setEditingId(null);
		setEditingText("");
	};

	// --- 5. Navigation Logic ---
	const handlePlayItem = (item: MediaItem) => {
		navigation.navigate("Player", {
			filePath: item.permanentUri,
			fileName: item.name,
		});
	};

	// Placeholder handlers for shelf-specific actions (not implemented yet)
	const handleOpenShelf = (shelf: ShelfItem) => {
		// Not implemented yet; placeholder to comply with UI
		Alert.alert("Open Shelf", `"${shelf.name}" - open not implemented yet.`);
	};

	const handlePlayShelf = (shelf: ShelfItem) => {
		// Not implemented yet; placeholder to comply with UI
		Alert.alert("Play Shelf", `"${shelf.name}" - play not implemented yet.`);
	};

	if (loading || isPicking) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#3498db" />
				<Text style={{ marginTop: 10 }}>
					{isPicking
						? "Adding reference & securing access..."
						: "Loading Shelf..."}
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ScrollView style={styles.listContainer}>
				{mediaList.length === 0 ? (
					<Text style={styles.emptyText}>
						Tap the button below to add your first audiobook
						reference!
					</Text>
				) : (
					mediaList.map((item) => {
						// Use unique keys per list item (prefix by type)
						const listKey = `${"itemCount" in item ? "shelf" : "media"}-${
							item.id
						}`;

						// Render ShelfItem (visually distinct)
						if ("itemCount" in item) {
							const shelf = item as ShelfItem;
							return (
								<View key={listKey} style={styles.shelfItem}>
									<View style={styles.shelfHeader}>
										{editingId === shelf.id ? (
											<View style={styles.editRow}>
												<TextInput
													value={editingText}
													onChangeText={setEditingText}
													style={styles.editInput}
													placeholder="Shelf name"
												/>
												<Button title="Save" onPress={saveEditedName} />
												<Button title="Cancel" onPress={cancelEditName} />
											</View>
										) : (
											<>
												<View style={styles.shelfInfo}>
													<Text
														style={styles.shelfName}
														numberOfLines={1}
													>
														{shelf.name}
													</Text>
													<Text style={styles.shelfMeta}>
														{shelf.itemCount} items • sorted by {shelf.sortType}
													</Text>
												</View>
												<View style={styles.shelfActions}>
													<TouchableOpacity
														style={styles.smallButton}
														onPress={() => startEditName(shelf)}
													>
														<Text style={styles.smallButtonText}>Edit</Text>
													</TouchableOpacity>
													<TouchableOpacity
														style={styles.openButton}
														onPress={() => handleOpenShelf(shelf)}
													>
														<Text style={styles.openButtonText}>Open</Text>
													</TouchableOpacity>
													<TouchableOpacity
														style={styles.playButton}
														onPress={() => handlePlayShelf(shelf)}
													>
														<Text style={styles.playButtonText}>Play</Text>
													</TouchableOpacity>
													<TouchableOpacity
														onPress={() => handleDeleteItem(shelf)}
														style={styles.deleteButton}
													>
														<Text style={{ color: "#e74c3c", fontSize: 14 }}>
															&times;
														</Text>
													</TouchableOpacity>
												</View>
											</>
										)}
									</View>
								</View>
							);
						}

						// Render MediaItem
						const media = item as MediaItem;
						return (
							<View key={listKey} style={styles.mediaItem}>
								<View style={styles.mediaDetails}>
									{editingId === media.id ? (
										<View style={styles.editRow}>
											<TextInput
												value={editingText}
												onChangeText={setEditingText}
												style={styles.editInput}
												placeholder="File name"
											/>
											<Button title="Save" onPress={saveEditedName} />
											<Button title="Cancel" onPress={cancelEditName} />
										</View>
									) : (
										<>
											<Text style={styles.mediaName} numberOfLines={1}>
												{media.name}
											</Text>
											<Text style={styles.mediaDate}>
												{new Date(media.timestamp).toLocaleDateString()}
											</Text>
										</>
									)}
								</View>

								<View style={styles.rowActions}>
									<Button
										title="Play"
										onPress={() => handlePlayItem(media)}
									/>
									<TouchableOpacity
										onPress={() => startEditName(media)}
										style={styles.smallButton}
									>
										<Text style={styles.smallButtonText}>Edit</Text>
									</TouchableOpacity>
									<TouchableOpacity
										onPress={() => handleDeleteItem(media)}
										style={styles.deleteButton}
									>
										<Text style={{ color: "#e74c3c", fontSize: 14 }}>
											&times; Remove
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						);
					})
				)}
			</ScrollView>

			<View style={styles.addButtonContainer}>
				<Button
					title="Add New Audiobook Reference ➕"
					onPress={handleAddFile}
					disabled={isPicking}
				/>
				<Button
					title="Add New Directory Reference ➕"
					onPress={handleAddDictionary}
					disabled={isPicking}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		fontSize: 26,
		fontWeight: "bold",
		marginBottom: 15,
		color: "#2c3e50",
	},
	listContainer: {
		flex: 1,
		width: "100%",
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 10,
		backgroundColor: "#fff",
	},
	mediaItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	mediaDetails: { flex: 1, marginRight: 10 },
	mediaName: { fontSize: 16, fontWeight: "600" },
	mediaDate: { fontSize: 12, color: "#999" },
	deleteButton: {
		marginLeft: 10,
		padding: 5,
		borderRadius: 5,
		borderWidth: 1,
		borderColor: "#e74c3c",
		alignItems: "center",
		justifyContent: "center",
	},
	emptyText: {
		textAlign: "center",
		padding: 20,
		fontSize: 16,
		color: "#888",
	},
	addButtonContainer: {
		paddingVertical: 10,
		borderTopWidth: 1,
		borderTopColor: "#eee",
	},
	warningBox: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fbeaea",
		padding: 10,
		borderRadius: 8,
		marginBottom: 15,
		borderLeftWidth: 4,
		borderLeftColor: "#e74c3c",
	},
	warningText: {
		marginLeft: 10,
		fontSize: 12,
		color: "#c0392b",
		flex: 1,
	},

	/* Shelf item specific styles (visually different) */
	shelfItem: {
		padding: 14,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
		backgroundColor: "#fbfdff",
		borderRadius: 6,
		marginBottom: 8,
	},
	shelfHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	shelfInfo: {
		flex: 1,
		marginRight: 10,
	},
	shelfName: {
		fontSize: 17,
		fontWeight: "700",
		color: "#2c3e50",
	},
	shelfMeta: {
		fontSize: 12,
		color: "#58606a",
		marginTop: 4,
	},
	shelfActions: {
		flexDirection: "row",
		alignItems: "center",
	},

	/* Buttons & small controls */
	rowActions: {
		flexDirection: "row",
		alignItems: "center",
	},
	smallButton: {
		marginLeft: 8,
		paddingHorizontal: 8,
		paddingVertical: 6,
		borderRadius: 6,
		backgroundColor: "#eef6ff",
		borderWidth: 1,
		borderColor: "#d9ecff",
	},
	smallButtonText: {
		fontSize: 12,
		color: "#2978b5",
	},
	openButton: {
		marginLeft: 8,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#d1f2d1",
		backgroundColor: "#f6fff6",
	},
	openButtonText: {
		fontSize: 13,
		color: "#2b8a2b",
	},
	playButton: {
		marginLeft: 8,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 6,
		backgroundColor: "#ffeecb",
		borderWidth: 1,
		borderColor: "#ffd7a8",
	},
	playButtonText: {
		fontSize: 13,
		color: "#b36b00",
		fontWeight: "600",
	},

	/* Editing row styles */
	editRow: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
	},
	editInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#ddd",
		padding: 8,
		borderRadius: 6,
		marginRight: 8,
	},
});

export default ShelfScreen;
