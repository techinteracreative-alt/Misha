/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const palette = {
  text: '#f8f7ff',
  tint: '#ff6b35',
  background: '#090a18',
  foreground: '#f8f7ff',
  card: '#12142a',
  cardForeground: '#f8f7ff',
  primary: '#ff6b35',
  primaryForeground: '#160a13',
  secondary: '#181b35',
  secondaryForeground: '#f8f7ff',
  muted: '#171a32',
  mutedForeground: '#9296b8',
  accent: '#27e3df',
  accentForeground: '#07141c',
  destructive: '#ff5c7c',
  destructiveForeground: '#ffffff',
  border: '#292d50',
  input: '#202442',
};

const colors = {
  light: palette,
  dark: palette,
  radius: 8,
};

export default colors;
