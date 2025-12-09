import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, emptyStateStyles } from '../../theme';
import Typography from './Typography';
import Button from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'albums-outline',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={emptyStateStyles.container}>
      <View style={emptyStateStyles.iconContainer}>
        <Ionicons name={icon} size={64} color={colors.textMuted} />
      </View>
      <Typography variant="h3" color="secondary" align="center">
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body"
          color="muted"
          align="center"
          style={emptyStateStyles.description}
        >
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={emptyStateStyles.button}
        />
      )}
    </View>
  );
};

export default EmptyState;

