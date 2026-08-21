import { Text, type TextProps } from 'react-native';

import { typography, useMealMabelTheme, type TypographyToken } from '@/theme';

export type AppTextProps = TextProps & {
  variant?: TypographyToken;
  tone?: 'default' | 'muted' | 'primary' | 'danger' | 'inverse';
};

export function AppText({ variant = 'body', tone = 'default', style, ...props }: AppTextProps) {
  const theme = useMealMabelTheme();
  const color = {
    default: theme.text,
    muted: theme.textMuted,
    primary: theme.primary,
    danger: theme.danger,
    inverse: theme.primaryContrast,
  }[tone];

  return <Text allowFontScaling style={[typography[variant], { color }, style]} {...props} />;
}
