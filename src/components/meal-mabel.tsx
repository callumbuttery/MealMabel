import Ionicons from "@expo/vector-icons/Ionicons";
import React, {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  AccessibilityInfo,
  Animated,
  Image,
  type ImageSourcePropType,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextProps,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import {
  colors,
  layout,
  radii,
  shadows,
  spacing,
  typography,
  useMealMabelTheme,
  type TypographyToken,
} from "@/theme";
import { copy } from "@/copy";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export type AppTextProps = TextProps & {
  variant?: TypographyToken;
  tone?: "default" | "muted" | "primary" | "danger" | "inverse";
};

export function AppText({
  variant = "body",
  tone = "default",
  style,
  ...props
}: AppTextProps) {
  const theme = useMealMabelTheme();
  const color = {
    default: theme.text,
    muted: theme.textMuted,
    primary: theme.primary,
    danger: theme.danger,
    inverse: theme.primaryContrast,
  }[tone];

  return (
    <Text
      allowFontScaling
      style={[typography[variant], { color }, style]}
      {...props}
    />
  );
}

export type ScreenProps = ViewProps & {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentStyle?: ViewStyle;
};

export function Screen({
  children,
  scroll = true,
  edges = ["top", "right", "bottom", "left"],
  style,
  contentStyle,
  ...props
}: ScreenProps) {
  const theme = useMealMabelTheme();
  const content = (
    <View style={[styles.screenContent, contentStyle]}>{children}</View>
  );

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

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
};

export function AppHeader({ title, subtitle, onBack, action }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <IconButton icon="arrow-back" label={copy.a11y.back} onPress={onBack} />
      ) : (
        <View style={styles.headerSpacer} />
      )}
      <View style={styles.headerCopy}>
        <AppText variant="h2" numberOfLines={2} style={styles.headerTitle}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText
            variant="caption"
            tone="muted"
            numberOfLines={2}
            style={styles.headerTitle}
          >
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {action ?? <View style={styles.headerSpacer} />}
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  accessibilityHint?: string;
};

function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  icon,
  accessibilityHint,
  secondary,
}: ButtonProps & { secondary: boolean }) {
  const theme = useMealMabelTheme();
  const blocked = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary ? shadows.none : shadows.md,
        {
          backgroundColor: secondary
            ? theme.background
            : pressed
              ? theme.primaryPressed
              : theme.primary,
          borderColor: theme.primary,
          borderWidth: secondary ? 2 : 0,
          opacity: blocked ? 0.5 : pressed ? 0.9 : 1,
        },
      ]}
    >
      {loading ? (
        <LoadingMabel compact accessibilityLabel={copy.a11y.loading(label)} />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={20}
              color={secondary ? theme.primary : theme.primaryContrast}
            />
          ) : null}
          <AppText variant="button" tone={secondary ? "primary" : "inverse"}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

export function PrimaryButton(props: ButtonProps) {
  return <Button {...props} secondary={false} />;
}

export function SecondaryButton(props: ButtonProps) {
  return <Button {...props} secondary />;
}

export type IconButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  size?: "small" | "medium";
};

export function IconButton({
  icon,
  label,
  onPress,
  disabled = false,
  size = "medium",
}: IconButtonProps) {
  const theme = useMealMabelTheme();
  const dimension = size === "small" ? layout.minTouchTarget : 48;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          width: dimension,
          height: dimension,
          backgroundColor: pressed ? theme.surfaceMuted : theme.surface,
          borderColor: theme.border,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={size === "small" ? 20 : 23}
        color={theme.text}
      />
    </Pressable>
  );
}

export type CardProps = ViewProps & {
  elevated?: boolean;
  bordered?: boolean;
};

export function Card({
  elevated = false,
  bordered = false,
  style,
  ...props
}: CardProps) {
  const theme = useMealMabelTheme();
  return (
    <View
      style={[
        styles.card,
        bordered ? shadows.none : elevated ? shadows.md : shadows.sm,
        {
          backgroundColor: theme.surface,
          borderColor: bordered ? theme.border : "transparent",
          borderWidth: bordered ? 2 : 0,
        },
        style,
      ]}
      {...props}
    />
  );
}

