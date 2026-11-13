import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

// PLACEHOLDER TOKENS: docs/DESIGN_BRIEF.md is missing and the Figma MCP was rate-limited
// during Phase 0. Agent A must reconcile these values with Figma. Names are the contract;
// values may change. Hex is allowed ONLY in this file.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Contract breakpoints REPLACE Tailwind's defaults (no xl/2xl).
    screens: { sm: '390px', md: '834px', lg: '1440px' },
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
        // Badge art tiers (BadgeArt): sky = Everyday, leaf = Growing, sun = Bright, bloom = Shining, lock = not earned yet.
        // Used as text-/fill-/stroke- classes; gradient stops use stop-color: currentColor.
        badge: {
          sky: { 200: '#BAE6FD', 400: '#38BDF8', 600: '#0284C7', 800: '#0C4A6E' },
          leaf: { 200: '#A7F3D0', 400: '#34D399', 600: '#059669', 800: '#064E3B' },
          sun: { 200: '#FEF08A', 400: '#FBBF24', 600: '#EA580C', 800: '#7C2D12' },
          bloom: { 200: '#F5D0FE', 400: '#C084FC', 600: '#9333EA', 800: '#581C87' },
          lock: { 200: '#F1F5F9', 400: '#E2E8F0', 600: '#CBD5E1', 800: '#94A3B8' },
        },
      },
      borderRadius: { sm: '6px', md: '10px', lg: '16px', xl: '24px' },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.08)',
        raised: '0 4px 12px rgba(15,23,42,0.10)',
        focus: '0 0 0 2px #FFFFFF, 0 0 0 4px #4338CA',
      },
      // Motion tokens. Durations stay within 120-300ms; only transform and opacity are animated.
      transitionDuration: { fast: '120ms', base: '200ms', slow: '300ms' },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
        enter: 'cubic-bezier(0, 0, 0.2, 1)',
        exit: 'cubic-bezier(0.4, 0, 1, 1)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'sheet-up': { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pop: { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer: { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(100%)' } },
        // Badge art. Slow and soft: nothing faster than a ~3s loop, no flashing.
        'badge-glow': { '0%, 100%': { opacity: '0.25', transform: 'scale(0.97)' }, '50%': { opacity: '0.6', transform: 'scale(1.05)' } },
        'badge-twinkle': { '0%, 100%': { opacity: '0', transform: 'scale(0.5)' }, '50%': { opacity: '1', transform: 'scale(1)' } },
        'badge-shine': { from: { transform: 'translateX(-70px)' }, to: { transform: 'translateX(70px)' } },
        'badge-pop': { '0%': { opacity: '0', transform: 'scale(0.6)' }, '60%': { opacity: '1', transform: 'scale(1.08)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in 200ms cubic-bezier(0, 0, 0.2, 1) backwards',
        'fade-out': 'fade-out 160ms cubic-bezier(0.4, 0, 1, 1) forwards',
        'slide-up': 'slide-up 300ms cubic-bezier(0, 0, 0.2, 1) backwards',
        'sheet-up': 'sheet-up 240ms cubic-bezier(0, 0, 0.2, 1) backwards',
        pop: 'pop 200ms cubic-bezier(0, 0, 0.2, 1) backwards',
        shimmer: 'shimmer 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'badge-glow': 'badge-glow 4s ease-in-out infinite',
        'badge-twinkle': 'badge-twinkle 3.6s ease-in-out infinite',
        'badge-shine': 'badge-shine 900ms cubic-bezier(0.2, 0, 0, 1) 1',
        'badge-pop': 'badge-pop 600ms cubic-bezier(0, 0, 0.2, 1) backwards',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    // `motion-ok:` applies only when the user has not asked for reduced motion, either through the OS
    // (prefers-reduced-motion) or the app setting (<html data-motion="reduced">). Use it for any movement.
    plugin(({ addVariant }) => {
      addVariant('motion-ok', '@media (prefers-reduced-motion: no-preference) { :root:not([data-motion="reduced"]) & }');
    }),
  ],
} satisfies Config;
