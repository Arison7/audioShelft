import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { pick } from '@react-native-documents/picker'
import { RootStackParamList } from '../navigation/types';

type ShelfProps = NativeStackScreenProps<RootStackParamList, 'Shelf'>;

// --- ID Generation Replacement ---
// Combines current timestamp with a small random number to prevent collisions
const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.floor(Math.random() * 9999)}`;
};

const ASYNC_STORAGE_KEY = '@MediaShelf:list';

// Audio File Metadata Structure
export interface MediaItem {
  id: string;
  name: string;
  permanentUri: string;
  timestamp: number;
}

const ShelfScreen: React.FC<ShelfProps> = ({ navigation }) => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPicking, setIsPicking] = useState(false);

  // --- 1. Load Data from AsyncStorage ---
  const loadShelf = useCallback(async () => {
    try {
      const storedList = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
      if (storedList) {
        const items: MediaItem[] = JSON.parse(storedList);
        items.sort((a, b) => b.timestamp - a.timestamp);
        setMediaList(items);
      }
    } catch (e) {
      console.error("Failed to load shelf from AsyncStorage:", e);
      Alert.alert("Error", "Failed to load media shelf from local storage.");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- 2. Save Data to AsyncStorage ---
  const saveShelf = useCallback(async (items: MediaItem[]) => {
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save shelf to AsyncStorage:", e);
    }
  }, []);

  useEffect(() => {
    loadShelf();
  }, [loadShelf]);

  const handleAddFile = async () => {
    setIsPicking(true);
    try {
      const [result] = await pick({
        mode: 'open',
        type: 'audio/*',
        requestLongTermAccess: true
      })
      if (result.error === null && result.name) {
        let externalUri = result.uri;
        const fileName = result.name;

        const newItem: MediaItem = {
          id: generateUniqueId(),
          name: fileName,
          permanentUri: externalUri, // Store the (now persistently accessible) URI
          timestamp: Date.now(),
        };

        const updatedList = [newItem, ...mediaList];
        setMediaList(updatedList);
        await saveShelf(updatedList); // Persist to local storage

      }


    } catch (error) {
      console.error('Error adding file to shelf:', error);
      Alert.alert("Error", "Could not process the file selection.");
    } finally {
      setIsPicking(false);
    }
  };

  const handleDeleteItem = async (itemToDelete: MediaItem) => {
    // 1. Remove the record from the state and AsyncStorage
    const updatedList = mediaList.filter(item => item.id !== itemToDelete.id);
    setMediaList(updatedList);
    await saveShelf(updatedList);
  };

  // --- 5. Navigation Logic ---
  const handlePlayItem = (item: MediaItem) => {
    navigation.navigate('Player', {
      filePath: item.permanentUri,
      fileName: item.name
    });
  };

  if (loading || isPicking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={{ marginTop: 10 }}>{isPicking ? 'Adding reference & securing access...' : 'Loading Shelf...'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Media Shelf (External Files)</Text>

      <ScrollView style={styles.listContainer}>
        {mediaList.length === 0 ? (
          <Text style={styles.emptyText}>Tap the button below to add your first audiobook reference!</Text>
        ) : (
          mediaList.map((item) => (
            <View key={item.id} style={styles.mediaItem}>
              <View style={styles.mediaDetails}>
                <Text style={styles.mediaName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.mediaDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
              </View>
              <Button title="Play" onPress={() => handlePlayItem(item)} />
              <TouchableOpacity onPress={() => handleDeleteItem(item)} style={styles.deleteButton}>
                <Text style={{ color: '#e74c3c', fontSize: 14 }}>&times; Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.addButtonContainer}>
        <Button
          title="Add New Audiobook Reference ➕"
          onPress={handleAddFile}
          disabled={isPicking}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 15, color: '#2c3e50' },
  listContainer: { flex: 1, width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: '#fff' },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  mediaDetails: { flex: 1, marginRight: 10 },
  mediaName: { fontSize: 16, fontWeight: '600' },
  mediaDate: { fontSize: 12, color: '#999' },
  deleteButton: { marginLeft: 10, padding: 5, borderRadius: 5, borderWidth: 1, borderColor: '#e74c3c' },
  emptyText: { textAlign: 'center', padding: 20, fontSize: 16, color: '#888' },
  addButtonContainer: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbeaea',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  warningText: {
    marginLeft: 10,
    fontSize: 12,
    color: '#c0392b',
    flex: 1,
  }
});

export default ShelfScreen;
