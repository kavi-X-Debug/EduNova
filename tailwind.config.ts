import type { Config } from 'tailwindcss';

// PLACEHOLDER TOKENS: docs/DESIGN_BRIEF.md is missing and the Figma MCP was rate-limited
// during Phase 0. Agent A must reconcile these values with Figma. Names are the contract;
// values may change. Hex is allowed ONLY in this file.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#EEF2FF', 100: '#E0E7FF', 500: '#4F46E5', 600: '#4338CA', 700: '#3730A3' },
        accent: { 500: '#F59E0B', 600: '#D97706' },
        success: { 50: '#ECFDF5', 500: '#10B981', 700: '#047857' },
        warning: { 50: '#FFFBEB', 500: '#F59E0B', 700: '#B45309' },
        danger: { 50: '#FEF2F2', 500: '#EF4444', 700: '#B91C1C' },
        surface: { DEFAULT: '#FFFFFF', muted: '#F8FAFC', sunken: '#F1F5F9' },
        ink: { DEFAULT: '#0F172A', soft: '#475569', faint: '#94A3B8' },
        line: { DEFAULT: '#E2E8F0', strong: '#CBD5E1' },
      },
      borderRadius: { sm: '6px', md: '10px', lg: '16px', xl: '24px' },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.08)',
        raised: '0 4px 12px rgba(15,23,42,0.10)',
        focus: '0 0 0 2px #FFFFFF, 0 0 0 4px #4338CA',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', 'system-ui', 'sans-serif'],
      },
      screens: { sm: '390px', md: '834px', lg: '1440px' },
    },
  },
  plugins: [],
} satisfies Config;
