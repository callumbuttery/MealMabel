import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { copy } from '@/copy';
import { layout, radii, spacing, typography, useMealMabelTheme } from '@/theme';

export type SearchInputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  onClear?: () => void;
};

export function SearchInput({ label = 'Search', value, onClear, ...props }: SearchInputProps) {
  const theme = useMealMabelTheme();
  const hasValue = typeof value === 'string' && value.length > 0;
  return (
    <View
      style={[styles.searchShell, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <Ionicons name="search" size={21} color={theme.textMuted} />
      <TextInput
        accessibilityLabel={label}
        allowFontScaling
        placeholder={label}
        placeholderTextColor={theme.textMuted}
        selectionColor={theme.primary}
        returnKeyType="search"
        value={value}
        style={[styles.searchInput, { color: theme.text }]}
        {...props}
      />
      {hasValue && onClear ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.a11y.clearSearch}
          hitSlop={10}
          onPress={onClear}
          style={styles.searchClear}
        >
          <Ionicons name="close-circle" size={22} color={theme.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  searchShell: {
    minHeight: 52,
    borderRadius: radii.pill,
    borderWidth: 2,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    minHeight: 50,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  searchClear: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
