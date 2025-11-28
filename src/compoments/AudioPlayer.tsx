import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Text, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

type PlaybackStatus = 'loading' | 'playing' | 'paused' | 'stopped';

const AudioPlayer: React.FC = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<PlaybackStatus>('stopped');
  const [fileName, setFileName] = useState<string>('No file selected');

  // --- 1. Sound Object Management & Cleanup ---
  useEffect(() => {
    // Crucial: Cleanup when component unmounts
    return () => {
      if (sound) {
        console.log('Unloading Sound');
        sound.unloadAsync();
      }
    };
  }, [sound]); // Dependency on 'sound' ensures cleanup runs if 'sound' object changes

  // --- 2. File Selection Logic ---
  const selectFile = async () => {
    try {
      // Unload any currently loaded sound before selecting a new one
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setStatus('stopped');
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*', // Filter for audio files
        copyToCacheDirectory: true, // Recommended for playback
      });

      if (result.canceled === false) {
        // The URI is the path to the file in Expo's temporary cache
        const fileUri = result.assets[0].uri;
        const name = result.assets[0].name;

        setFileName(name);
        await loadAudio(fileUri);

      } else {
        // User cancelled the file picker
        console.log('File selection cancelled.');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to open file picker or load audio.');
    }
  };

  // --- 3. Audio Loading Logic ---
  const loadAudio = async (uri: string) => {
    try {
      setStatus('loading');

      // Set audio mode for playback compatibility (especially Android background)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
      });

      // Create a new sound object from the selected URI
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri }, // Use the dynamic URI here
        { shouldPlay: false }
      );

      setSound(newSound);
      setStatus('paused');

      // Optional: Update status when playback finishes
      newSound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.isLoaded && playbackStatus.didJustFinish) {
          setStatus('stopped');
          newSound.stopAsync();
        }
      });

    } catch (error) {
      console.error('Error creating sound object:', error);
      setStatus('stopped');
    }
  };

  // --- 4. Play/Pause Control ---
  const togglePlayback = async () => {
    if (!sound) {
      Alert.alert('No File', 'Please select an audio file first.');
      return;
    }

    const playbackStatus = await sound.getStatusAsync();

    if (playbackStatus.isLoaded) {
      if (playbackStatus.isPlaying) {
        await sound.pauseAsync();
        setStatus('paused');
      } else {
        await sound.playAsync();
        setStatus('playing');
      }
    }
  };

  // --- 5. Render UI ---
  const buttonTitle =
    status === 'loading' ? 'Loading...' :
      status === 'playing' ? 'Pause' :
        'Play';

  return (
    <View style={styles.container}>
      <Text style={styles.fileName}>Selected File: **{fileName}**</Text>
      <Text style={styles.statusText}>Status: {status.toUpperCase()}</Text>

      <View style={styles.buttonGroup}>
        <Button
          title="Select Audio File 🎵"
          onPress={selectFile}
        />
        <Button
          title={buttonTitle}
          onPress={togglePlayback}
          disabled={!sound || status === 'loading'}
          color={status === 'playing' ? 'red' : 'green'}
        />
      </View>
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
    marginBottom: 20,
    color: '#555',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
  }
});

export default AudioPlayer;
