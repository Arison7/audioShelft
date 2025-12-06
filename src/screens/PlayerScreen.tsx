import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AudioPlayer from '../compoments/AudioPlayer'; // Assuming you use the previous MediaPlayer component
import NotesSection from '../compoments/NotesSection';

type PlayerProps = NativeStackScreenProps<RootStackParamList, 'Player'>;

const PlayerScreen: React.FC<PlayerProps> = ({ route }) => {
  if (!route.params) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No file selected</Text>
        <Text>Please select a file from the Shelf first</Text>
      </View>
    );
  }
  
  const { filePath, fileName } = route.params;

  const [addNoteTimestamp, setAddNoteTimestamp] = useState<number | null>(null);

  const handleAddNotePress = (timestamp: number) => {
    setAddNoteTimestamp(timestamp);
  };

  const handleAddNoteHandled = () => {
    setAddNoteTimestamp(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Now Playing: {fileName}</Text>

      {/* This is where your functional audio player component would go, 
        using the filePath prop for playback.
      */}
      <AudioPlayer
        fileName={fileName}
        filePath={filePath}
        onAddNotePress={handleAddNotePress}
      />

      <NotesSection
        filePath={filePath}
        addNoteTimestamp={addNoteTimestamp}
        onAddNoteHandled={handleAddNoteHandled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 40, backgroundColor: '#eef' },
  title: { fontSize: 24, marginBottom: 10, fontWeight: 'bold' },
});

export default PlayerScreen;
