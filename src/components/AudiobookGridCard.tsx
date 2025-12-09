import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, audiobookGridCardStyles } from "../theme";
import { Typography, CircularProgress } from "./ui";
import { getPlaybackState } from "../storage/playbackStorage";
import { usePlayback } from "../context/PlaybackContext";

interface AudiobookGridCardProps {
	title: string;
	timestamp: number;
	coverImageUri?: string;
	itemId: string;
	filePath: string;
	onPlay: () => void;
	onLongPress?: () => void;
}

const AudiobookGridCard: React.FC<AudiobookGridCardProps> = ({
	title,
	timestamp,
	coverImageUri,
	itemId,
	filePath,
	onPlay,
	onLongPress,
}) => {
	const [progress, setProgress] = useState(0);
	const { currentTrack, status } = usePlayback();
	const isCurrentlyPlaying = currentTrack?.filePath === filePath;

	// Update progress in real-time if this is the currently playing track
	useEffect(() => {
		if (isCurrentlyPlaying && status?.isLoaded) {
			const currentTime = status.currentTime ?? 0;
			const duration = status.duration ?? 0;
			
			if (duration > 0) {
				const calculatedProgress = currentTime / duration;
				setProgress(Math.min(1, Math.max(0, calculatedProgress)));
			} else if (currentTime > 0) {
				setProgress(0.01);
			} else {
				setProgress(0);
			}
		}
	}, [isCurrentlyPlaying, status?.currentTime, status?.duration, status?.isLoaded]);

	// Load saved progress when not currently playing
	useEffect(() => {
		if (!isCurrentlyPlaying) {
			const loadProgress = async () => {
				const state = await getPlaybackState(filePath);
				if (state && state.position > 0) {
					if (state.duration && state.duration > 0) {
						const calculatedProgress = state.position / state.duration;
						setProgress(Math.min(1, Math.max(0, calculatedProgress)));
					} else {
						// If we have position but no duration, show minimal progress (1%) to indicate it's been started
						setProgress(0.01);
					}
				} else {
					setProgress(0);
				}
			};
			loadProgress();
		}
	}, [filePath, isCurrentlyPlaying]);

	const formattedDate = new Date(timestamp).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});


	return (
		<TouchableOpacity
			style={audiobookGridCardStyles.container}
			onPress={onPlay}
			onLongPress={onLongPress}
			activeOpacity={0.85}
		>
			{/* Book cover */}
			<View style={audiobookGridCardStyles.bookCover}>
				{coverImageUri ? (
					<Image
						source={{ uri: coverImageUri }}
						style={audiobookGridCardStyles.coverImage}
						resizeMode="cover"
					/>
				) : (
					<View
						style={[audiobookGridCardStyles.coverBackground, { backgroundColor: colors.primaryMuted }]}
					>
						<Ionicons name="book" size={48} color={colors.primary} />
					</View>
				)}

				{/* Play overlay */}
				<View style={audiobookGridCardStyles.playOverlay}>
					<View style={audiobookGridCardStyles.playButton}>
						<CircularProgress progress={progress} size={40} strokeWidth={3} />
					</View>
				</View>
			</View>

			{/* Info */}
			<View style={audiobookGridCardStyles.info}>
				<Typography
					variant="bodySmall"
					weight="semiBold"
					numberOfLines={2}
					style={audiobookGridCardStyles.title}
				>
					{title}
				</Typography>
				<Typography variant="caption" color="muted" style={audiobookGridCardStyles.date}>
					{formattedDate}
				</Typography>
			</View>
		</TouchableOpacity>
	);
};

export default AudiobookGridCard;

