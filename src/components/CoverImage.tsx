import React from "react";
import { View, Image, ImageStyle, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, borderRadius, coverImageStyles } from "../theme";

interface CoverImageProps {
	uri?: string;
	itemId: string;
	size?: number;
	style?: ViewStyle;
	imageStyle?: ImageStyle;
}

const CoverImage: React.FC<CoverImageProps> = ({
	uri,
	itemId,
	size = 52,
	style,
	imageStyle,
}) => {
	if (uri) {
		return (
			<View
				style={[
					coverImageStyles.container,
					{ width: size, height: size, borderRadius: borderRadius.sm },
					style,
				]}
			>
				<Image
					source={{ uri }}
					style={[
						coverImageStyles.image,
						{ width: size, height: size, borderRadius: borderRadius.sm },
						imageStyle,
					]}
					resizeMode="cover"
				/>
			</View>
		);
	}

	return (
		<View
			style={[
				coverImageStyles.container,
				coverImageStyles.placeholder,
				{ width: size, height: size, borderRadius: borderRadius.sm, backgroundColor: colors.primaryMuted },
				style,
			]}
		>
			<Ionicons name="book" size={size * 0.5} color={colors.primary} />
		</View>
	);
};

export default CoverImage;

