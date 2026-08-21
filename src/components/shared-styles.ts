import { StyleSheet } from 'react-native';

import { spacing } from '@/theme';

/** Small layout primitives reused across component files — not worth a named component. */
export const sharedStyles = StyleSheet.create({
  flex: { flex: 1 },
  fill: { width: '100%', height: '100%' },
  center: { textAlign: 'center' },
  pressed: { opacity: 0.76 },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
