import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors, progressBarStyles } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  trackColor?: string;
  progressColor?: string;
  style?: ViewStyle;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 4,
  trackColor = colors.surfaceHighlight,
  progressColor = colors.primary,
  style,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      style={[
        progressBarStyles.track,
        { height, backgroundColor: trackColor, borderRadius: height / 2 },
        style,
      ]}
    >
      <View
        style={[
          progressBarStyles.progress,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: progressColor,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

export default ProgressBar;

