export const colors = {
  background: '#0A0A0F',
  surface: '#13131A',
  elevated: '#1C1C26',
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  border: '#2D2D3D',
  text: {
    primary: '#F8FAFF',
    secondary: '#9CA3AF',
    muted: '#6B7280',
    inverse: '#0A0A0F',
  },
  overlay: 'rgba(0,0,0,0.7)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.text.primary },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text.primary },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.text.primary },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text.primary },
  caption: { fontSize: 13, fontWeight: '400' as const, color: colors.text.secondary },
  label: { fontSize: 12, fontWeight: '500' as const, color: colors.text.muted },
};