export type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.flex}>
        <AppText variant="h3">{title}</AppText>
        {subtitle ? <AppText tone="muted">{subtitle}</AppText> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
          onPress={onAction}
          style={styles.textAction}
        >
          <AppText variant="label" tone="primary">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export function ChoiceChip({
  label,
  selected,
  onPress,
  disabled = false,
}: ChoiceChipProps) {
  const theme = useMealMabelTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceChip,
        {
          backgroundColor: selected ? theme.accentSoft : theme.surface,
          borderColor: selected ? theme.accent : theme.border,
          opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
        },
      ]}
    >
      {selected ? (
        <Ionicons name="checkmark-circle" color={theme.accentDark} size={16} />
      ) : null}
      <AppText
        variant="label"
        style={selected ? { color: theme.accentDark } : undefined}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export type NumberStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
};

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  label,
}: NumberStepperProps) {
  const theme = useMealMabelTheme();
  const decreaseDisabled = value <= min;
  const increaseDisabled = value >= max;
  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value, text: String(value) }}
      style={[
        styles.stepper,
        { borderColor: theme.border, backgroundColor: theme.surface },
      ]}
    >
      <StepperButton
        icon="remove"
        label={`Decrease ${label}`}
        disabled={decreaseDisabled}
        onPress={() => onChange(Math.max(min, value - step))}
      />
      <AppText variant="h3" style={styles.stepperValue}>
        {value}
      </AppText>
      <StepperButton
        icon="add"
        label={`Increase ${label}`}
        disabled={increaseDisabled}
        onPress={() => onChange(Math.min(max, value + step))}
      />
    </View>
  );
}

function StepperButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: IconName;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const theme = useMealMabelTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.stepperButton,
        {
          backgroundColor: theme.surfaceMuted,
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={theme.text} />
    </Pressable>
  );
}

export type AppTextInputProps = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
};

