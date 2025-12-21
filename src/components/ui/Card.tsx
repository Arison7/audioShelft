import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { cardStyles as themeCardStyles } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  onPress,
  style,
  padding = 'md',
}) => {
  const containerStyles: ViewStyle[] = [
    themeCardStyles.base,
    themeCardStyles[`variant_${variant}`],
    padding !== 'none' && themeCardStyles[`padding_${padding}`],
    style,
  ].filter(Boolean) as ViewStyle[];

  if (onPress) {
    return (
      <TouchableOpacity style={containerStyles} onPress={onPress} activeOpacity={0.85}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyles}>{children}</View>;
};

export default Card;

