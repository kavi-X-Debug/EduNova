import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

// PLACEHOLDER TOKENS: docs/DESIGN_BRIEF.md is missing and the Figma MCP was rate-limited
// during Phase 0. Agent A must reconcile these values with Figma. Names are the contract;
// values may change. Hex is allowed ONLY in this file.
// ---- Motion round 2 (fx-*). Keep this block self-contained; spread into the theme below. ----
// Only transform/opacity/stroke-dashoffset. Loops are finite (they settle) and are gated by `motion-ok:` in markup.
const fxKeyframes = {
  'fx-float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
  'fx-drift': { '0%,100%': { transform: 'translate3d(0,0,0)' }, '50%': { transform: 'translate3d(14px,-18px,0)' } },
  'fx-wave': {
    '0%,100%': { transform: 'rotate(0deg)' },
    '15%': { transform: 'rotate(14deg)' },
    '30%': { transform: 'rotate(-8deg)' },
    '45%': { transform: 'rotate(14deg)' },
    '60%': { transform: 'rotate(-4deg)' },
    '75%': { transform: 'rotate(10deg)' },
  },
  'fx-wiggle': { '0%,100%': { transform: 'rotate(0deg)' }, '25%': { transform: 'rotate(-10deg)' }, '50%': { transform: 'rotate(8deg)' }, '75%': { transform: 'rotate(-4deg)' } },
  'fx-bounce': { '0%,100%': { transform: 'translateY(0)' }, '40%': { transform: 'translateY(-4px)' }, '70%': { transform: 'translateY(1px)' } },
  'fx-nudge': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-3px)' } },
  'fx-draw': { from: { strokeDashoffset: '1' }, to: { strokeDashoffset: '0' } },
  'fx-unlock': { '0%': { opacity: '0', transform: 'scale(0.8)' }, '60%': { opacity: '1', transform: 'scale(1.12)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
  'fx-sheen': { from: { transform: 'translateX(-130%) skewX(-18deg)' }, to: { transform: 'translateX(330%) skewX(-18deg)' } },
  'fx-fill-shimmer': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(100%)' } },
  'fx-bubble-left': { from: { opacity: '0', transform: 'translate(-12px, 6px)' }, to: { opacity: '1', transform: 'translate(0, 0)' } },
  'fx-bubble-right': { from: { opacity: '0', transform: 'translate(12px, 6px)' }, to: { opacity: '1', transform: 'translate(0, 0)' } },
  'fx-typing': { '0%,60%,100%': { transform: 'translateY(0)', opacity: '0.45' }, '30%': { transform: 'translateY(-4px)', opacity: '1' } },
  'fx-pop-in': { '0%': { opacity: '0', transform: 'scale(0.85)' }, '70%': { opacity: '1', transform: 'scale(1.04)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
  'fx-menu-pop': { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
  'fx-card-in': { from: { opacity: '0', transform: 'translateY(14px) scale(0.98)' }, to: { opacity: '1', transform: 'translateY(0) scale(1)' } },
  'fx-line-grow': { from: { transform: 'scaleY(0)' }, to: { transform: 'scaleY(1)' } },
};
const fxAnimation = {
  'fx-float': 'fx-float 6s ease-in-out 3',
  'fx-drift': 'fx-drift 16s ease-in-out 2',
  'fx-wave': 'fx-wave 1.4s ease-in-out 500ms 1 backwards',
  'fx-wiggle': 'fx-wiggle 500ms ease-in-out 1',
  'fx-bounce': 'fx-bounce 450ms cubic-bezier(0, 0, 0.2, 1) 1',
  'fx-nudge': 'fx-nudge 2.4s ease-in-out 1s 3',
  'fx-draw': 'fx-draw 400ms cubic-bezier(0.2, 0, 0, 1) 100ms backwards',
  'fx-unlock': 'fx-unlock 420ms cubic-bezier(0, 0, 0.2, 1) backwards',
  'fx-sheen': 'fx-sheen 700ms cubic-bezier(0.2, 0, 0, 1) 1',
  'fx-fill-shimmer': 'fx-fill-shimmer 2.4s ease-in-out 800ms 2',
  'fx-bubble-left': 'fx-bubble-left 280ms cubic-bezier(0, 0, 0.2, 1) backwards',
  'fx-bubble-right': 'fx-bubble-right 280ms cubic-bezier(0, 0, 0.2, 1) backwards',
  'fx-typing': 'fx-typing 1.4s ease-in-out infinite',
  'fx-pop-in': 'fx-pop-in 300ms cubic-bezier(0, 0, 0.2, 1) backwards',
  'fx-menu-pop': 'fx-menu-pop 160ms cubic-bezier(0, 0, 0.2, 1) backwards',
  'fx-card-in': 'fx-card-in 480ms cubic-bezier(0, 0, 0.2, 1) backwards',
  'fx-line-grow': 'fx-line-grow 500ms cubic-bezier(0.2, 0, 0, 1) 150ms backwards',
};
const fxShadow = { 'fx-glow': '0 10px 28px rgba(67,56,202,0.16), 0 2px 6px rgba(15,23,42,0.08)' };
// ---- end Motion round 2 ----

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Hover styles only where a real hover exists (no sticky hover on touch).
  future: { hoverOnlyWhenSupported: true },
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
      },
      borderRadius: { sm: '6px', md: '10px', lg: '16px', xl: '24px' },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.08)',
        raised: '0 4px 12px rgba(15,23,42,0.10)',
        focus: '0 0 0 2px #FFFFFF, 0 0 0 4px #4338CA',
        ...fxShadow,
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
        ...fxKeyframes,
      },
      animation: {
        'fade-in': 'fade-in 200ms cubic-bezier(0, 0, 0.2, 1) backwards',
        'fade-out': 'fade-out 160ms cubic-bezier(0.4, 0, 1, 1) forwards',
        'slide-up': 'slide-up 300ms cubic-bezier(0, 0, 0.2, 1) backwards',
        'sheet-up': 'sheet-up 240ms cubic-bezier(0, 0, 0.2, 1) backwards',
        pop: 'pop 200ms cubic-bezier(0, 0, 0.2, 1) backwards',
        shimmer: 'shimmer 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        ...fxAnimation,
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
