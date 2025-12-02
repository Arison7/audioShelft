import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AudioPlayer from '../compoments/AudioPlayer'; // Assuming you use the previous MediaPlayer component
import { getNotesForFile, Note, saveNotesForFile } from '../storage/notesStorage';
import { Ionicons } from '@expo/vector-icons';

type PlayerProps = NativeStackScreenProps<RootStackParamList, 'Player'>;

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

const PlayerScreen: React.FC<PlayerProps> = ({ route }) => {
  if (!route.params) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No file selected</Text>
        <Text>Please select a file from the Shelf first</Text>
      </View>
    );
  }
  // Access parameters passed from ShelfScreen
  const { filePath, fileName } = route.params;

  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);

  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteTimestamp, setNoteTimestamp] = useState<number | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const loaded = await getNotesForFile(filePath);
      if (mounted) {
        // sort newest first or by timestamp; pick what you like
        loaded.sort((a, b) => a.timestamp - b.timestamp);
        setNotes(loaded);
        setNotesLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [filePath]);

  const handleOpenNoteModal = (timestamp: number) => {
    setNoteTimestamp(timestamp);
    setNoteText('');
    setEditingNoteId(null);
    setNoteModalVisible(true);
  };

  const handleSaveNote = async () => {
    if (noteTimestamp == null || noteText.trim().length === 0) {
      setNoteModalVisible(false);
      setEditingNoteId(null);
      return;
    }

    if (editingNoteId) {
      // editing an existing note
      const updated = notes.map((n) =>
        n.id === editingNoteId ? { ...n, text: noteText.trim() } : n
      );
      setNotes(updated);
      await saveNotesForFile(filePath, updated);
    } else {
      // creating a new note
      const newNote: Note = {
        id: `${Date.now()}-${Math.floor(Math.random() * 9999)}`,
        text: noteText.trim(),
        timestamp: noteTimestamp,
        createdAt: Date.now(),
      };

      const updated = [...notes, newNote].sort((a, b) => a.timestamp - b.timestamp);
      setNotes(updated);
      await saveNotesForFile(filePath, updated);
    }

    setNoteModalVisible(false);
    setNoteText('');
    setNoteTimestamp(null);
    setEditingNoteId(null);
  };

  const handleDeleteNote = async (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    await saveNotesForFile(filePath, updated);
  };

  const handleEditNote = (note: Note) => {
    setNoteTimestamp(note.timestamp);
    setNoteText(note.text);          
    setEditingNoteId(note.id);
    setNoteModalVisible(true);
  };

  const handleCancelNote = () => {
    setNoteModalVisible(false);
    setNoteText('');
    setNoteTimestamp(null);
    setEditingNoteId(null);
  };

  const handleNoteTimestampPress = (timestamp: number) => {
    // here we can put a jumpback when the timestamp is pressed or maybe a short prelistening.
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Now Playing: {fileName}</Text>

      {/* This is where your functional audio player component would go, 
        using the filePath prop for playback.
      */}
      <AudioPlayer fileName={fileName} filePath={filePath} onAddNotePress={handleOpenNoteModal}
 />

       <View style={styles.notesHeader}>
        <Text style={styles.notesTitle}>Notes</Text>
        <Text style={styles.notesCount}>{notes.length} total</Text>
      </View>

       {notesLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : notes.length === 0 ? (
        <Text style={styles.emptyNotesText}>
          No notes yet. Tap "Add note" to create one.
        </Text>
      ) : (
        <FlatList
          style={styles.notesList}
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.noteItem}>
              <TouchableOpacity onPress={() => handleNoteTimestampPress(item.timestamp)}>
                <Text style={styles.noteTimestamp}>{formatTime(item.timestamp)}</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.noteText}>{item.text}</Text>
                <Text style={styles.noteMeta}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleEditNote(item)}
              >
                <Ionicons name="create-outline" size={20} color="#2980b9" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleDeleteNote(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal
        visible={noteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelNote}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Note</Text>
            {noteTimestamp != null && (
              <Text style={styles.modalSubtitle}>
                At {formatTime(noteTimestamp)}
              </Text>
            )}

            <TextInput
              style={styles.modalInput}
              placeholder="Type your note here..."
              value={noteText}
              onChangeText={setNoteText}
              multiline
            />

            <View style={styles.modalButtonsRow}>
              <Button title="Cancel" onPress={handleCancelNote} />
              <Button title="Save" onPress={handleSaveNote} />
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 40, backgroundColor: '#eef' },
  title: { fontSize: 24, marginBottom: 10, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'space-between',
  },
  notesTitle: { fontSize: 20, fontWeight: '600' },
  notesCount: { fontSize: 14, color: '#555' },
  emptyNotesText: {
    marginTop: 10,
    paddingHorizontal: 20,
    textAlign: 'center',
    color: '#666',
  },
  notesList: {
    marginTop: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    gap: 10,
  },
  noteTimestamp: {
    fontWeight: 'bold',
    marginRight: 10,
    minWidth: 80,
  },
  noteText: {
    fontSize: 14,
    color: '#222',
  },
  noteMeta: {
    marginTop: 4,
    fontSize: 11,
    color: '#888',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  modalInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  path: { fontSize: 14, color: '#666', marginBottom: 30 },
  iconButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
});

export default PlayerScreen;