export function AppTextInput({
  label,
  error,
  helperText,
  style,
  accessibilityLabel,
  ...props
}: AppTextInputProps) {
  const theme = useMealMabelTheme();
  return (
    <View style={styles.inputGroup}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error ?? helperText}
        allowFontScaling
        placeholderTextColor={theme.textMuted}
        selectionColor={theme.primary}
        style={[
          styles.textInput,
          {
            color: theme.text,
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : theme.border,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <AppText
          variant="caption"
          tone="danger"
          accessibilityLiveRegion="polite"
        >
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" tone="muted">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

export type CurrencyInputProps = Omit<
  AppTextInputProps,
  "value" | "onChangeText" | "keyboardType"
> & {
  value: string;
  onChangeValue: (value: string) => void;
  currencySymbol?: string;
};

export function CurrencyInput({
  value,
  onChangeValue,
  currencySymbol = "£",
  label,
  error,
  helperText,
  style,
  accessibilityLabel,
  ...props
}: CurrencyInputProps) {
  const theme = useMealMabelTheme();
  return (
    <View style={styles.inputGroup}>
      <AppText variant="label">{label}</AppText>
      <View
        style={[
          styles.currencyShell,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : theme.border,
          },
        ]}
      >
        <AppText variant="bodyStrong" tone="muted">
          {currencySymbol}
        </AppText>
        <TextInput
          {...props}
          accessibilityLabel={accessibilityLabel ?? label}
          allowFontScaling
          keyboardType="decimal-pad"
          placeholderTextColor={theme.textMuted}
          selectionColor={theme.primary}
          value={value}
          onChangeText={(next) =>
            onChangeValue(next.replace(/[^0-9.,]/g, "").replace(",", "."))
          }
          style={[styles.currencyInput, { color: theme.text }, style]}
        />
      </View>
      {error ? (
        <AppText
          variant="caption"
          tone="danger"
          accessibilityLiveRegion="polite"
        >
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" tone="muted">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

export type SearchInputProps = Omit<TextInputProps, "style"> & {
  label?: string;
  onClear?: () => void;
};

export function SearchInput({
  label = "Search",
  value,
  onClear,
  ...props
}: SearchInputProps) {
  const theme = useMealMabelTheme();
  const hasValue = typeof value === "string" && value.length > 0;
  return (
    <View
      style={[
        styles.searchShell,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
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

export type NutritionPillProps = {
  label: string;
  value: string;
  icon?: IconName;
};

export function NutritionPill({ label, value, icon }: NutritionPillProps) {
  const theme = useMealMabelTheme();
  return (
    <View
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.nutritionPill, { backgroundColor: theme.surfaceMuted }]}
    >
      {icon ? <Ionicons name={icon} color={theme.accent} size={16} /> : null}
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

export type MealCardProps = {
  title: string;
  image?: ImageSourcePropType;
  time?: string;
  cost?: string;
  servings?: number;
  selected?: boolean;
  onPress?: () => void;
  badge?: string;
};

export function MealCard({
  title,
  image,
  time,
  cost,
  servings,
  selected = false,
  onPress,
  badge,
}: MealCardProps) {
  const theme = useMealMabelTheme();
  const card = (
    <Card
      elevated
      accessibilityLabel={[
        title,
        time,
        cost,
        servings ? `${servings} servings` : undefined,
      ]
        .filter(Boolean)
        .join(", ")}
      style={[
        styles.mealCard,
        selected && { borderColor: theme.accent, borderWidth: 2 },
      ]}
    >
      <View style={[styles.mealImage, { backgroundColor: theme.surfaceMuted }]}>
        {image ? (
          <Image source={image} style={styles.fill} resizeMode="cover" />
        ) : (
          <MabelAvatar size={72} />
        )}
        {badge ? (
          <View style={[styles.mealBadge, { backgroundColor: theme.primary }]}>
            <AppText variant="caption" tone="inverse">
              {badge}
            </AppText>
          </View>
        ) : null}
        {selected ? (
          <View
            style={[styles.selectedBadge, { backgroundColor: theme.accent }]}
          >
            <Ionicons
              name="checkmark"
              size={18}
              color={theme.primaryContrast}
            />
          </View>
        ) : null}
      </View>
      <View style={styles.mealCopy}>
        <AppText variant="h3" numberOfLines={2}>
          {title}
        </AppText>
        <View style={styles.metaRow}>
          {time ? <Meta icon="time-outline" text={time} /> : null}
          {servings ? (
            <Meta icon="people-outline" text={String(servings)} />
          ) : null}
          {cost ? <Meta icon="wallet-outline" text={cost} /> : null}
        </View>
      </View>
    </Card>
  );

  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${title}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {card}
    </Pressable>
  ) : (
    card
  );
}

function Meta({ icon, text }: { icon: IconName; text: string }) {
  const theme = useMealMabelTheme();
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={16} color={theme.textMuted} />
      <AppText variant="caption" tone="muted">
        {text}
      </AppText>
    </View>
  );
}

export type BudgetProgressProps = {
  spent: number;
  budget: number;
  currencySymbol?: string;
};

export function BudgetProgress({
  spent,
  budget,
  currencySymbol = "£",
}: BudgetProgressProps) {
  const theme = useMealMabelTheme();
  const ratio = budget > 0 ? Math.min(Math.max(spent / budget, 0), 1) : 0;
  const over = spent > budget;
  const percent = Math.round(ratio * 100);
  return (
    <View
      accessible
      accessibilityLabel={copy.components.spentOf(
        `${currencySymbol}${spent.toFixed(2)}`,
        `${currencySymbol}${budget.toFixed(2)}`,
      )}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={styles.budget}
    >
      <View style={styles.budgetLabels}>
        <AppText variant="label">
          {over ? copy.components.overBudget : copy.components.weeklyBudget}
        </AppText>
        <AppText variant="label" tone={over ? "danger" : "default"}>
          {currencySymbol}
          {spent.toFixed(2)} / {currencySymbol}
          {budget.toFixed(2)}
        </AppText>
      </View>
      <View
        style={[styles.progressTrack, { backgroundColor: theme.surfaceMuted }]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${percent}%`,
              backgroundColor: over ? theme.danger : theme.accent,
            },
          ]}
        />
      </View>
      <AppText variant="caption" tone={over ? "danger" : "muted"}>
        {over
          ? copy.components.overBy(`${currencySymbol}${(spent - budget).toFixed(2)}`)
          : copy.components.remaining(
              `${currencySymbol}${Math.max(budget - spent, 0).toFixed(2)}`,
            )}
      </AppText>
    </View>
  );
}

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
    .join("")
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
      <AppText
        variant="label"
        style={{ color: color ? theme.primaryContrast : theme.textMuted }}
      >
        {initials}
      </AppText>
    </View>
  );
}

export type RetailerCardProps = {
  name: string;
  price: string;
  itemCount?: number;
  selected?: boolean;
  bestValue?: boolean;
  onPress?: () => void;
  logoColor?: string;
};

export function RetailerCard({
  name,
  price,
  itemCount,
  selected = false,
  bestValue = false,
  onPress,
  logoColor,
}: RetailerCardProps) {
  const theme = useMealMabelTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${name}, ${price}${bestValue ? copy.components.bestValueSuffix : ""}`}
      accessibilityState={{ selected }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.retailerCard,
        shadows.sm,
        {
          backgroundColor:
            selected || bestValue ? theme.accentSoft : theme.surface,
          borderColor: selected || bestValue ? theme.accent : theme.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <RetailerLogo name={name} color={logoColor ?? (bestValue ? theme.accent : undefined)} />
      <View style={styles.flex}>
        <View style={styles.inline}>
          <AppText variant="bodyStrong">{name}</AppText>
          {bestValue ? (
            <View
              style={[styles.valueBadge, { backgroundColor: theme.accent }]}
            >
              <Ionicons
                name="sparkles"
                size={13}
                color={theme.primaryContrast}
              />
              <AppText variant="caption" tone="inverse">
                {copy.components.bestValue}
              </AppText>
            </View>
          ) : null}
        </View>
        {itemCount !== undefined ? (
          <AppText variant="caption" tone="muted">
            {copy.common.items(itemCount)}
          </AppText>
        ) : null}
      </View>
      <AppText variant="h3">{price}</AppText>
      {selected ? (
        <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
      ) : null}
    </Pressable>
  );
}

export type PriceOffer = {
  retailer: string;
  price: string;
  detail?: string;
  best?: boolean;
};

export type PriceComparisonCardProps = {
  itemName: string;
  offers: PriceOffer[];
};

export function PriceComparisonCard({
  itemName,
  offers,
}: PriceComparisonCardProps) {
  const theme = useMealMabelTheme();
  return (
    <Card style={styles.comparisonCard}>
      <AppText variant="h3">{itemName}</AppText>
      {offers.map((offer, index) => (
        <View
          key={`${offer.retailer}-${index}`}
          style={[
            styles.offerRow,
            index > 0 && {
              borderTopColor: theme.border,
              borderTopWidth: StyleSheet.hairlineWidth,
            },
          ]}
        >
          <RetailerLogo name={offer.retailer} size={36} />
          <View style={styles.flex}>
            <AppText variant="label">{offer.retailer}</AppText>
            {offer.detail ? (
              <AppText variant="caption" tone="muted">
                {offer.detail}
              </AppText>
            ) : null}
          </View>
          {offer.best ? (
            <Ionicons name="checkmark-circle" size={20} color={theme.accent} />
          ) : null}
          <AppText variant="bodyStrong">{offer.price}</AppText>
        </View>
      ))}
    </Card>
  );
}

export type ShoppingListItemRowProps = {
  name: string;
  quantity?: string;
  price?: string;
  checked: boolean;
  onToggle: () => void;
  onPress?: () => void;
};

export function ShoppingListItemRow({
  name,
  quantity,
  price,
  checked,
  onToggle,
  onPress,
}: ShoppingListItemRowProps) {
  const theme = useMealMabelTheme();
  return (
    <View style={[styles.shoppingRow, { borderBottomColor: theme.border }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`${name}${quantity ? `, ${quantity}` : ""}`}
        accessibilityState={{ checked }}
        hitSlop={6}
        onPress={onToggle}
        style={[
          styles.checkbox,
          {
            backgroundColor: checked ? theme.accent : theme.surface,
            borderColor: checked ? theme.accent : theme.border,
          },
        ]}
      >
        {checked ? (
          <Ionicons name="checkmark" size={19} color={theme.primaryContrast} />
        ) : null}
      </Pressable>
      <Pressable
        accessibilityRole={onPress ? "button" : undefined}
        disabled={!onPress}
        onPress={onPress}
        style={styles.shoppingCopy}
      >
        <AppText
          variant="bodyStrong"
          tone={checked ? "muted" : "default"}
          style={checked ? styles.strikethrough : undefined}
        >
          {name}
        </AppText>
        {quantity ? (
          <AppText variant="caption" tone="muted">
            {quantity}
          </AppText>
        ) : null}
      </Pressable>
      {price ? (
        <AppText variant="label" tone={checked ? "muted" : "default"}>
          {price}
        </AppText>
      ) : null}
    </View>
  );
}

/** Alias kept for ergonomic UI imports without sharing a domain-model type. */
export const ShoppingListRow = ShoppingListItemRow;
export type ShoppingListRowProps = ShoppingListItemRowProps;

export type ShoppingCategoryProps = {
  title: string;
  count?: number;
  children: ReactNode;
};

export function ShoppingCategory({
  title,
  count,
  children,
}: ShoppingCategoryProps) {
  return (
    <View style={styles.shoppingCategory}>
      <View style={styles.categoryHeader}>
        <AppText variant="h3">{title}</AppText>
        {count !== undefined ? (
          <AppText variant="caption" tone="muted">
            {copy.common.items(count)}
          </AppText>
        ) : null}
      </View>
      <Card style={styles.categoryCard}>{children}</Card>
    </View>
  );
}

export type MabelAvatarProps = {
  size?: number;
  accessibilityLabel?: string;
};

export function MabelAvatar({
  size = 64,
  accessibilityLabel = copy.a11y.mabelAssistant,
}: MabelAvatarProps) {
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={[styles.avatar, { width: size, height: size }]}
    >
      <View
        style={[
          styles.avatarOuter,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.peach,
          },
        ]}
      />
      <View
        style={[
          styles.avatarInner,
          shadows.sm,
          {
            width: size * 0.91,
            height: size * 0.91,
            top: size * 0.045,
            left: size * 0.045,
            borderRadius: (size * 0.91) / 2,
            backgroundColor: colors.peachDeep,
          },
        ]}
      />
      <View
        style={[
          styles.avatarEar,
          {
            width: size * 0.125,
            height: size * 0.086,
            top: size * 0.547,
            left: size * 0.172,
            borderRadius: size * 0.086,
            backgroundColor: colors.coral,
          },
        ]}
      />
      <View
        style={[
          styles.avatarEar,
          {
            width: size * 0.125,
            height: size * 0.086,
            top: size * 0.547,
            right: size * 0.172,
            borderRadius: size * 0.086,
            backgroundColor: colors.coral,
          },
        ]}
      />
      <View
        style={[
          styles.avatarCap,
          {
            width: size * 0.47,
            height: size * 0.297,
            top: -size * 0.078,
            left: size * 0.266,
            borderRadius: size * 0.2,
            borderWidth: Math.max(1.5, size * 0.02),
          },
        ]}
      />
      <View
        style={[
          styles.avatarBand,
          {
            width: size * 0.688,
            height: size * 0.156,
            top: size * 0.109,
            left: size * 0.156,
            borderRadius: size * 0.08,
            borderWidth: Math.max(1.5, size * 0.02),
          },
        ]}
      >
        <View style={styles.avatarEyes}>
          <View
            style={[
              styles.avatarEye,
              {
                width: size * 0.063,
                height: size * 0.078,
                borderRadius: size * 0.04,
              },
            ]}
          />
          <View
            style={[
              styles.avatarEye,
              {
                width: size * 0.063,
                height: size * 0.078,
                borderRadius: size * 0.04,
              },
            ]}
          />
        </View>
      </View>
      <View
        style={[
          styles.avatarSmile,
          {
            width: size * 0.219,
            height: size * 0.109,
            top: size * 0.609,
            left: size * 0.3905,
            borderBottomWidth: Math.max(1.5, size * 0.023),
            borderBottomLeftRadius: size * 0.156,
            borderBottomRightRadius: size * 0.156,
          },
        ]}
      />
    </View>
  );
}

export type MabelInsightProps = {
  title?: string;
  badgeLabel?: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export function MabelInsight({
  title = copy.components.mabelTip,
  badgeLabel,
  children,
  actionLabel,
  onAction,
}: MabelInsightProps) {
  const theme = useMealMabelTheme();
  return (
    <View
      accessibilityRole="summary"
      style={[
        styles.insight,
        { backgroundColor: theme.warningSoft, borderColor: theme.warning },
      ]}
    >
      {badgeLabel ? (
        <Badge label={badgeLabel} />
      ) : (
        <MabelAvatar size={52} />
      )}
      <View style={styles.flex}>
        {badgeLabel ? null : <AppText variant="label">{title}</AppText>}
        {typeof children === "string" ? (
          <AppText>
            {badgeLabel ? <AppText variant="bodyStrong">{title} </AppText> : null}
            {children}
          </AppText>
        ) : (
          children
        )}
        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            onPress={onAction}
            style={styles.insightAction}
          >
            <AppText variant="label" tone="primary">
              {actionLabel} →
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export type BlobProps = {
  size: number;
  color: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  rotate?: string;
  opacity?: number;
};

/** Decorative organic-shaped accent used behind hero content, matching the redesign's hand-drawn blobs. */
export function Blob({
  size,
  color,
  top,
  bottom,
  left,
  right,
  rotate = "0deg",
  opacity = 0.9,
}: BlobProps) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.blob,
        {
          width: size,
          height: size,
          top,
          bottom,
          left,
          right,
          backgroundColor: color,
          opacity,
          borderTopLeftRadius: size * 0.42,
          borderTopRightRadius: size * 0.58,
          borderBottomRightRadius: size * 0.65,
          borderBottomLeftRadius: size * 0.35,
          transform: [{ rotate }],
        },
      ]}
    />
  );
}

export type BadgeProps = {
  label: string;
  tone?: "warning" | "accent";
};

export function Badge({ label, tone = "warning" }: BadgeProps) {
  const theme = useMealMabelTheme();
  const backgroundColor = tone === "warning" ? theme.warning : theme.accent;
  const color = tone === "warning" ? colors.cocoa : theme.primaryContrast;
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Ionicons name="star" size={11} color={color} />
      <AppText
        variant="caption"
        style={[styles.badgeLabel, { color }]}
      >
        {label}
      </AppText>
    </View>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduced(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}

export type LoadingMabelProps = {
  label?: string;
  compact?: boolean;
  accessibilityLabel?: string;
};

export function LoadingMabel({
  label = copy.components.loadingDefault,
  compact = false,
  accessibilityLabel = label,
}: LoadingMabelProps) {
  const reducedMotion = useReducedMotion();
  const [animation] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reducedMotion) {
      animation.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animation, reducedMotion]);

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityLiveRegion="polite"
      style={[styles.loading, compact && styles.loadingCompact]}
    >
      <Animated.View
        style={{
          opacity: reducedMotion
            ? 1
            : animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.65, 1],
              }),
          transform: [
            {
              translateY: reducedMotion
                ? 0
                : animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -4],
                  }),
            },
          ],
        }}
      >
        <MabelAvatar size={compact ? 28 : 64} accessibilityLabel={copy.a11y.mabel} />
      </Animated.View>
      {!compact ? (
        <>
          <View style={styles.loadingDots}>
            <View
              style={[styles.loadingDot, { backgroundColor: colors.coral }]}
            />
            <View
              style={[styles.loadingDot, { backgroundColor: colors.mustard }]}
            />
            <View
              style={[styles.loadingDot, { backgroundColor: colors.sage }]}
            />
          </View>
          <AppText variant="label" tone="muted">
            {label}
          </AppText>
        </>
      ) : null}
    </View>
  );
}

export type EmptyStateProps = {
  title: string;
  message: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  message,
  icon = "basket-outline",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useMealMabelTheme();
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.surfaceMuted }]}>
        <Ionicons name={icon} size={34} color={theme.primary} />
      </View>
      <AppText variant="h2" style={styles.center}>
        {title}
      </AppText>
      <AppText tone="muted" style={styles.center}>
        {message}
      </AppText>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: BottomSheetProps) {
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
          edges={["bottom"]}
          style={[
            styles.bottomSheet,
            shadows.lg,
            { backgroundColor: theme.surface },
          ]}
        >
          <View style={styles.sheetHandleRow}>
            <View
              style={[styles.sheetHandle, { backgroundColor: theme.border }]}
            />
          </View>
          <View style={styles.sheetHeader}>
            <AppText variant="h2" style={styles.flex}>
              {title}
            </AppText>
            <IconButton
              icon="close"
              label={copy.a11y.close}
              onPress={onClose}
              size="small"
            />
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
  flex: { flex: 1 },
  fill: { width: "100%", height: "100%" },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  pressed: { opacity: 0.76 },
  center: { textAlign: "center" },
  screen: { flex: 1 },
  screenScrollContent: { flexGrow: 1 },
  screenContent: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: layout.screenGutter,
    paddingVertical: spacing.lg,
    gap: spacing.xl,
  },
  header: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerSpacer: { width: 48, height: 48 },
  headerCopy: { flex: 1, alignItems: "center", gap: spacing.xxs },
  headerTitle: { textAlign: "center" },
  button: {
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  iconButton: {
    borderRadius: radii.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  card: { borderRadius: radii.xl, padding: spacing.lg },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.md,
  },
  textAction: { minHeight: layout.minTouchTarget, justifyContent: "center" },
  choiceChip: {
    minHeight: layout.minTouchTarget,
    borderRadius: radii.pill,
    borderWidth: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  stepper: {
    minHeight: 48,
    borderRadius: radii.pill,
    borderWidth: 2,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: { minWidth: 20, textAlign: "center" },
  inputGroup: { gap: spacing.xs },
  textInput: {
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  currencyShell: {
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 2,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  currencyInput: {
    flex: 1,
    minHeight: 50,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  searchShell: {
    minHeight: 52,
    borderRadius: radii.pill,
    borderWidth: 2,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
  nutritionPill: {
    minHeight: 36,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  mealCard: { padding: 0, overflow: "hidden" },
  mealImage: { height: 180, alignItems: "center", justifyContent: "center" },
  mealCopy: { padding: spacing.lg, gap: spacing.md },
  mealBadge: {
    position: "absolute",
    left: spacing.md,
    top: spacing.md,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  selectedBadge: {
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  meta: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  budget: { gap: spacing.sm },
  budgetLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  progressTrack: { height: 12, borderRadius: radii.pill, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: radii.pill },
  retailerLogo: { alignItems: "center", justifyContent: "center" },
  retailerCard: {
    minHeight: 76,
    borderRadius: radii.lg,
    borderWidth: 2,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  valueBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  comparisonCard: { gap: spacing.sm },
  offerRow: {
    minHeight: 60,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  shoppingRow: {
    minHeight: 62,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radii.xs,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  shoppingCopy: {
    flex: 1,
    minHeight: layout.minTouchTarget,
    justifyContent: "center",
  },
  strikethrough: { textDecorationLine: "line-through" },
  shoppingCategory: { gap: spacing.sm },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  categoryCard: { paddingVertical: 0 },
  avatar: { alignItems: "center", justifyContent: "center" },
  avatarOuter: { position: "absolute", top: 0, left: 0 },
  avatarInner: { position: "absolute" },
  avatarEar: { position: "absolute", opacity: 0.75 },
  avatarCap: {
    position: "absolute",
    backgroundColor: colors.white,
    borderColor: colors.cocoa,
  },
  avatarBand: {
    position: "absolute",
    backgroundColor: colors.white,
    borderColor: colors.cocoa,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEyes: { flexDirection: "row", gap: spacing.sm },
  avatarEye: { backgroundColor: colors.cocoa },
  avatarSmile: {
    position: "absolute",
    borderBottomColor: colors.coralDark,
  },
  insight: {
    borderRadius: radii.lg,
    borderWidth: 2,
    borderStyle: "dashed",
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  blob: { position: "absolute" },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    transform: [{ rotate: "-3deg" }],
  },
  badgeLabel: { textTransform: "uppercase", letterSpacing: 0.4 },
  insightAction: {
    minHeight: layout.minTouchTarget,
    alignSelf: "flex-start",
    justifyContent: "center",
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
  loadingCompact: { padding: 0 },
  loadingDots: { flexDirection: "row", gap: spacing.sm },
  loadingDot: { width: 9, height: 9, borderRadius: 5 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xxxl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  modalDismiss: { flex: 1 },
  bottomSheet: {
    maxHeight: "88%",
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  sheetHandleRow: { alignItems: "center", paddingTop: spacing.sm },
  sheetHandle: { width: 44, height: 5, borderRadius: radii.pill },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
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
