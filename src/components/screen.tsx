import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { layout, spacing, useMealMabelTheme } from '@/theme';

export type ScreenProps = ViewProps & {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentStyle?: ViewStyle;
};

export function Screen({
  children,
  scroll = true,
  edges = ['top', 'right', 'bottom', 'left'],
  style,
  contentStyle,
  ...props
}: ScreenProps) {
  const theme = useMealMabelTheme();
  const content = <View style={[styles.screenContent, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.screen, { backgroundColor: theme.background }, style]}
      {...props}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.screenScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenScrollContent: { flexGrow: 1 },
  screenContent: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.screenGutter,
    paddingVertical: spacing.lg,
    gap: spacing.xl,
  },
});
