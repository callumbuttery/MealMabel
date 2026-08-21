import { StyleSheet, View } from 'react-native';

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
  rotate = '0deg',
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

const styles = StyleSheet.create({
  blob: { position: 'absolute' },
});
