import React, { useEffect, useState, useRef } from "react";
import { View, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { usePlayback } from "../context/PlaybackContext";
import { colors, borderRadius, shadows, spacing } from "../theme";
import { Typography } from "./ui";
import CoverImage from "./CoverImage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MiniAudioPlayer: React.FC = () => {
	const { currentTrack, player, status } = usePlayback();
	const navigation = useNavigation<NavigationProp>();
	const route = useRoute();
	const [isVisible, setIsVisible] = useState(false);
	const slideAnim = useRef(new Animated.Value(100)).current;
	
	// Hide on Player screen
	const isOnPlayerScreen = route.name === "Player";

	useEffect(() => {
		if (currentTrack && !isOnPlayerScreen) {
			setIsVisible(true);
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 50,
				friction: 8,
			}).start();
		} else {
			Animated.spring(slideAnim, {
				toValue: 100,
				useNativeDriver: true,
				tension: 50,
				friction: 8,
			}).start(() => setIsVisible(false));
		}
	}, [currentTrack, isOnPlayerScreen, slideAnim]);

	const isLoaded = status?.isLoaded;
	const isPlaying = status?.playing;
	const currentTime = status?.currentTime ?? 0;
	const duration = status?.duration ?? 0;
	const progress = duration > 0 ? currentTime / duration : 0;

	const formatTime = (seconds: number): string => {
		const totalSeconds = Math.floor(seconds);
		const minutes = Math.floor(totalSeconds / 60);
		const secs = totalSeconds % 60;
		return `${minutes}:${secs.toString().padStart(2, "0")}`;
	};

	const handlePress = () => {
		if (currentTrack) {
			navigation.navigate("Player", {
				filePath: currentTrack.filePath,
				fileName: currentTrack.fileName,
				coverImageUri: currentTrack.coverImageUri,
				itemId: currentTrack.itemId,
			});
		}
	};

	const handlePlayPause = () => {
		if (player && status) {
			if (status.playing) {
				player.pause();
			} else {
				player.play();
			}
		}
	};

	if (!isVisible || !currentTrack) {
		return null;
	}

	return (
		<Animated.View
			style={{
				position: "absolute",
				bottom: 20,
				left: 20,
				right: 20,
				transform: [{ translateY: slideAnim }],
				zIndex: 1000,
			}}
		>
			<TouchableOpacity
				activeOpacity={0.9}
				onPress={handlePress}
				style={{
					backgroundColor: colors.surface,
					borderRadius: borderRadius.lg,
					padding: spacing.md,
					flexDirection: "row",
					alignItems: "center",
					...shadows.lg,
				}}
			>
				{/* Cover Image */}
				{currentTrack.itemId && currentTrack.coverImageUri ? (
					<CoverImage
						uri={currentTrack.coverImageUri}
						itemId={currentTrack.itemId}
						size={56}
						style={{ marginRight: spacing.md }}
					/>
				) : (
					<View
						style={{
							width: 56,
							height: 56,
							borderRadius: borderRadius.base,
							overflow: "hidden",
							marginRight: spacing.md,
							backgroundColor: colors.primaryMuted,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Ionicons name="book" size={28} color={colors.primary} />
					</View>
				)}

				{/* Track Info */}
				<View style={{ flex: 1, marginRight: spacing.sm }}>
					<Typography variant="body" weight="semiBold" numberOfLines={1}>
						{currentTrack.fileName}
					</Typography>
					<View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
						<Typography variant="caption" color="muted">
							{formatTime(currentTime)} / {formatTime(duration)}
						</Typography>
					</View>
					{/* Progress Bar */}
					<View
						style={{
							height: 2,
							backgroundColor: colors.border,
							borderRadius: 1,
							marginTop: spacing.xs,
							overflow: "hidden",
						}}
					>
						<View
							style={{
								height: "100%",
								width: `${progress * 100}%`,
								backgroundColor: colors.primary,
							}}
						/>
					</View>
				</View>

				{/* Play/Pause Button */}
				<TouchableOpacity
					onPress={(e) => {
						e.stopPropagation();
						handlePlayPause();
					}}
					disabled={!isLoaded}
					style={{
						width: 44,
						height: 44,
						borderRadius: 22,
						backgroundColor: colors.primary,
						alignItems: "center",
						justifyContent: "center",
						marginLeft: spacing.sm,
					}}
				>
					{!isLoaded ? (
						<View
							style={{
								width: 8,
								height: 8,
								borderRadius: 4,
								backgroundColor: colors.textOnPrimary,
							}}
						/>
					) : (
						<Ionicons
							name={isPlaying ? "pause" : "play"}
							size={20}
							color={colors.textOnPrimary}
							style={!isPlaying ? { marginLeft: 2 } : undefined}
						/>
					)}
				</TouchableOpacity>
			</TouchableOpacity>
		</Animated.View>
	);
};

export default MiniAudioPlayer;

