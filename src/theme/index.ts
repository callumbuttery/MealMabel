import {
  Platform,
  useColorScheme,
  type TextStyle,
  type ViewStyle,
} from "react-native";

export const colors = {
  cream: "#F3EFE7",
  creamDeep: "#FFF7EC",
  oat: "#F0DCC2",
  cocoa: "#2A1B12",
  cocoaSoft: "#5C4A3D",
  brown: "#93765F",
  coral: "#FF5A36",
  coralDark: "#E23F1D",
  peach: "#FFDDCE",
  peachDeep: "#FFD9B3",
  sage: "#2F9E4F",
  sageDark: "#1F6B33",
  sageSoft: "#D8F3DC",
  mustard: "#FFC93C",
  mustardSoft: "#FFF1C7",
  butter: "#FFEEDB",
  white: "#FFFFFF",
  charcoal: "#231A14",
  charcoalSoft: "#C9B9A9",
  inkLight: "#FBF2E7",
  danger: "#E2483D",
  transparent: "transparent",
} as const;

export const lightColors = {
  background: colors.creamDeep,
  surface: colors.white,
  surfaceMuted: colors.butter,
  text: colors.cocoa,
  textMuted: colors.brown,
  border: colors.oat,
  primary: colors.coral,
  primaryPressed: colors.coralDark,
  primaryContrast: colors.white,
  accent: colors.sage,
  accentSoft: colors.sageSoft,
  accentDark: colors.sageDark,
  warning: colors.mustard,
  warningSoft: colors.mustardSoft,
  danger: colors.danger,
  overlay: "rgba(42, 27, 18, 0.48)",
  shadow: colors.cocoa,
} as const;

export const darkColors = {
  background: colors.charcoal,
  surface: "#33261E",
  surfaceMuted: "#403025",
  text: colors.inkLight,
  textMuted: colors.charcoalSoft,
  border: "#5A4638",
  primary: "#FF7452",
  primaryPressed: colors.peach,
  primaryContrast: colors.charcoal,
  accent: "#5FBE7C",
  accentSoft: "#28402E",
  accentDark: colors.sageSoft,
  warning: "#FFD666",
  warningSoft: "#3F3722",
  danger: "#F08078",
  overlay: "rgba(0, 0, 0, 0.62)",
  shadow: "#000000",
} as const;

export type MealMabelColors = {
  [Key in keyof typeof lightColors]: string;
};

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
} as const;

export const radii = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const fontFamily = {
  headingBold: "SpaceGrotesk_700Bold",
  headingSemiBold: "SpaceGrotesk_600SemiBold",
  headingMedium: "SpaceGrotesk_500Medium",
  bodyRegular: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  bodyBold: "DMSans_700Bold",
} as const;

export const typography = {
  display: {
    fontFamily: fontFamily.headingBold,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: fontFamily.headingBold,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: fontFamily.headingBold,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: fontFamily.headingBold,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "700",
  },
  body: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 16,
    lineHeight: 25,
    fontWeight: "400",
  },
  bodyStrong: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    lineHeight: 25,
    fontWeight: "700",
  },
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  caption: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  button: {
    fontFamily: fontFamily.headingBold,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
} as const satisfies Record<string, TextStyle>;

const shadowColor = colors.cocoa;

export const shadows = {
  none: {},
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
    },
    android: { elevation: 2 },
    web: { boxShadow: "0 4px 10px rgba(42, 27, 18, 0.06)" },
    default: {},
  }),
  md: Platform.select<ViewStyle>({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.09,
      shadowRadius: 20,
    },
    android: { elevation: 5 },
    web: { boxShadow: "0 12px 28px rgba(42, 27, 18, 0.09)" },
    default: {},
  }),
  lg: Platform.select<ViewStyle>({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.14,
      shadowRadius: 28,
    },
    android: { elevation: 9 },
    web: { boxShadow: "0 16px 36px rgba(42, 27, 18, 0.14)" },
    default: {},
  }),
} as const;

export const layout = {
  minTouchTarget: 44,
  maxContentWidth: 720,
  screenGutter: spacing.lg,
} as const;

export function useMealMabelTheme(): MealMabelColors {
  return useColorScheme() === "dark" ? darkColors : lightColors;
}

export type TypographyToken = keyof typeof typography;
