// Use 'undefined' for screens that take no parameters.
// For PlayerScreen, we assume it takes a 'filePath' to the audio file.
export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Shelf: undefined;
  Player: { filePath: string; fileName: string; coverImageUri?: string; itemId?: string };
  Settings: undefined;
};
