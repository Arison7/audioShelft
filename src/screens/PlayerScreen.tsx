import React, { useEffect, useState, useRef } from "react";
import {
	View,
	FlatList,
	TouchableOpacity,
	Modal,
	SafeAreaView,
	StatusBar,
	Animated,
	Dimensions,
	KeyboardAvoidingView,
	ScrollView,
	Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/types";
import { getNotesForFile, Note, saveNotesForFile } from "../storage/notesStorage";
import { usePlayback } from "../context/PlaybackContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Theme & Components
import { colors, playerScreenStyles } from "../theme";
import {
	Typography,
	Button,
	IconButton,
	Input,
	Card,
	EmptyState,
	LoadingScreen,
} from "../components/ui";
import AudioPlayer, { AudioPlayerRef } from "../components/AudioPlayer";

type PlayerProps = NativeStackScreenProps<RootStackParamList, "Player">;

const formatTime = (seconds: number) => {
	const totalSeconds = Math.floor(seconds);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const secs = totalSeconds % 60;

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	}
	return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const PlayerScreen: React.FC<PlayerProps> = ({ route, navigation }) => {
	const insets = useSafeAreaInsets();

	if (!route.params) {
		return (
			<SafeAreaView style={[playerScreenStyles.container, { paddingTop: insets.top }]}>
				<EmptyState
					icon="musical-notes-outline"
					title="No Track Selected"
					description="Please select an audiobook from your library"
					actionLabel="Go to Library"
					onAction={() => navigation.goBack()}
				/>
			</SafeAreaView>
		);
	}

	const { filePath, fileName, coverImageUri, itemId } = route.params;
	const { setCurrentTrack } = usePlayback();

	const [notes, setNotes] = useState<Note[]>([]);
	const [notesLoading, setNotesLoading] = useState(true);
	const [noteModalVisible, setNoteModalVisible] = useState(false);
	const [noteText, setNoteText] = useState("");
	const [noteTimestamp, setNoteTimestamp] = useState<number | null>(null);
	const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
	const [resumedFromPosition, setResumedFromPosition] = useState(false);
	const [previousPosition, setPreviousPosition] = useState<number | null>(null);
	const [showReturnButton, setShowReturnButton] = useState(false);
	const audioPlayerRef = useRef<AudioPlayerRef>(null);
	
	// Set current track when screen mounts
	useEffect(() => {
		setCurrentTrack({
			filePath,
			fileName,
			coverImageUri,
			itemId,
		});
		
		return () => {
			// Clear track when navigating away (optional - you might want to keep it)
			// setCurrentTrack(null);
		};
	}, [filePath, fileName, coverImageUri, itemId, setCurrentTrack]);
	
	// Reset resumed indicator when file changes
	useEffect(() => {
		setResumedFromPosition(false);
		setShowReturnButton(false);
		setPreviousPosition(null);
	}, [filePath]);

	// Drawer state
	const screenHeight = Dimensions.get("window").height;
	const collapsedHeight = 120; // Height when collapsed (just header)
	const expandedHeight = screenHeight * 0.75; // Height when expanded (75% of screen)
	const drawerY = useRef(new Animated.Value(collapsedHeight)).current;
	const [isExpanded, setIsExpanded] = useState(false);

	// Initialize drawer position
	useEffect(() => {
		drawerY.setValue(collapsedHeight);
	}, []);

	// Toggle drawer between collapsed and expanded
	const toggleDrawer = () => {
		const targetHeight = isExpanded ? collapsedHeight : expandedHeight;
		setIsExpanded(!isExpanded);
		Animated.spring(drawerY, {
			toValue: targetHeight,
			useNativeDriver: false,
			tension: 50,
			friction: 8,
		}).start();
	};

	useEffect(() => {
		let mounted = true;
		(async () => {
			const loaded = await getNotesForFile(filePath);
			if (mounted) {
				loaded.sort((a, b) => a.timestamp - b.timestamp);
				setNotes(loaded);
				setNotesLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [filePath]);

	const handleOpenNoteModal = (timestamp: number) => {
		setNoteTimestamp(timestamp);
		setNoteText("");
		setEditingNoteId(null);
		setNoteModalVisible(true);
	};

	const handleSaveNote = async () => {
		if (noteTimestamp == null || noteText.trim().length === 0) {
			setNoteModalVisible(false);
			setEditingNoteId(null);
			return;
		}

		if (editingNoteId) {
			const updated = notes.map((n) =>
				n.id === editingNoteId ? { ...n, text: noteText.trim() } : n
			);
			setNotes(updated);
			await saveNotesForFile(filePath, updated);
		} else {
			const newNote: Note = {
				id: `${Date.now()}-${Math.floor(Math.random() * 9999)}`,
				text: noteText.trim(),
				timestamp: noteTimestamp,
				createdAt: Date.now(),
			};
			const updated = [...notes, newNote].sort((a, b) => a.timestamp - b.timestamp);
			setNotes(updated);
			await saveNotesForFile(filePath, updated);
		}

		setNoteModalVisible(false);
		setNoteText("");
		setNoteTimestamp(null);
		setEditingNoteId(null);
	};

	const handleDeleteNote = async (id: string) => {
		const updated = notes.filter((n) => n.id !== id);
		setNotes(updated);
		await saveNotesForFile(filePath, updated);
	};

	const handleEditNote = (note: Note) => {
		setNoteTimestamp(note.timestamp);
		setNoteText(note.text);
		setEditingNoteId(note.id);
		setNoteModalVisible(true);
	};

	const handleCancelNote = () => {
		setNoteModalVisible(false);
		setNoteText("");
		setNoteTimestamp(null);
		setEditingNoteId(null);
	};

	const handleNotePress = async (note: Note) => {
		// Save current position before jumping to note
		const currentTime = audioPlayerRef.current?.getCurrentTime() ?? 0;
		if (currentTime > 0) {
			setPreviousPosition(currentTime);
			setShowReturnButton(true);
		}
		// Seek to the note's timestamp and start playing if not already playing
		await audioPlayerRef.current?.seekToTimestamp(note.timestamp, true);
	};

	const handleReturnToPreviousPosition = async () => {
		if (previousPosition !== null) {
			await audioPlayerRef.current?.seekToTimestamp(previousPosition, true);
			setShowReturnButton(false);
			setPreviousPosition(null);
		}
	};

	const renderNoteItem = ({ item }: { item: Note }) => (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={() => handleNotePress(item)}
		>
			<Card variant="outlined" style={playerScreenStyles.noteCard}>
				<View style={playerScreenStyles.noteHeader}>
					<View style={playerScreenStyles.timestampBadge}>
						<Ionicons name="time-outline" size={12} color={colors.primary} />
						<Typography variant="caption" color="accent" style={playerScreenStyles.timestampText}>
							{formatTime(item.timestamp)}
						</Typography>
					</View>
					<View style={playerScreenStyles.noteActions}>
						<TouchableOpacity
							style={playerScreenStyles.noteActionBtn}
							onPress={() => handleEditNote(item)}
						>
							<Ionicons name="create-outline" size={16} color={colors.textSecondary} />
						</TouchableOpacity>
						<TouchableOpacity
							style={playerScreenStyles.noteActionBtn}
							onPress={() => handleDeleteNote(item.id)}
						>
							<Ionicons name="trash-outline" size={16} color={colors.error} />
						</TouchableOpacity>
					</View>
				</View>
				<Typography variant="body" style={playerScreenStyles.noteText}>
					{item.text}
				</Typography>
				<Typography variant="caption" color="muted" style={playerScreenStyles.noteMeta}>
					{new Date(item.createdAt).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						hour: "2-digit",
						minute: "2-digit",
					})}
				</Typography>
			</Card>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={[playerScreenStyles.container, { paddingTop: insets.top }]}>
			<StatusBar barStyle="light-content" backgroundColor={colors.background} />

			{/* Header */}
			<View style={playerScreenStyles.header}>
				<IconButton
					icon="chevron-back"
					onPress={() => navigation.goBack()}
					variant="ghost"
					size="md"
				/>
				<View style={playerScreenStyles.headerTitle}>
					<View style={playerScreenStyles.headerTitleRow}>
						<Typography variant="caption" color="muted">
							NOW PLAYING
						</Typography>
						{resumedFromPosition && (
							<View style={playerScreenStyles.resumeIndicator}>
								<Ionicons name="return-down-back" size={10} color={colors.primary} />
								<Typography variant="caption" color="accent" style={playerScreenStyles.resumeText}>
									Resumed
								</Typography>
							</View>
						)}
					</View>
					<Typography variant="body" weight="semiBold" numberOfLines={1}>
						{fileName}
					</Typography>
				</View>
				{showReturnButton ? (
					<TouchableOpacity
						onPress={handleReturnToPreviousPosition}
						style={playerScreenStyles.returnButton}
						activeOpacity={0.7}
					>
						<Ionicons name="arrow-undo" size={20} color={colors.primary} />
					</TouchableOpacity>
				) : (
					<View style={{ width: 40 }} />
				)}
			</View>

			{/* Audio Player */}
			<AudioPlayer
				ref={audioPlayerRef}
				key={filePath} // Force remount when filePath changes
				fileName={fileName}
				filePath={filePath}
				coverImageUri={coverImageUri}
				itemId={itemId}
				notes={notes}
				onAddNotePress={handleOpenNoteModal}
				onResumedFromPosition={() => setResumedFromPosition(true)}
				autoPlay={true} // Auto-start playback when track loads
			/>

			{/* Notes Section - Toggleable Drawer */}
			<Animated.View
				style={[
					playerScreenStyles.notesSection,
					{
						height: drawerY,
						maxHeight: expandedHeight,
					},
				]}
			>
				{/* Tappable Header */}
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={toggleDrawer}
					style={playerScreenStyles.notesHeaderContainer}
				>
					{/* Drag Handle Indicator */}
					<View style={playerScreenStyles.dragHandleContainer}>
						<View style={playerScreenStyles.dragHandle} />
					</View>

					<View style={playerScreenStyles.notesHeader}>
						<View style={playerScreenStyles.notesHeaderLeft}>
							<Ionicons name="document-text" size={20} color={colors.primary} />
							<Typography variant="h3" style={playerScreenStyles.notesTitle}>
								Notes
							</Typography>
						</View>
						<View style={playerScreenStyles.notesHeaderRight}>
							<Typography variant="caption" color="muted">
								{notes.length} {notes.length === 1 ? "note" : "notes"}
							</Typography>
						</View>
					</View>
				</TouchableOpacity>

				{notesLoading ? (
					<View style={playerScreenStyles.notesLoading}>
						<LoadingScreen message="Loading notes..." />
					</View>
				) : notes.length === 0 ? (
					<View style={playerScreenStyles.emptyNotes}>
						<Ionicons name="bookmark-outline" size={32} color={colors.textMuted} />
						<Typography
							variant="bodySmall"
							color="muted"
							align="center"
							style={playerScreenStyles.emptyText}
						>
							No notes yet. Tap "Add Note" while listening to save your thoughts.
						</Typography>
					</View>
				) : (
					<View style={{ flex: 1 }}>
						<FlatList
							data={notes}
							keyExtractor={(item) => item.id}
							renderItem={renderNoteItem}
							showsVerticalScrollIndicator={false}
							contentContainerStyle={playerScreenStyles.notesList}
							nestedScrollEnabled={true}
							scrollEnabled={isExpanded}
						/>
					</View>
				)}
			</Animated.View>

			{/* Note Modal */}
			<Modal
				visible={noteModalVisible}
				animationType="slide"
				transparent
				onRequestClose={handleCancelNote}
			>
				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
				>
					<View style={playerScreenStyles.modalOverlay}>
						<ScrollView
							contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
							keyboardShouldPersistTaps="handled"
							showsVerticalScrollIndicator={false}
							bounces={false}
						>
							<Card variant="elevated" style={playerScreenStyles.modalContent}>
								<View style={playerScreenStyles.modalHeader}>
									<Typography variant="h3">
										{editingNoteId ? "Edit Note" : "Add Note"}
									</Typography>
									{noteTimestamp != null && (
										<View style={playerScreenStyles.modalTimestamp}>
											<Ionicons name="time" size={14} color={colors.primary} />
											<Typography variant="bodySmall" color="accent">
												{formatTime(noteTimestamp)}
											</Typography>
										</View>
									)}
								</View>

								<Input
									value={noteText}
									onChangeText={setNoteText}
									placeholder="Write your note here..."
									multiline
									numberOfLines={4}
									style={playerScreenStyles.noteInput}
									autoFocus={true}
								/>

								<View style={playerScreenStyles.modalActions}>
									<Button title="Cancel" onPress={handleCancelNote} variant="ghost" />
									<Button title="Save" onPress={handleSaveNote} variant="primary" />
								</View>
							</Card>
						</ScrollView>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</SafeAreaView>
	);
};

export default PlayerScreen;
