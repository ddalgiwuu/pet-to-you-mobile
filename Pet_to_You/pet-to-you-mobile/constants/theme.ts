/**
 * Toss-inspired Design System for Pet to You
 * Colors, typography, spacing, and animation tokens
 */

export const colors = {
  primary: '#FF6B9D',
  secondary: '#4ECDC4',
  accent: '#FFE66D',
  success: '#95E1D3',
  error: '#FF6B6B',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  border: '#E5E7EB',
  text: {
    primary: '#191919',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
  },
  gradients: {
    primary: ['#FF6B9D', '#FF8FAB'],
    card: ['#FFFFFF', '#F8F9FA'],
    glow: ['rgba(255,107,157,0.3)', 'transparent'],
  },
} as const;

export const typography = {
  heading1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const animations = {
  // Spring presets
  spring: {
    gentle: { damping: 20, stiffness: 90 },
    bouncy: { damping: 15, stiffness: 150 },
    snappy: { damping: 25, stiffness: 200 },
  },
  // Duration presets
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
} as const;
