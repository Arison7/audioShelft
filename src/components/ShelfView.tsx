import React, { useEffect, useState, useMemo } from "react";
import { View, TouchableOpacity, Image, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows, typography } from "../theme";
import { Typography } from "./ui";
import { usePlayback } from "../context/PlaybackContext";
import { getPlaybackState } from "../storage/playbackStorage";
import { MediaItem } from "../screens/ShelfScreen";

// Generate a consistent pattern index from item ID
const getPatternIndex = (id: string): number => {
	let hash = 0;
	for (let i = 0; i < id.length; i++) {
		hash = ((hash << 5) - hash) + id.charCodeAt(i);
		hash = hash & hash;
	}
	return Math.abs(hash) % 12; // 12 different patterns
};

interface ShelfViewProps {
	items: MediaItem[];
	onPlay: (item: MediaItem) => void;
	onLongPress?: (item: MediaItem) => void;
}

const BOOKS_PER_SHELF = 3; // Number of books per shelf line

const ShelfView: React.FC<ShelfViewProps> = ({ items, onPlay, onLongPress }) => {
	// Group items into shelves
	const shelves: MediaItem[][] = [];
	for (let i = 0; i < items.length; i += BOOKS_PER_SHELF) {
		shelves.push(items.slice(i, i + BOOKS_PER_SHELF));
	}

	return (
		<View style={styles.container}>
			{shelves.map((shelf, shelfIndex) => (
				<View key={shelfIndex} style={styles.shelfContainer}>
					{/* Shelf line */}
					<View style={styles.shelfLine} />
					
					{/* Books on shelf */}
					<View style={styles.booksContainer}>
						{shelf.map((item) => (
							<ShelfBook
								key={item.id}
								item={item}
								onPlay={() => onPlay(item)}
								onLongPress={onLongPress ? () => onLongPress(item) : undefined}
							/>
						))}
					</View>
				</View>
			))}
		</View>
	);
};

interface ShelfBookProps {
	item: MediaItem;
	onPlay: () => void;
	onLongPress?: () => void;
}

const ShelfBook: React.FC<ShelfBookProps> = ({ item, onPlay, onLongPress }) => {
	const [progress, setProgress] = useState(0);
	const { currentTrack, status } = usePlayback();
	const isCurrentlyPlaying = currentTrack?.filePath === item.permanentUri;
	// Use stored patternIndex if available, otherwise generate from ID
	const patternIndex = useMemo(() => {
		if (item.patternIndex !== undefined) {
			return item.patternIndex;
		}
		return getPatternIndex(item.id);
	}, [item.id, item.patternIndex]);

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
				const state = await getPlaybackState(item.permanentUri);
				if (state && state.position > 0) {
					if (state.duration && state.duration > 0) {
						const calculatedProgress = state.position / state.duration;
						setProgress(Math.min(1, Math.max(0, calculatedProgress)));
					} else {
						setProgress(0.01);
					}
				} else {
					setProgress(0);
				}
			};
			loadProgress();
		}
	}, [item.permanentUri, isCurrentlyPlaying]);

	return (
		<TouchableOpacity
			style={styles.bookContainer}
			onPress={onPlay}
			onLongPress={onLongPress}
			activeOpacity={0.8}
		>
			{/* 3D Book Container */}
			<View style={styles.book3DContainer}>
				{/* Book spine (left side showing depth) */}
				<View style={styles.bookSpine}>
					<View style={styles.spineGradient} />
				</View>
				
				{/* Book cover (front face) */}
				<View style={styles.bookCover}>
					{item.coverImageUri ? (
						<>
							<Image
								source={{ uri: item.coverImageUri }}
								style={styles.coverImage}
								resizeMode="cover"
							/>
							{/* Title overlay on cover image */}
							<View style={styles.titleOverlay}>
								<Text
									numberOfLines={3}
									style={styles.coverTitle}
								>
									{item.name}
								</Text>
							</View>
						</>
					) : (
						<>
							{/* Vintage pattern background */}
							<BookPattern patternIndex={patternIndex} />
							{/* Title on pattern */}
							<View style={styles.patternTitleContainer}>
								<Text
									numberOfLines={3}
									style={styles.patternTitle}
								>
									{item.name}
								</Text>
							</View>
						</>
					)}
					
					{/* Progress percentage */}
					{progress > 0 && (
						<View style={styles.progressBadge}>
							<Typography variant="caption" style={styles.progressText}>
								{Math.round(progress * 100)}%
							</Typography>
						</View>
					)}
				</View>
				
				{/* Book pages (right side) */}
				<View style={styles.bookPages}>
					<View style={styles.pageLines}>
						{[...Array(5)].map((_, i) => (
							<View key={i} style={styles.pageLine} />
						))}
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
};

