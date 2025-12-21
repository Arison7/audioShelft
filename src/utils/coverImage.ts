import * as DocumentPicker from "expo-document-picker";

/**
 * Extract album art from MP3 file using expo-av
 */
export const extractAlbumArt = async (audioUri: string): Promise<string | null> => {
    try {
        // For bundled assets, we can't extract metadata easily
        // Return null and let user set custom cover
        if (audioUri.startsWith("asset://")) {
            return null;
        }

        // For external files, we'd need a library like react-native-get-music-files
        // or use expo-av's metadata extraction
        // For now, return null - user can set custom cover
        return null;
    } catch (error) {
        console.error("Failed to extract album art:", error);
        return null;
    }
};

/**
 * Pick a cover image from device
 */
export const pickCoverImage = async (): Promise<string | null> => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: "image/*",
            copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            console.log("Picked image:", asset.uri);
            return asset.uri;
        }
        return null;
    } catch (error: any) {
        if (error.message && !error.message.includes("cancel")) {
            console.error("Failed to pick cover image:", error);
        }
        return null;
    }
};