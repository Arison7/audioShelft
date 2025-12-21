import React from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { colors, spacing, borderRadius } from "../theme";
import Typography from "./ui/Typography";

interface PatternSelectorProps {
	selectedIndex: number;
	onSelect: (index: number) => void;
}

const PATTERN_NAMES = [
	"Horizontal Stripes",
	"Vertical Stripes",
	"Diagonal Stripes",
	"Grid",
	"Ornate Border",
	"Dots",
	"Leather Texture", // Vintage
	"Vintage Floral", // Vintage
	"Classic Binding", // Vintage
	"Modern Minimalist", // Modern
	"Geometric", // Modern
	"Abstract", // Modern
];

const PatternSelector: React.FC<PatternSelectorProps> = ({ selectedIndex, onSelect }) => {
	const renderPatternPreview = (patternIndex: number, size: number = 40) => {
		const patterns = [
			// Pattern 1: Horizontal stripes
			() => (
				<View style={[previewStyles.patternContainer, { width: size, height: size }]}>
					{[...Array(4)].map((_, i) => (
						<View
							key={i}
							style={[
								previewStyles.patternStripe,
								{
									height: size / 4,
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
				<View style={[previewStyles.patternContainer, { width: size, height: size, flexDirection: "row" }]}>
					{[...Array(4)].map((_, i) => (
						<View
							key={i}
							style={[
								previewStyles.patternStripe,
								{
									width: size / 4,
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
				<View style={[previewStyles.patternContainer, { width: size, height: size }]}>
					{[...Array(6)].map((_, i) => (
						<View
							key={i}
							style={[
								previewStyles.patternDiagonal,
								{
									transform: [{ rotate: "45deg" }],
									backgroundColor: i % 2 === 0 ? colors.primaryDark : colors.primary,
									opacity: 0.4,
									left: i * 6 - 10,
									width: 2,
									height: size * 1.5,
								},
							]}
						/>
					))}
				</View>
			),
			// Pattern 4: Grid pattern
			() => (
				<View style={[previewStyles.patternContainer, { width: size, height: size }]}>
					{[...Array(3)].map((_, row) =>
						[...Array(2)].map((_, col) => (
							<View
								key={`${row}-${col}`}
								style={[
									previewStyles.patternGrid,
									{
										top: row * (size / 3) + 2,
										left: col * (size / 2) + 2,
										width: size / 2 - 4,
										height: size / 3 - 4,
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
				<View style={[previewStyles.patternContainer, { width: size, height: size }]}>
					<View style={[previewStyles.patternBorder, { borderColor: colors.primary, opacity: 0.6, top: 4, left: 4, right: 4, bottom: 4 }]} />
					<View style={[previewStyles.patternBorder, previewStyles.patternBorderInner, { borderColor: colors.primaryDark, opacity: 0.4, top: 6, left: 6, right: 6, bottom: 6 }]} />
				</View>
			),
			// Pattern 6: Dots pattern
			() => (
				<View style={[previewStyles.patternContainer, { width: size, height: size }]}>
					{[...Array(9)].map((_, i) => {
						const row = Math.floor(i / 3);
						const col = i % 3;
						return (
							<View
								key={i}
								style={[
									previewStyles.patternDot,
									{
										top: row * (size / 3) + size / 6 - 2,
										left: col * (size / 3) + size / 6 - 2,
										width: 4,
										height: 4,
										backgroundColor: i % 3 === 0 ? colors.primaryDark : colors.primary,
										opacity: 0.6,
									},
								]}
							/>
						);
					})}
				</View>
			),
			// Pattern 7: Leather texture (Vintage)
			() => (
				<View style={[previewStyles.patternContainer, { width: size, height: size }]}>
					{[...Array(20)].map((_, i) => (
						<View
							key={i}
							style={[
								previewStyles.patternLeather,
								{
									top: (i % 5) * (size / 5),
									left: Math.floor(i / 5) * (size / 4),
									width: size / 4 - 1,
									height: size / 5 - 1,
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
								previewStyles.patternLeatherLine,
								{
									top: i % 2 === 0 ? size * 0.2 : size * 0.6,
									left: 0,
									width: size,
									height: 1,
									backgroundColor: colors.primaryDark,
									opacity: 0.2,
								},
							]}
						/>
					))}
				</View>
			),
			// Pattern 8: Vintage floral (Vintage)
			() => (
				<View style={[previewStyles.patternContainer, { width: size, height: size }]}>
					{[...Array(6)].map((_, i) => {
						const angle = (i * 60) * (Math.PI / 180);
						const radius = size * 0.3;
						const centerX = size / 2;
						const centerY = size / 2;
						return (
							<View
								key={i}
								style={[
									previewStyles.patternFloral,
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
					<View style={[previewStyles.patternFloral, {
						top: size / 2 - 4,
						left: size / 2 - 4,
						width: 8,
						height: 8,
						backgroundColor: colors.primaryDark,
						opacity: 0.6,
						borderRadius: 4,
					}]} />
				</View>
			),
			// Pattern 9: Classic binding (Vintage)
			() => (
				<View style={[previewStyles.patternContainer, { width: size, height: size }]}>
					{/* Vertical binding lines */}
					{[...Array(3)].map((_, i) => (
						<View
							key={i}
							style={[
								previewStyles.patternBinding,
								{
									left: (i + 1) * (size / 4),
									top: 0,
									width: 2,
									height: size,
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
								previewStyles.patternBinding,
								{
									top: (i + 1) * (size / 5),
									left: 0,
									width: size,
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
								previewStyles.patternCornerDeco,
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
			// Pattern 10: Modern minimalist (Modern)
			() => (
				<View style={[previewStyles.patternContainer, { width: size, height: size }]}>
					<View style={[previewStyles.patternMinimal, {
						top: size * 0.2,
						left: size * 0.1,
						width: size * 0.8,
						height: 2,
						backgroundColor: colors.primary,
						opacity: 0.6,
					}]} />
					<View style={[previewStyles.patternMinimal, {
						top: size * 0.5,
						left: size * 0.1,
						width: size * 0.6,
						height: 2,
						backgroundColor: colors.primaryDark,
						opacity: 0.5,
					}]} />
					<View style={[previewStyles.patternMinimal, {
						top: size * 0.8,
						left: size * 0.1,
						width: size * 0.4,
						height: 2,
						backgroundColor: colors.primary,
						opacity: 0.4,
					}]} />
				</View>
			),
			// Pattern 11: Geometric (Modern)
			() => (
				<View style={[previewStyles.patternContainer, { width: size, height: size }]}>
					{/* Triangles */}
					{[...Array(6)].map((_, i) => {
						const row = Math.floor(i / 3);
						const col = i % 3;
						return (
							<View
								key={i}
								style={[
									previewStyles.patternGeometric,
									{
										top: row * (size / 2) + 2,
										left: col * (size / 3) + 2,
										width: size / 3 - 4,
										height: size / 2 - 4,
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
			// Pattern 12: Abstract (Modern)
			() => (
				<View style={[previewStyles.patternContainer, { width: size, height: size }]}>
					{/* Curved shapes */}
					<View style={[previewStyles.patternAbstract, {
						top: size * 0.1,
						left: size * 0.2,
						width: size * 0.6,
						height: size * 0.3,
						backgroundColor: colors.primary,
						opacity: 0.3,
						borderRadius: size * 0.15,
					}]} />
					<View style={[previewStyles.patternAbstract, {
						top: size * 0.4,
						left: size * 0.1,
						width: size * 0.4,
						height: size * 0.4,
						backgroundColor: colors.primaryDark,
						opacity: 0.25,
						borderRadius: size * 0.2,
					}]} />
					<View style={[previewStyles.patternAbstract, {
						top: size * 0.6,
						left: size * 0.5,
						width: size * 0.5,
						height: size * 0.3,
						backgroundColor: colors.primary,
						opacity: 0.2,
						borderRadius: size * 0.15,
					}]} />
				</View>
			),
		];

		const PatternComponent = patterns[patternIndex] || patterns[0];
		return <PatternComponent />;
	};

	return (
		<View style={selectorStyles.container}>
			<Typography variant="caption" color="secondary" style={selectorStyles.label}>
				Book Cover Pattern
			</Typography>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={selectorStyles.patternsScroll}
			>
				{PATTERN_NAMES.map((name, index) => (
					<TouchableOpacity
						key={index}
						style={[
							selectorStyles.patternOption,
							selectedIndex === index && selectorStyles.patternOptionSelected,
						]}
						onPress={() => onSelect(index)}
						activeOpacity={0.7}
					>
						<View style={[
							selectorStyles.patternPreview,
							selectedIndex === index && selectorStyles.patternPreviewSelected,
						]}>
							{renderPatternPreview(index, 50)}
						</View>
						<Typography
							variant="caption"
							style={[
								selectorStyles.patternName,
								selectedIndex === index && selectorStyles.patternNameSelected,
							]}
							numberOfLines={2}
						>
							{name}
						</Typography>
					</TouchableOpacity>
				))}
			</ScrollView>
		</View>
	);
};

const selectorStyles = StyleSheet.create({
	container: {
		marginBottom: spacing.lg,
	},
	label: {
		marginBottom: spacing.sm,
	},
	patternsScroll: {
		flexDirection: "row",
		paddingVertical: spacing.xs,
		paddingRight: spacing.md,
		gap: spacing.md,
	},
	patternOption: {
		alignItems: "center",
		width: 70,
		padding: spacing.xs,
		flexShrink: 0,
	},
	patternOptionSelected: {
		backgroundColor: colors.primaryMuted,
		borderRadius: borderRadius.md,
	},
	patternPreview: {
		width: 50,
		height: 70,
		borderRadius: borderRadius.sm,
		overflow: "hidden",
		backgroundColor: colors.primaryMuted,
		borderWidth: 2,
		borderColor: colors.border,
		marginBottom: spacing.xs,
	},
	patternPreviewSelected: {
		borderColor: colors.primary,
		borderWidth: 3,
	},
	patternName: {
		fontSize: 9,
		textAlign: "center",
		color: colors.textSecondary,
		width: 65,
	},
	patternNameSelected: {
		color: colors.primary,
		fontWeight: "600",
	},
});

const previewStyles = StyleSheet.create({
	patternContainer: {
		position: "absolute",
		width: "100%",
		height: "100%",
	},
	patternStripe: {
		width: "100%",
	},
	patternDiagonal: {
		position: "absolute",
	},
	patternGrid: {
		position: "absolute",
		borderRadius: 1,
	},
	patternBorder: {
		position: "absolute",
		borderWidth: 1,
		borderRadius: 2,
	},
	patternBorderInner: {
		borderWidth: 1,
	},
	patternDot: {
		position: "absolute",
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
});

export default PatternSelector;

