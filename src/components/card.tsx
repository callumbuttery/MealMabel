import { StyleSheet, View, type ViewProps } from 'react-native';

import { radii, shadows, spacing, useMealMabelTheme } from '@/theme';

export type CardProps = ViewProps & {
  elevated?: boolean;
  bordered?: boolean;
};

export function Card({ elevated = false, bordered = false, style, ...props }: CardProps) {
  const theme = useMealMabelTheme();
  return (
    <View
      style={[
        styles.card,
        bordered ? shadows.none : elevated ? shadows.md : shadows.sm,
        {
          backgroundColor: theme.surface,
          borderColor: bordered ? theme.border : 'transparent',
          borderWidth: bordered ? 2 : 0,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.xl, padding: spacing.lg },
});
