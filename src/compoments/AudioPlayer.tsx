import React, { useEffect, useMemo, useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Theme & Components
import { colors, audioPlayerStyles } from "../theme";
import { Typography, Slider, Button } from "../components/ui";

// Storage
import { savePlaybackPosition, getPlaybackPosition } from "../storage/playbackStorage";
import { Note } from "../storage/notesStorage";

// Context
import { usePlayback } from "../context/PlaybackContext";

export interface AudioPlayerRef {
	seekToTimestamp: (timestamp: number, shouldPlay?: boolean) => Promise<void>;
	getCurrentTime: () => number;
}

interface AudioPlayerProps {
	fileName: string;
	filePath: string;
	coverImageUri?: string;
	itemId?: string;
	notes?: Note[];
	onAddNotePress?: (currentTime: number) => void;
	onResumedFromPosition?: () => void;
	autoPlay?: boolean; // Auto-start playback when track loads
}

const formatTime = (seconds: number): string => {
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

const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(({
	fileName,
	filePath,
	coverImageUri,
	itemId,
	notes = [],
	onAddNotePress,
	onResumedFromPosition,
	autoPlay = false,
}, ref) => {
	const { player, status, currentTrack } = usePlayback();
	const [hasResumed, setHasResumed] = useState(false);
	const [positionLoaded, setPositionLoaded] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [draggedProgress, setDraggedProgress] = useState(0);
	const [expectedTime, setExpectedTime] = useState<number | null>(null);
	const previousFilePathRef = useRef<string | null>(null);
	const currentPositionRef = useRef<number>(0);
	const statusRef = useRef<any>(null);
	const playerRef = useRef<any>(null);
	const filePathRef = useRef<string>(filePath);

	// Update refs when player/status change
	useEffect(() => {
		if (player) {
			playerRef.current = player;
		}
	}, [player]);

	useEffect(() => {
		if (status) {
			statusRef.current = status;
		}
	}, [status]);

	// Reset state when filePath changes and save previous file's position
	useEffect(() => {
		// Save previous file's position before switching
		const prevPath = previousFilePathRef.current;
		// Get the latest position from status if available, otherwise use ref
		const currentStatus = statusRef.current;
		const prevPos = currentStatus?.currentTime ?? currentPositionRef.current;
		
		if (prevPath && prevPath !== filePath && prevPos > 0) {
			// Final save of previous file's position
			const prevStatus = statusRef.current;
			const prevDuration = prevStatus?.duration && prevStatus.duration > 0 
				? prevStatus.duration 
				: undefined;
			console.log("Saving previous file position:", prevPath, prevPos, "duration:", prevDuration);
			savePlaybackPosition(prevPath, prevPos, prevDuration).catch(error => {
				console.error("Failed to save previous file position:", error);
			});
		}

		// Reset state for new file
		setPositionLoaded(false);
		setHasResumed(false);
		setIsDragging(false);
		setExpectedTime(null);
		setDraggedProgress(0);
		previousFilePathRef.current = filePath;
		currentPositionRef.current = 0;

		// Cleanup: save position when component unmounts
		return () => {
			const finalStatus = statusRef.current;
			const finalPos = finalStatus?.currentTime ?? currentPositionRef.current;
			const finalDuration = finalStatus?.duration && finalStatus.duration > 0 
				? finalStatus.duration 
				: undefined;
			if (filePath && finalPos > 0) {
				console.log("Saving on unmount:", filePath, finalPos, "duration:", finalDuration);
				savePlaybackPosition(filePath, finalPos, finalDuration).catch(error => {
					console.error("Failed to save on unmount:", error);
				});
			}
		};
	}, [filePath]);

	const isLoaded = status?.isLoaded;
	const isPlaying = status?.playing;
	const currentTime = status?.currentTime ?? 0;
	const duration = status?.duration ?? 0;
	
	// Keep refs up to date for use in callbacks
	useEffect(() => {
		statusRef.current = status;
		playerRef.current = player;
		filePathRef.current = filePath;
	}, [status, player, filePath]);
	
	// Note: Position reset/loading is handled in the position loading effect below
	// We don't reset here to avoid interfering with saved position loading
	
	// Calculate progress - use draggedProgress while dragging or if we're waiting for status to update after seek
	// Don't use currentTime until position is loaded (to avoid showing old position from previous file)
	const shouldUseDraggedValue = isDragging || (expectedTime !== null && Math.abs(currentTime - expectedTime) > 0.5);
	const effectiveTime = (!positionLoaded) ? 0 : (shouldUseDraggedValue ? (isDragging ? draggedProgress * duration : (expectedTime ?? draggedProgress * duration)) : currentTime);
	const progress = duration > 0 ? effectiveTime / duration : 0;

	// Load saved position when audio loads
	// Only load saved position if this is a NEW file (not just navigating to Player screen)
	useEffect(() => {
		if (isLoaded && !positionLoaded && playerRef.current) {
			const loadPosition = async () => {
				try {
					const currentPlayer = playerRef.current;
					const currentFilePath = filePathRef.current;
					
					if (!currentPlayer || currentFilePath !== filePath) {
						// File changed while loading, abort
						console.log("File changed during load, aborting position load");
						return;
					}
					
					// Wait a moment for the player to stabilize after loading
					await new Promise(resolve => setTimeout(resolve, 100));
					
					// Check if this is the same file that's already playing (just navigating to Player screen)
					// Only skip saved position loading if:
					// 1. Context track matches this file
					// 2. Player is already loaded and playing
					// 3. Current playback time is meaningful (> 1 second, to avoid 0 or near-0 positions)
					const isSameFileAsContext = currentTrack?.filePath === filePath;
					const currentStatus = statusRef.current;
					const currentPlaybackTime = currentStatus?.currentTime ?? 0;
					const isAlreadyPlaying = currentStatus?.playing ?? false;
					
					// If it's the same file and already playing with meaningful position, use current position
					// BUT: If currentPlaybackTime is 0 or very small, it means the player just loaded
					// and we should load the saved position instead
					if (isSameFileAsContext && isAlreadyPlaying && currentPlaybackTime > 1) {
						console.log("Same file already playing, using current position:", currentPlaybackTime);
						currentPositionRef.current = currentPlaybackTime;
						setPositionLoaded(true);
						return;
					}
					
					// Always check for saved position if:
					// - It's a different file, OR
					// - It's the same file but not playing yet, OR
					// - It's the same file but position is 0 (just loaded)
					const savedPosition = await getPlaybackPosition(filePath);
					console.log("Loading saved position for", filePath, ":", savedPosition, "duration:", duration, "currentTime:", currentPlaybackTime);
					
					if (savedPosition > 0 && savedPosition < duration && filePathRef.current === filePath) {
						// Load saved position directly (don't reset to 0 first)
						console.log("Seeking to saved position:", savedPosition);
						await currentPlayer.seekTo(savedPosition);
						currentPositionRef.current = savedPosition;
						setHasResumed(true); // Mark that we resumed from saved position
						onResumedFromPosition?.();
						
						// Auto-play if requested (e.g., when selecting from homepage)
						// Check current status to see if already playing
						const currentStatus = statusRef.current;
						if (autoPlay && currentStatus && !currentStatus.playing) {
							console.log("Auto-playing from saved position");
							await currentPlayer.play();
						}
					} else {
						// No saved position, start from 0
						console.log("No saved position, starting from 0");
						await currentPlayer.seekTo(0);
						currentPositionRef.current = 0;
						
						// Auto-play if requested (e.g., when selecting from homepage)
						// Check current status to see if already playing
						const currentStatus = statusRef.current;
						if (autoPlay && currentStatus && !currentStatus.playing) {
							console.log("Auto-playing from start");
							await currentPlayer.play();
						}
					}
					setPositionLoaded(true);
				} catch (error) {
					console.error("Failed to load playback position:", error);
					// On error, ensure we're at 0
					if (playerRef.current && filePathRef.current === filePath) {
						try {
							await playerRef.current.seekTo(0);
							currentPositionRef.current = 0;
						} catch (seekError) {
							console.error("Failed to reset to 0:", seekError);
						}
					}
					setPositionLoaded(true);
				}
			};
			loadPosition();
		}
	}, [isLoaded, positionLoaded, filePath, duration, currentTrack, status]);

	// Track current position in ref continuously (for saving)
	// Don't update while dragging to prevent conflicts
	useEffect(() => {
		if (isLoaded && positionLoaded && currentTime > 0 && !isDragging && expectedTime === null) {
			currentPositionRef.current = currentTime;
		}
	}, [currentTime, isLoaded, positionLoaded, isDragging, expectedTime]);
	
	// Clear expectedTime once status catches up after seeking
	useEffect(() => {
		if (expectedTime !== null && Math.abs(currentTime - expectedTime) < 0.5) {
			setExpectedTime(null);
		}
	}, [currentTime, expectedTime]);

	// Save position continuously every 3 seconds
	// This effect only runs when filePath changes, keeping the interval stable
	useEffect(() => {
		if (!isLoaded || !positionLoaded) return;

		let saveInterval: NodeJS.Timeout | null = null;

		const savePosition = async () => {
			// Get current values from refs to avoid stale closures
			const currentStatus = statusRef.current;
			const currentFilePath = filePathRef.current;
			
			// Always get the latest position from status, fallback to ref
			const timeToSave = currentStatus?.currentTime ?? currentPositionRef.current;
			const durationToSave = currentStatus?.duration && currentStatus.duration > 0 
				? currentStatus.duration 
				: undefined;
			
			if (timeToSave > 0 && currentFilePath && currentFilePath === filePath) {
				currentPositionRef.current = timeToSave;
				try {
					await savePlaybackPosition(currentFilePath, timeToSave, durationToSave);
					console.log("Saved position:", currentFilePath, timeToSave, "duration:", durationToSave);
				} catch (error) {
					console.error("Failed to save playback position:", error);
				}
			}
		};

		// Start saving interval - save every 3 seconds
		saveInterval = setInterval(savePosition, 3000);
		
		// Also save immediately when this effect runs
		savePosition();

		return () => {
			if (saveInterval) {
				clearInterval(saveInterval);
			}
			// Final save on cleanup
			const finalStatus = statusRef.current;
			const finalFilePath = filePathRef.current;
			const finalPosition = currentPositionRef.current;
			const finalDuration = finalStatus?.duration && finalStatus.duration > 0 
				? finalStatus.duration 
				: undefined;
			if (finalPosition > 0 && finalFilePath) {
				savePlaybackPosition(finalFilePath, finalPosition, finalDuration).catch(error => {
					console.error("Failed to save final playback position:", error);
				});
			}
		};
	}, [isLoaded, positionLoaded, filePath]); // Only restart when filePath changes

	// Also save when pausing
	useEffect(() => {
		if (isLoaded && positionLoaded && !isPlaying && hasResumed && currentTime > 0 && filePath) {
			currentPositionRef.current = currentTime;
			const currentStatus = statusRef.current;
			const currentDuration = currentStatus?.duration && currentStatus.duration > 0 
				? currentStatus.duration 
				: undefined;
			savePlaybackPosition(filePath, currentTime, currentDuration).catch(error => {
				console.error("Failed to save playback position on pause:", error);
			});
		}
	}, [isPlaying, isLoaded, positionLoaded, hasResumed, currentTime, filePath]);

	const handleSeek = async (direction: "forward" | "backward") => {
		const currentStatus = statusRef.current;
		const currentPlayer = playerRef.current;
		const currentIsLoaded = currentStatus?.isLoaded ?? false;
		const currentDuration = currentStatus?.duration ?? 0;
		const currentTimeValue = currentStatus?.currentTime ?? 0;
		
		if (!currentIsLoaded || currentDuration === 0 || !currentPlayer) return;
		const seekAmount = 15; // seconds
		const newTime =
			direction === "forward"
				? Math.min(currentTimeValue + seekAmount, currentDuration)
				: Math.max(currentTimeValue - seekAmount, 0);
		try {
			await currentPlayer.seekTo(newTime);
			currentPositionRef.current = newTime;
			
			// Save position after seeking
			const currentFilePath = filePathRef.current;
			const currentStatus = statusRef.current;
			const currentDuration = currentStatus?.duration && currentStatus.duration > 0 
				? currentStatus.duration 
				: undefined;
			if (currentFilePath) {
				savePlaybackPosition(currentFilePath, newTime, currentDuration).catch(error => {
					console.error("Failed to save position after seek:", error);
				});
			}
		} catch (error) {
			console.error("Failed to seek:", error);
		}
	};

	const handleSliderChange = (value: number) => {
		console.log("handleSliderChange", value);

		// Only update visual position during dragging, don't seek yet
		if (!isDragging) {
			setIsDragging(true);
		}
		setDraggedProgress(Math.max(0, Math.min(1, value)));
	};

	const handleSliderComplete = async (value: number) => {
		// Get current status and player from refs to avoid closure issues
		const currentStatus = statusRef.current;
		const currentPlayer = playerRef.current;
		const currentIsLoaded = currentStatus?.isLoaded ?? false;
		const currentDuration = currentStatus?.duration ?? 0;
		const currentTimeValue = currentStatus?.currentTime ?? 0;
		
		console.log("handleSliderComplete called", { 
			value, 
			isLoaded: currentIsLoaded, 
			duration: currentDuration, 
			currentTime: currentTimeValue 
		});

		if (!currentIsLoaded || !currentPlayer) {
			console.warn("handleSliderComplete: Audio not loaded yet or player not available");
			setIsDragging(false);
			setExpectedTime(null);
			return;
		}

		if (currentDuration === 0 || !isFinite(currentDuration)) {
			console.warn("handleSliderComplete: Invalid duration", currentDuration);
			setIsDragging(false);
			setExpectedTime(null);
			return;
		}

		const clampedValue = Math.max(0, Math.min(1, value));
		const newTime = clampedValue * currentDuration;
		
		console.log("handleSliderComplete: Seeking to", { clampedValue, newTime, duration: currentDuration });

		try {
			await currentPlayer.seekTo(newTime);
			console.log("handleSliderComplete: Seek successful", newTime);
			
			currentPositionRef.current = newTime;
			setExpectedTime(newTime); // Track expected position
			
			// Save position after seeking
			const currentFilePath = filePathRef.current;
			const currentStatus = statusRef.current;
			const currentDuration = currentStatus?.duration && currentStatus.duration > 0 
				? currentStatus.duration 
				: undefined;
			if (currentFilePath) {
				savePlaybackPosition(currentFilePath, newTime, currentDuration).catch(error => {
					console.error("Failed to save position after seek:", error);
				});
			}
			
			// Reset dragging state - expectedTime will keep the slider in place until status updates
			setIsDragging(false);
		} catch (error) {
			console.error("handleSliderComplete: Failed to seek:", error);
			setIsDragging(false);
			setExpectedTime(null);
		}
	};

	// Expose seekToTimestamp method via ref
	useImperativeHandle(ref, () => ({
		seekToTimestamp: async (timestamp: number, shouldPlay: boolean = false) => {
			const currentStatus = statusRef.current;
			const currentPlayer = playerRef.current;
			const currentIsLoaded = currentStatus?.isLoaded ?? false;
			const currentDuration = currentStatus?.duration ?? 0;

			if (!currentIsLoaded || !currentPlayer) {
				console.warn("seekToTimestamp: Audio not loaded yet or player not available");
				return;
			}

			if (currentDuration === 0 || !isFinite(currentDuration)) {
				console.warn("seekToTimestamp: Invalid duration", currentDuration);
				return;
			}

			// Clamp timestamp to valid range
			const clampedTimestamp = Math.max(0, Math.min(timestamp, currentDuration));

			try {
				await currentPlayer.seekTo(clampedTimestamp);
				currentPositionRef.current = clampedTimestamp;
				setExpectedTime(clampedTimestamp);

				// Save position after seeking
				const currentFilePath = filePathRef.current;
				const currentStatus = statusRef.current;
				const currentDuration = currentStatus?.duration && currentStatus.duration > 0 
					? currentStatus.duration 
					: undefined;
				if (currentFilePath) {
					savePlaybackPosition(currentFilePath, clampedTimestamp, currentDuration).catch(error => {
						console.error("Failed to save position after seek:", error);
					});
				}

				// Start playback if requested and not already playing
				if (shouldPlay && !currentStatus?.playing) {
					await currentPlayer.play();
				}
			} catch (error) {
				console.error("seekToTimestamp: Failed to seek:", error);
			}
		},
		getCurrentTime: () => {
			return currentPositionRef.current;
		},
	}), []);

	return (
		<View style={audioPlayerStyles.container}>
			{/* Album Art / Visualization */}
			<View style={audioPlayerStyles.artworkContainer}>
				<View style={audioPlayerStyles.artwork}>
					{coverImageUri ? (
						<Image
							source={{ uri: coverImageUri }}
							style={audioPlayerStyles.artworkImage}
							resizeMode="cover"
						/>
					) : (
						<View style={[audioPlayerStyles.artworkInner, { backgroundColor: colors.primary }]}>
							<Ionicons
								name={isPlaying ? "musical-notes" : "book"}
								size={64}
								color={colors.background}
							/>
						</View>
					)}
				</View>
				{isPlaying && <View style={audioPlayerStyles.playingGlow} />}
			</View>

			{/* Progress Section */}
			<View style={audioPlayerStyles.progressSection}>
				<Slider
					value={progress}
					onValueChange={handleSliderChange}
					onSlidingComplete={handleSliderComplete}
					notes={notes}
					duration={duration}
				/>

				<View style={audioPlayerStyles.timeRow}>
					<Typography variant="caption" color="muted">
						{formatTime(effectiveTime)}
					</Typography>
					<Typography variant="caption" color="muted">
						-{formatTime(Math.max(duration - effectiveTime, 0))}
					</Typography>
				</View>
			</View>

			{/* Playback Controls */}
			<View style={audioPlayerStyles.controls}>
				{/* Skip Backward */}
				<TouchableOpacity
					style={audioPlayerStyles.seekButton}
					onPress={() => handleSeek("backward")}
					disabled={!isLoaded}
				>
					<Ionicons
						name="play-back"
						size={28}
						color={isLoaded ? colors.textSecondary : colors.textMuted}
					/>
					<Typography variant="caption" color="muted" style={audioPlayerStyles.seekLabel}>
						15
					</Typography>
				</TouchableOpacity>

				{/* Play/Pause */}
				<TouchableOpacity
					style={[audioPlayerStyles.playButton, isPlaying && audioPlayerStyles.playButtonActive]}
					onPress={() => {
						const currentPlayer = playerRef.current;
						const currentStatus = statusRef.current;
						if (currentPlayer && currentStatus) {
							if (currentStatus.playing) {
								currentPlayer.pause();
							} else {
								currentPlayer.play();
							}
						}
					}}
					disabled={!isLoaded}
					activeOpacity={0.85}
				>
					{!isLoaded ? (
						<View style={audioPlayerStyles.loadingDot} />
					) : (
						<Ionicons
							name={isPlaying ? "pause" : "play"}
							size={36}
							color={colors.textOnPrimary}
							style={!isPlaying && audioPlayerStyles.playIcon}
						/>
					)}
				</TouchableOpacity>

				{/* Skip Forward */}
				<TouchableOpacity
					style={audioPlayerStyles.seekButton}
					onPress={() => handleSeek("forward")}
					disabled={!isLoaded}
				>
					<Ionicons
						name="play-forward"
						size={28}
						color={isLoaded ? colors.textSecondary : colors.textMuted}
					/>
					<Typography variant="caption" color="muted" style={audioPlayerStyles.seekLabel}>
						15
					</Typography>
				</TouchableOpacity>
			</View>

			{/* Status */}
			<Typography variant="caption" color="muted" align="center" style={audioPlayerStyles.status}>
				{!isLoaded ? "Loading audio..." : isPlaying ? "Playing" : positionLoaded && currentTime > 0 ? "Paused • Resume from here" : "Paused"}
			</Typography>

			{/* Add Note Button */}
			{onAddNotePress && (
				<View style={audioPlayerStyles.noteButtonContainer}>
					<Button
						title="Add Note"
						onPress={() => onAddNotePress(currentTime)}
						variant="secondary"
						size="md"
						disabled={!isLoaded}
						icon={
							<Ionicons
								name="bookmark-outline"
								size={18}
								color={isLoaded ? colors.textPrimary : colors.textMuted}
							/>
						}
					/>
				</View>
			)}
		</View>
	);
});

AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;
