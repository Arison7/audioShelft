import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors, layout, loadingScreenStyles } from '../../theme';
import Typography from './Typography';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
}) => {
  return (
    <View style={[layout.container, loadingScreenStyles.container]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Typography variant="body" color="secondary" style={loadingScreenStyles.message}>
        {message}
      </Typography>
    </View>
  );
};

export default LoadingScreen;

