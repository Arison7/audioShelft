import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';

interface Iprops {
  fileName: string;
  filePath: string;
  onAddNotePress?: (currentTime: number) => void;
}

const AudioPlayer: React.FC<Iprops> = ({ fileName, filePath, onAddNotePress }) => {
  useEffect(() => {
    const configureAudio = async () => {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionModeAndroid: 'duckOthers',
        interruptionMode: 'mixWithOthers'
      });
    }
    configureAudio();
    // Configure audio mode to allow background playback
  }, []);

  // Create the audio player hook
  const player = useAudioPlayer(filePath);

  // Get the playback status
  const status = useAudioPlayerStatus(player);

  const isLoaded = status?.isLoaded;
  const isPlaying = status?.playing;

  // Get currentTime and duration in seconds
  const currentTime = status?.currentTime ?? 0;
  const duration = status?.duration ?? 0;

  // Format seconds into hh:mm:ss
  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    const ss = secs.toString().padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.fileName}>{fileName}</Text>
      <Text style={styles.statusText}>
        {isLoaded ? (isPlaying ? 'Playing' : 'Paused') : 'Loading...'}
      </Text>

      <Text style={styles.progress}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </Text>

      <Button
        title={isPlaying ? 'Pause' : 'Play'}
        onPress={() => {
          if (isPlaying) player.pause();
          else player.play();
        }}
        disabled={!isLoaded}
      />

      {onAddNotePress && (
        <View style={{ marginTop: 10 }}>
          <Button
            title="Add note"
            onPress={() => onAddNotePress(currentTime)}
            disabled={!isLoaded}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  fileName: {
    fontSize: 16,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 10,
    color: '#555',
  },
  progress: {
    fontSize: 14,
    marginBottom: 20,
    color: '#333',
  },
});

export default AudioPlayer;
