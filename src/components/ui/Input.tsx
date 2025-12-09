import React from 'react';
import { View, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { colors, inputStyles } from '../../theme';
import Typography from './Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[inputStyles.container, containerStyle]}>
      {label && (
        <Typography variant="caption" color="secondary" style={inputStyles.label}>
          {label}
        </Typography>
      )}
      <TextInput
        style={[inputStyles.input, error && inputStyles.inputError, style]}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        {...props}
      />
      {error && (
        <Typography variant="caption" color="error" style={inputStyles.errorText}>
          {error}
        </Typography>
      )}
    </View>
  );
};

export default Input;

