import AsyncStorage from "@react-native-async-storage/async-storage";

const PLAYBACK_KEY = "@AudioShelf:playback";

export interface PlaybackState {
	filePath: string;
	position: number; // in seconds
	duration?: number; // in seconds
	lastPlayed: number; // timestamp
}

export const savePlaybackPosition = async (filePath: string, position: number, duration?: number): Promise<void> => {
	try {
		const current = await getPlaybackStates();
		const updated = current.filter(state => state.filePath !== filePath);
		updated.unshift({
			filePath,
			position: Math.floor(position),
			duration: duration ? Math.floor(duration) : undefined,
			lastPlayed: Date.now(),
		});
		// Keep only last 50 entries
		const trimmed = updated.slice(0, 50);
		await AsyncStorage.setItem(PLAYBACK_KEY, JSON.stringify(trimmed));
	} catch (error) {
		console.error("Failed to save playback position:", error);
	}
};

export const getPlaybackPosition = async (filePath: string): Promise<number> => {
	try {
		const states = await getPlaybackStates();
		const state = states.find(s => s.filePath === filePath);
		return state?.position || 0;
	} catch (error) {
		console.error("Failed to get playback position:", error);
		return 0;
	}
};

export const getPlaybackState = async (filePath: string): Promise<PlaybackState | null> => {
	try {
		const states = await getPlaybackStates();
		return states.find(s => s.filePath === filePath) || null;
	} catch (error) {
		console.error("Failed to get playback state:", error);
		return null;
	}
};

export const getPlaybackStates = async (): Promise<PlaybackState[]> => {
	try {
		const stored = await AsyncStorage.getItem(PLAYBACK_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch (error) {
		console.error("Failed to get playback states:", error);
		return [];
	}
};

export const clearPlaybackPosition = async (filePath: string): Promise<void> => {
	try {
		const current = await getPlaybackStates();
		const updated = current.filter(state => state.filePath !== filePath);
		await AsyncStorage.setItem(PLAYBACK_KEY, JSON.stringify(updated));
	} catch (error) {
		console.error("Failed to clear playback position:", error);
	}
};
