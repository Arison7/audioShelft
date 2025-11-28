import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type ShelfProps = NativeStackScreenProps<RootStackParamList, 'Shelf'>;

const ShelfScreen: React.FC<ShelfProps> = ({ navigation }) => {
  // Example of navigating to PlayerScreen with parameters
  const playExample = () => {
    navigation.navigate('Player', {
      filePath: '/user/downloads/song.mp3',
      fileName: 'My Favorite Song'
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Media Shelf (List of Files)</Text>
      <Text>Here you would see a list of available audio files.</Text>
      <Button
        title="Go to Player Screen"
        onPress={playExample}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 10 },
});

export default ShelfScreen;
