import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { copy } from '@/copy';
import { useMealMabelTheme } from '@/theme';

export type RetailerLogoProps = {
  name: string;
  size?: number;
  color?: string;
};

export function RetailerLogo({ name, size = 48, color }: RetailerLogoProps) {
  const theme = useMealMabelTheme();
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
  return (
    <View
      accessible
      accessibilityLabel={copy.components.logo(name)}
      style={[
        styles.retailerLogo,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color ?? theme.surfaceMuted,
        },
      ]}
    >
      <AppText variant="label" style={{ color: color ? theme.primaryContrast : theme.textMuted }}>
        {initials}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  retailerLogo: { alignItems: 'center', justifyContent: 'center' },
});
