import { palette, shadow } from '@/constants/ui';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface CreateButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'; 
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  label?: string;
}

export const CreateButton = ({
  variant = 'primary',
  size = 'medium',
  style,
  onPress,
  label = 'New Task +',
}: CreateButtonProps) => {

  const modeStyle = styles[variant];
  const textModeStyle = textStyles[variant];

  const sizeStyle = styles[size];
  const textSizeStyle = textSizeStyles[size];

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[styles.button, modeStyle, sizeStyle, style]}>
        <Text style={[textModeStyle, textSizeStyle]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 48,
    justifyContent: 'center',
    ...shadow,
  },

  primary: {
    backgroundColor: palette.primary,
  },
  secondary: {
    backgroundColor: palette.primarySoft,
  },
  danger: {
    backgroundColor: palette.danger,
  },


  small: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
  large: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});

const textStyles = StyleSheet.create({
  primary: {
    color: 'white',
    fontWeight: '700',
  },
  secondary: {
    color: palette.primaryDark,
    fontWeight: '700',
  },
  danger: {
    color: 'white',
    fontWeight: '700',
  },
});


const textSizeStyles = StyleSheet.create({
  small: {
    fontSize: 12,
  },
  medium: {
    fontSize: 14,
  },
  large: {
    fontSize: 16,
  },
});
