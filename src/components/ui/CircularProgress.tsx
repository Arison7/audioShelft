import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Circle } from 'react-native-progress';
import { colors } from '../../theme';
import Typography from './Typography';

interface CircularProgressProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 36,
  strokeWidth = 3,
  showPercentage = true,
}) => {
  const percentage = Math.round(progress * 100);
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Circle
        size={size}
        progress={clampedProgress}
        thickness={strokeWidth}
        color={colors.primary}
        unfilledColor={colors.border}
        borderWidth={0}
        showsText={false}
        animated={true}
      />
      {showPercentage && (
        <View style={styles.percentageContainer}>
          <Typography variant="caption" color="primary" style={styles.percentageText}>
            {percentage}%
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  percentageContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default CircularProgress;

