import React from 'react';
import { Text, TextStyle } from 'react-native';
import { typography, typographyStyles } from '../../theme';

type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label';

type TypographyColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'error' | 'success';

interface TypographyProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  color?: TypographyColor;
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: TextStyle;
}

const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  weight,
  align = 'left',
  numberOfLines,
  style,
}) => {
  const textStyles: TextStyle[] = [
    typographyStyles[variant],
    typographyStyles[`color_${color}`],
    weight && { fontWeight: typography.weight[weight] },
    { textAlign: align },
    style,
  ].filter(Boolean) as TextStyle[];

  return (
    <Text style={textStyles} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};

export default Typography;

