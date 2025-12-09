import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, iconButtonStyles } from '../../theme';

type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type IconButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
}

const sizeConfig = {
  sm: { container: 32, icon: 16 },
  md: { container: 40, icon: 20 },
  lg: { container: 52, icon: 24 },
  xl: { container: 64, icon: 32 },
};

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  style,
}) => {
  const { container, icon: iconSize } = sizeConfig[size];

  const getIconColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
        return colors.textOnPrimary;
      case 'danger':
        return colors.error;
      case 'ghost':
        return colors.textSecondary;
      default:
        return colors.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        iconButtonStyles.base,
        iconButtonStyles[`variant_${variant}`],
        { width: container, height: container, borderRadius: container / 2 },
        disabled && iconButtonStyles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={iconSize} color={getIconColor()} />
    </TouchableOpacity>
  );
};

export default IconButton;

