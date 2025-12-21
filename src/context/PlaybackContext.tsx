import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useRef } from "react";
import {
	useAudioPlayer,
	useAudioPlayerStatus,
	setAudioModeAsync,
	AudioSource,
} from "expo-audio";

// Bundled sample audio files
const SAMPLE_ASSETS: Record<string, number> = {
	"asset://pride_and_prejudice_sample": require("../../assets/audio/pride_and_prejudice_sample.mp3"),
	"asset://sherlock_holmes_sample": require("../../assets/audio/sherlock_holmes_sample.mp3"),
	"asset://book3": require("../../assets/audio/pride_and_prejudice_sample.mp3"),
	"asset://book4": require("../../assets/audio/sherlock_holmes_sample.mp3"),
	"asset://book5": require("../../assets/audio/pride_and_prejudice_sample.mp3"),
	"asset://book6": require("../../assets/audio/sherlock_holmes_sample.mp3"),
	
};

export interface PlaybackTrack {
	filePath: string;
	fileName: string;
	coverImageUri?: string;
	itemId?: string;
}

interface PlaybackContextType {
	currentTrack: PlaybackTrack | null;
	setCurrentTrack: (track: PlaybackTrack | null) => void;
	player: ReturnType<typeof useAudioPlayer> | null;
	status: ReturnType<typeof useAudioPlayerStatus> | null;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const PlaybackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [currentTrack, setCurrentTrack] = useState<PlaybackTrack | null>(null);

	// Configure audio mode once
	useEffect(() => {
		const configureAudio = async () => {
			await setAudioModeAsync({
				playsInSilentMode: true,
				shouldPlayInBackground: true,
				interruptionModeAndroid: "duckOthers",
				interruptionMode: "mixWithOthers",
			});
		};
		configureAudio();
	}, []);

	// Create audio source from current track
	const audioSource = useMemo((): AudioSource | string | null => {
		if (!currentTrack) return null;
		if (currentTrack.filePath.startsWith("asset://")) {
			return SAMPLE_ASSETS[currentTrack.filePath] || currentTrack.filePath;
		}
		return currentTrack.filePath;
	}, [currentTrack]);

	// Create shared audio player instance
	const player = useAudioPlayer(audioSource || "");
	const status = useAudioPlayerStatus(player);

	return (
		<PlaybackContext.Provider value={{ currentTrack, setCurrentTrack, player, status }}>
			{children}
		</PlaybackContext.Provider>
	);
};

export const usePlayback = () => {
	const context = useContext(PlaybackContext);
	if (!context) {
		throw new Error("usePlayback must be used within a PlaybackProvider");
	}
	return context;
};

