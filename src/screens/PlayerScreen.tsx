import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AudioPlayer from '../compoments/AudioPlayer'; // Assuming you use the previous MediaPlayer component

type PlayerProps = NativeStackScreenProps<RootStackParamList, 'Player'>;

const PlayerScreen: React.FC<PlayerProps> = ({ route }) => {
  // Access parameters passed from ShelfScreen
  const { filePath, fileName } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Now Playing: {fileName}</Text>
      <Text style={styles.path}>Path: {filePath}</Text>

      {/* This is where your functional audio player component would go, 
        using the filePath prop for playback.
      */}
      <AudioPlayer />

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 40, backgroundColor: '#eef' },
  title: { fontSize: 24, marginBottom: 10, fontWeight: 'bold' },
  path: { fontSize: 14, color: '#666', marginBottom: 30 },
});

export default PlayerScreen;
