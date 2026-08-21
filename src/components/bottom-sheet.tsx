import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { IconButton } from '@/components/icon-button';
import { sharedStyles } from '@/components/shared-styles';
import { copy } from '@/copy';
import { radii, shadows, spacing, useMealMabelTheme } from '@/theme';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const theme = useMealMabelTheme();
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.modalRoot, { backgroundColor: theme.overlay }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.a11y.closeSheet}
          onPress={onClose}
          style={styles.modalDismiss}
        />
        <SafeAreaView
          accessibilityViewIsModal
          edges={['bottom']}
          style={[styles.bottomSheet, shadows.lg, { backgroundColor: theme.surface }]}
        >
          <View style={styles.sheetHandleRow}>
            <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
          </View>
          <View style={styles.sheetHeader}>
            <AppText variant="h2" style={sharedStyles.flex}>
              {title}
            </AppText>
            <IconButton icon="close" label={copy.a11y.close} onPress={onClose} size="small" />
          </View>
          <ScrollView
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalDismiss: { flex: 1 },
  bottomSheet: {
    maxHeight: '88%',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  sheetHandleRow: { alignItems: 'center', paddingTop: spacing.sm },
  sheetHandle: { width: 44, height: 5, borderRadius: radii.pill },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sheetContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
});