// Vintage book cover patterns
interface BookPatternProps {
	patternIndex: number;
}

const BookPattern: React.FC<BookPatternProps> = ({ patternIndex }) => {
	const patterns = [
		// Pattern 1: Horizontal stripes
		() => (
			<View style={styles.patternContainer}>
				{[...Array(8)].map((_, i) => (
					<View
						key={i}
						style={[
							styles.patternStripe,
							{
								height: 10,
								backgroundColor: i % 2 === 0 ? colors.primaryDark : colors.primary,
								opacity: 0.6 + (i % 2) * 0.2,
							},
						]}
					/>
				))}
			</View>
		),
		// Pattern 2: Vertical stripes
		() => (
			<View style={[styles.patternContainer, { flexDirection: "row" }]}>
				{[...Array(6)].map((_, i) => (
					<View
						key={i}
						style={[
							styles.patternStripe,
							{
								width: 8,
								backgroundColor: i % 2 === 0 ? colors.primaryDark : colors.primary,
								opacity: 0.5 + (i % 2) * 0.3,
							},
						]}
					/>
				))}
			</View>
		),
		// Pattern 3: Diagonal stripes
		() => (
			<View style={styles.patternContainer}>
				{[...Array(12)].map((_, i) => (
					<View
						key={i}
						style={[
							styles.patternDiagonal,
							{
								transform: [{ rotate: "45deg" }],
								backgroundColor: i % 2 === 0 ? colors.primaryDark : colors.primary,
								opacity: 0.4,
								left: i * 8 - 20,
							},
						]}
					/>
				))}
			</View>
		),
		// Pattern 4: Grid pattern
		() => (
			<View style={styles.patternContainer}>
				{[...Array(4)].map((_, row) =>
					[...Array(3)].map((_, col) => (
						<View
							key={`${row}-${col}`}
							style={[
								styles.patternGrid,
								{
									top: row * 20 + 5,
									left: col * 16 + 5,
									backgroundColor: (row + col) % 2 === 0 ? colors.primaryDark : colors.primary,
									opacity: 0.5,
								},
							]}
						/>
					))
				)}
			</View>
		),
		// Pattern 5: Ornate border
		() => (
			<View style={styles.patternContainer}>
				<View style={[styles.patternBorder, { borderColor: colors.primary, opacity: 0.6 }]} />
				<View style={[styles.patternBorder, styles.patternBorderInner, { borderColor: colors.primaryDark, opacity: 0.4 }]} />
				{[...Array(4)].map((_, i) => (
					<View
						key={i}
						style={[
							styles.patternCorner,
							{
								top: i < 2 ? 5 : undefined,
								bottom: i >= 2 ? 5 : undefined,
								left: i % 2 === 0 ? 5 : undefined,
								right: i % 2 === 1 ? 5 : undefined,
								borderColor: colors.primary,
								opacity: 0.5,
							},
						]}
					/>
				))}
			</View>
		),
		// Pattern 6: Dots pattern
		() => (
			<View style={styles.patternContainer}>
				{[...Array(15)].map((_, i) => {
					const row = Math.floor(i / 5);
					const col = i % 5;
					return (
						<View
							key={i}
							style={[
								styles.patternDot,
								{
									top: row * 18 + 8,
									left: col * 12 + 8,
									backgroundColor: i % 3 === 0 ? colors.primaryDark : colors.primary,
									opacity: 0.6,
								},
							]}
						/>
					);
				})}
			</View>
		),
		// Pattern 7: Leather texture (Vintage - Old Book)
		() => (
			<View style={styles.patternContainer}>
				{[...Array(20)].map((_, i) => (
					<View
						key={i}
						style={[
							styles.patternLeather,
							{
								top: (i % 5) * 16,
								left: Math.floor(i / 5) * 20,
								width: 20 - 1,
								height: 16 - 1,
								backgroundColor: i % 3 === 0 ? colors.primaryDark : (i % 2 === 0 ? colors.primary : "#8B4513"),
								opacity: 0.3 + (i % 3) * 0.2,
								borderRadius: 1,
							},
						]}
					/>
				))}
				{[...Array(8)].map((_, i) => (
					<View
						key={`line-${i}`}
						style={[
							styles.patternLeatherLine,
							{
								top: i % 2 === 0 ? 16 : 48,
								left: 0,
								width: 80,
								height: 1,
								backgroundColor: colors.primaryDark,
								opacity: 0.2,
							},
						]}
					/>
				))}
			</View>
		),
		// Pattern 8: Vintage floral (Vintage - Old Book)
		() => (
			<View style={styles.patternContainer}>
				{[...Array(6)].map((_, i) => {
					const angle = (i * 60) * (Math.PI / 180);
					const radius = 24;
					const centerX = 40;
					const centerY = 50;
					return (
						<View
							key={i}
							style={[
								styles.patternFloral,
								{
									top: centerY + Math.sin(angle) * radius - 3,
									left: centerX + Math.cos(angle) * radius - 3,
									width: 6,
									height: 6,
									backgroundColor: colors.primary,
									opacity: 0.5,
									borderRadius: 3,
								},
							]}
						/>
					);
				})}
				<View style={[styles.patternFloral, {
					top: 50 - 4,
					left: 40 - 4,
					width: 8,
					height: 8,
					backgroundColor: colors.primaryDark,
					opacity: 0.6,
					borderRadius: 4,
				}]} />
			</View>
		),
		// Pattern 9: Classic binding (Vintage - Old Book)
		() => (
			<View style={styles.patternContainer}>
				{/* Vertical binding lines */}
				{[...Array(3)].map((_, i) => (
					<View
						key={i}
						style={[
							styles.patternBinding,
							{
								left: (i + 1) * 20,
								top: 0,
								width: 2,
								height: 100,
								backgroundColor: colors.primaryDark,
								opacity: 0.4,
							},
						]}
					/>
				))}
				{/* Horizontal lines */}
				{[...Array(4)].map((_, i) => (
					<View
						key={`h-${i}`}
						style={[
							styles.patternBinding,
							{
								top: (i + 1) * 20,
								left: 0,
								width: 80,
								height: 1,
								backgroundColor: colors.primary,
								opacity: 0.3,
							},
						]}
					/>
				))}
				{/* Corner decorations */}
				{[...Array(4)].map((_, i) => (
					<View
						key={`corner-${i}`}
						style={[
							styles.patternCornerDeco,
							{
								top: i < 2 ? 2 : undefined,
								bottom: i >= 2 ? 2 : undefined,
								left: i % 2 === 0 ? 2 : undefined,
								right: i % 2 === 1 ? 2 : undefined,
								width: 4,
								height: 4,
								borderColor: colors.primary,
								opacity: 0.5,
							},
						]}
					/>
				))}
			</View>
		),
		// Pattern 10: Modern minimalist (Modern - New Book)
		() => (
			<View style={styles.patternContainer}>
				<View style={[styles.patternMinimal, {
					top: 20,
					left: 8,
					width: 64,
					height: 2,
					backgroundColor: colors.primary,
					opacity: 0.6,
				}]} />
				<View style={[styles.patternMinimal, {
					top: 50,
					left: 8,
					width: 48,
					height: 2,
					backgroundColor: colors.primaryDark,
					opacity: 0.5,
				}]} />
				<View style={[styles.patternMinimal, {
					top: 80,
					left: 8,
					width: 32,
					height: 2,
					backgroundColor: colors.primary,
					opacity: 0.4,
				}]} />
			</View>
		),
		// Pattern 11: Geometric (Modern - New Book)
		() => (
			<View style={styles.patternContainer}>
				{/* Triangles */}
				{[...Array(6)].map((_, i) => {
					const row = Math.floor(i / 3);
					const col = i % 3;
					return (
						<View
							key={i}
							style={[
								styles.patternGeometric,
								{
									top: row * 50 + 2,
									left: col * 26 + 2,
									width: 26 - 4,
									height: 50 - 4,
									borderWidth: 1,
									borderColor: colors.primary,
									opacity: 0.5,
									borderTopLeftRadius: i % 2 === 0 ? 4 : 0,
									borderTopRightRadius: i % 2 === 1 ? 4 : 0,
									borderBottomLeftRadius: i % 2 === 0 ? 4 : 0,
									borderBottomRightRadius: i % 2 === 1 ? 4 : 0,
								},
							]}
						/>
					);
				})}
			</View>
		),
		// Pattern 12: Abstract (Modern - New Book)
		() => (
			<View style={styles.patternContainer}>
				{/* Curved shapes */}
				<View style={[styles.patternAbstract, {
					top: 10,
					left: 16,
					width: 48,
					height: 30,
					backgroundColor: colors.primary,
					opacity: 0.3,
					borderRadius: 15,
				}]} />
				<View style={[styles.patternAbstract, {
					top: 40,
					left: 8,
					width: 32,
					height: 32,
					backgroundColor: colors.primaryDark,
					opacity: 0.25,
					borderRadius: 16,
				}]} />
				<View style={[styles.patternAbstract, {
					top: 60,
					left: 40,
					width: 40,
					height: 30,
					backgroundColor: colors.primary,
					opacity: 0.2,
					borderRadius: 15,
				}]} />
			</View>
		),
	];

	const PatternComponent = patterns[patternIndex] || patterns[0];
	return <PatternComponent />;
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	shelfContainer: {
		marginBottom: 40,
		position: "relative",
	},
	shelfLine: {
		position: "absolute",
		bottom: -20,
		left: 0,
		right: 0,
		height: 4,
		backgroundColor: colors.border,
		borderRadius: 2,
	},
	booksContainer: {
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "flex-end",
		gap: 12,
		paddingHorizontal: 4,
		marginBottom: 8,
	},
	bookContainer: {
		flex: 1,
		alignItems: "center",
		maxWidth: 120,
	},
	book3DContainer: {
		flexDirection: "row",
		alignItems: "flex-end",
		marginBottom: 8,
		...shadows.lg,
	},
	bookSpine: {
		width: 7,
		height: 130,
		backgroundColor: colors.surfaceHighlight,
		borderTopLeftRadius: 4,
		borderBottomLeftRadius: 4,
		overflow: "hidden",
		borderRightWidth: 1,
		borderRightColor: colors.border,
		shadowColor: "#000",
		shadowOffset: { width: -2, height: 0 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 3,
	},
	spineGradient: {
		width: "100%",
		height: "100%",
		backgroundColor: colors.primaryMuted,
		opacity: 0.4,
	},
	bookCover: {
		width: 80,
		height: 130,
		borderRadius: 4,
		overflow: "hidden",
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		position: "relative",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 4,
	},
	coverImage: {
		width: "100%",
		height: "100%",
	},
	coverBackground: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	patternContainer: {
		position: "absolute",
		width: "100%",
		height: "100%",
		backgroundColor: colors.primaryMuted,
	},
	patternStripe: {
		width: "100%",
	},
	patternDiagonal: {
		position: "absolute",
		width: 3,
		height: 120,
	},
	patternGrid: {
		position: "absolute",
		width: 12,
		height: 12,
		borderRadius: 1,
	},
	patternBorder: {
		position: "absolute",
		top: 8,
		left: 8,
		right: 8,
		bottom: 8,
		borderWidth: 2,
		borderRadius: 2,
	},
	patternBorderInner: {
		top: 12,
		left: 12,
		right: 12,
		bottom: 12,
		borderWidth: 1,
	},
	patternCorner: {
		position: "absolute",
		width: 12,
		height: 12,
		borderWidth: 2,
	},
	patternDot: {
		position: "absolute",
		width: 4,
		height: 4,
		borderRadius: 2,
	},
	patternLeather: {
		position: "absolute",
	},
	patternLeatherLine: {
		position: "absolute",
	},
	patternFloral: {
		position: "absolute",
	},
	patternBinding: {
		position: "absolute",
	},
	patternCornerDeco: {
		position: "absolute",
		borderWidth: 1,
	},
	patternMinimal: {
		position: "absolute",
	},
	patternGeometric: {
		position: "absolute",
		backgroundColor: "transparent",
	},
	patternAbstract: {
		position: "absolute",
	},
	patternTitleContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 4,
		paddingVertical: 8,
	},
	patternTitle: {
		color: colors.textPrimary,
		fontSize: 11,
		lineHeight: 13,
		textAlign: "center",
		fontFamily: typography.fontFamily.serif,
		fontWeight: "600",
		textShadowColor: "rgba(0, 0, 0, 0.5)",
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 2,
	},
	titleOverlay: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		paddingHorizontal: 6,
		paddingVertical: 4,
	},
	coverTitle: {
		color: colors.textPrimary,
		fontSize: 11,
		lineHeight: 13,
		textAlign: "center",
		fontFamily: typography.fontFamily.serif,
		fontWeight: "600",
	},
	bookPages: {
		width: 5,
		height: 130,
		backgroundColor: colors.background,
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
		overflow: "hidden",
		paddingHorizontal: 0.5,
		borderLeftWidth: 1,
		borderLeftColor: colors.border,
	},
	pageLines: {
		flex: 1,
		justifyContent: "space-evenly",
		paddingVertical: 3,
	},
	pageLine: {
		width: "100%",
		height: 0.5,
		backgroundColor: colors.textMuted,
		opacity: 0.3,
	},
	progressBadge: {
		position: "absolute",
		bottom: 3,
		right: 3,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		borderRadius: 6,
		paddingHorizontal: 4,
		paddingVertical: 2,
	},
	progressText: {
		color: colors.primary,
		fontSize: 10,
		fontWeight: "600",
	},
});

export default ShelfView;

