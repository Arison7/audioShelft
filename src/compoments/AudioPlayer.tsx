import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Text, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { getContentUriAsync } from 'expo-file-system/legacy'
import FileSystem from 'expo-file-system';

type PlaybackStatus = 'loading' | 'playing' | 'paused' | 'stopped';

interface Iprops {
  fileName: string,
  filePath: string
}

const AudioPlayer: React.FC<Iprops> = ({ fileName, filePath }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<PlaybackStatus>('stopped');

  // --- 1. Sound Object Management & Cleanup ---
  useEffect(() => {
    loadAudio(filePath);
    // Crucial: Cleanup when component unmounts
    return () => {
      if (sound) {
        console.log('Unloading Sound');
        sound.unloadAsync();
      }
    };

  }, [filePath]); // Dependency on 'sound' ensures cleanup runs if 'sound' object changes

  // --- 3. Audio Loading Logic ---
  const loadAudio = async (uri: string) => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setStatus('stopped');
    }
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
