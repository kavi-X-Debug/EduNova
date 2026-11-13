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

// ---- Game motion (gx-*). Gentle and finite: transform/opacity only, nothing faster than ~400ms, no flashing. Gate in markup with `motion-ok:`. ----
const gxKeyframes = {
  'gx-pop': { '0%': { transform: 'scale(0.97)' }, '55%': { transform: 'scale(1.035)' }, '100%': { transform: 'scale(1)' } },
  'gx-glow': { '0%': { opacity: '0', transform: 'scale(0.96)' }, '40%': { opacity: '0.7', transform: 'scale(1.02)' }, '100%': { opacity: '0', transform: 'scale(1.06)' } },
  'gx-sparkle': {
    '0%': { opacity: '0', transform: 'translateY(4px) scale(0.4)' },
    '35%': { opacity: '1', transform: 'translateY(-2px) scale(1)' },
    '100%': { opacity: '0', transform: 'translateY(-14px) scale(0.8)' },
  },
  'gx-nudge-x': { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-4px)' }, '60%': { transform: 'translateX(3px)' }, '85%': { transform: 'translateX(-1px)' } },
  'gx-fade-up': { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
  'gx-star-pop': { '0%': { opacity: '0.4', transform: 'scale(0.6)' }, '60%': { opacity: '1', transform: 'scale(1.18)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
  'gx-star-float': { '0%,100%': { transform: 'translateY(0) rotate(0deg)' }, '50%': { transform: 'translateY(-10px) rotate(6deg)' } },
  'gx-zoom': { from: { transform: 'scale(1)' }, to: { transform: 'scale(1.08)' } },
  'gx-fly-up': {
    '0%': { opacity: '0', transform: 'translateY(28px) scale(0.92)' },
    '25%': { opacity: '1', transform: 'translateY(12px) scale(1)' },
    '75%': { opacity: '1', transform: 'translateY(-14px) scale(1)' },
    '100%': { opacity: '0', transform: 'translateY(-34px) scale(0.96)' },
  },
  'gx-rise': { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
  'gx-bob': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
  'gx-hop': { '0%': { transform: 'translateY(0) scale(1)' }, '30%': { transform: 'translateY(0) scale(1.06, 0.94)' }, '60%': { transform: 'translateY(-10px) scale(1)' }, '100%': { transform: 'translateY(0) scale(1)' } },
};
const gxAnimation = {
  'gx-pop': 'gx-pop 450ms cubic-bezier(0, 0, 0.2, 1) 1',
  'gx-glow': 'gx-glow 900ms ease-out 1 forwards',
  'gx-sparkle': 'gx-sparkle 1400ms ease-out 1 backwards',
  'gx-nudge-x': 'gx-nudge-x 700ms ease-in-out 1',
  'gx-fade-up': 'gx-fade-up 420ms cubic-bezier(0, 0, 0.2, 1) 1 backwards',
  'gx-star-pop': 'gx-star-pop 450ms cubic-bezier(0, 0, 0.2, 1) 1 backwards',
  'gx-star-float': 'gx-star-float 5s ease-in-out 2',
  'gx-zoom': 'gx-zoom 14s ease-out 1 forwards',
  'gx-fly-up': 'gx-fly-up 3200ms ease-in-out 1 forwards',
  'gx-rise': 'gx-rise 450ms cubic-bezier(0, 0, 0.2, 1) 1 backwards',
  'gx-bob': 'gx-bob 4s ease-in-out 3',
  'gx-hop': 'gx-hop 600ms cubic-bezier(0, 0, 0.2, 1) 1',
};
// ---- Maths and Mixed game art motion (gx-maths-*). Same rules as gx-*. ----
const gxMathsKeyframes = {
  'gx-maths-hop': { '0%': { transform: 'translateY(0) scale(1, 1)' }, '45%': { transform: 'translateY(-26px) scale(0.96, 1.05)' }, '85%': { transform: 'translateY(0) scale(1.08, 0.92)' }, '100%': { transform: 'translateY(0) scale(1, 1)' } },
  'gx-maths-wobble': { '0%,100%': { transform: 'rotate(0deg)' }, '25%': { transform: 'rotate(-7deg)' }, '60%': { transform: 'rotate(6deg)' }, '85%': { transform: 'rotate(-2deg)' } },
  'gx-maths-wave': { '0%,100%': { transform: 'rotate(0deg)' }, '30%': { transform: 'rotate(6deg)' }, '65%': { transform: 'rotate(-5deg)' } },
  'gx-maths-pulse': { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.18)' } },
  'gx-maths-shine': { '0%,100%': { transform: 'translateY(0) scale(1)' }, '50%': { transform: 'translateY(-3px) scale(1.03)' } },
  'gx-maths-grow': { from: { transform: 'scale(1)' }, to: { transform: 'scale(1.25)' } },
};
const gxMathsAnimation = {
  'gx-maths-hop': 'gx-maths-hop 560ms cubic-bezier(0.3, 0, 0.3, 1) 1',
  'gx-maths-wobble': 'gx-maths-wobble 650ms ease-in-out 1',
  'gx-maths-wave': 'gx-maths-wave 3s ease-in-out 2',
  'gx-maths-pulse': 'gx-maths-pulse 3.2s ease-in-out 3',
  'gx-maths-shine': 'gx-maths-shine 4s ease-in-out 3',
  'gx-maths-grow': 'gx-maths-grow 900ms cubic-bezier(0, 0, 0.2, 1) 1 forwards',
};
// ---- end Maths and Mixed game art motion ----
// ---- end Game motion ----
// ---- Sinhala games art motion (gx-sinhala-*). Same rules as gx-*: transform/opacity only, finite, gated with `motion-ok:`. ----
const gxSinhalaKeyframes = {
  'gx-sinhala-snap': { '0%': { opacity: '0.6', transform: 'translateY(-10px) scale(1.06)' }, '60%': { opacity: '1', transform: 'translateY(2px) scale(0.98)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
  'gx-sinhala-bounce': { '0%': { opacity: '0.5', transform: 'translateY(-12px)' }, '55%': { opacity: '1', transform: 'translateY(3px)' }, '80%': { transform: 'translateY(-2px)' }, '100%': { transform: 'translateY(0)' } },
  'gx-sinhala-underline': { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
  'gx-sinhala-write': { '0%': { opacity: '0', transform: 'translateX(-70px) rotate(-8deg)' }, '30%': { opacity: '1' }, '100%': { opacity: '1', transform: 'translateX(0) rotate(0deg)' } },
  'gx-sinhala-tap': { '0%,100%': { transform: 'translateY(0) rotate(-12deg)' }, '40%': { transform: 'translateY(8px) rotate(-4deg)' } },
  'gx-sinhala-join-l': { from: { transform: 'translateX(-14px)' }, to: { transform: 'translateX(0)' } },
  'gx-sinhala-join-r': { from: { transform: 'translateX(14px)' }, to: { transform: 'translateX(0)' } },
  'gx-sinhala-sweep': { '0%': { transform: 'translateX(0) rotate(-8deg)' }, '50%': { transform: 'translateX(96px) rotate(8deg)' }, '100%': { transform: 'translateX(0) rotate(-8deg)' } },
  'gx-sinhala-rub': { '0%,100%': { transform: 'translateX(-10px) rotate(-6deg)' }, '50%': { transform: 'translateX(10px) rotate(6deg)' } },
  'gx-sinhala-waddle': { '0%,100%': { transform: 'rotate(0deg) translateY(0)' }, '25%': { transform: 'rotate(-4deg) translateY(-2px)' }, '75%': { transform: 'rotate(4deg) translateY(-2px)' } },
  'gx-sinhala-flag': { '0%,100%': { transform: 'rotate(0deg)' }, '30%': { transform: 'rotate(10deg)' }, '70%': { transform: 'rotate(-6deg)' } },
  'gx-sinhala-page': { '0%': { opacity: '0.4', transform: 'scaleX(0.35) rotate(-6deg)' }, '100%': { opacity: '1', transform: 'scaleX(1) rotate(0deg)' } },
};
const gxSinhalaAnimation = {
  'gx-sinhala-snap': 'gx-sinhala-snap 380ms cubic-bezier(0, 0, 0.2, 1) 1',
  'gx-sinhala-bounce': 'gx-sinhala-bounce 520ms cubic-bezier(0, 0, 0.2, 1) 1',
  'gx-sinhala-underline': 'gx-sinhala-underline 700ms cubic-bezier(0.2, 0, 0, 1) 250ms 1 backwards',
  'gx-sinhala-write': 'gx-sinhala-write 900ms ease-out 1 backwards',
  'gx-sinhala-tap': 'gx-sinhala-tap 700ms ease-in-out 3',
  'gx-sinhala-join-l': 'gx-sinhala-join-l 500ms cubic-bezier(0, 0, 0.2, 1) 1 backwards',
  'gx-sinhala-join-r': 'gx-sinhala-join-r 500ms cubic-bezier(0, 0, 0.2, 1) 1 backwards',
  'gx-sinhala-sweep': 'gx-sinhala-sweep 3200ms ease-in-out 2',
  'gx-sinhala-rub': 'gx-sinhala-rub 600ms ease-in-out 3',
  'gx-sinhala-waddle': 'gx-sinhala-waddle 1200ms ease-in-out 2',
  'gx-sinhala-flag': 'gx-sinhala-flag 1600ms ease-in-out 3',
  'gx-sinhala-page': 'gx-sinhala-page 450ms cubic-bezier(0, 0, 0.2, 1) 1',
};
// ---- end Sinhala games art motion ----

// ---- ICT game art motion (gx-ict-*). Gentle, finite, transform/opacity only. Gate in markup with `motion-ok:`. ----
const gxIctKeyframes = {
  'gx-ict-nod': { '0%,100%': { transform: 'translateY(0) rotate(0deg)' }, '30%': { transform: 'translateY(-3px) rotate(-3deg)' }, '65%': { transform: 'translateY(0) rotate(2deg)' } },
  'gx-ict-whisker': { '0%,100%': { transform: 'rotate(0deg)' }, '25%': { transform: 'rotate(-3deg)' }, '55%': { transform: 'rotate(2.5deg)' }, '80%': { transform: 'rotate(-1deg)' } },
  'gx-ict-point': { '0%,100%': { transform: 'translateX(0)' }, '50%': { transform: 'translateX(6px)' } },
  'gx-ict-wobble': { '0%,100%': { transform: 'rotate(0deg)' }, '25%': { transform: 'rotate(-4deg)' }, '60%': { transform: 'rotate(3deg)' }, '85%': { transform: 'rotate(-1deg)' } },
  'gx-ict-shut': { '0%': { transform: 'translateY(-6px) scale(1.06)' }, '55%': { transform: 'translateY(1px) scale(0.96)' }, '100%': { transform: 'translateY(0) scale(1)' } },
  'gx-ict-ring': { '0%': { opacity: '0.7', transform: 'scale(0.7)' }, '100%': { opacity: '0', transform: 'scale(1.35)' } },
  'gx-ict-pulse': { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.08)' } },
  'gx-ict-flow': { '0%': { opacity: '0', transform: 'translateX(-8px)' }, '40%': { opacity: '1' }, '100%': { opacity: '0', transform: 'translateX(8px)' } },
};
const gxIctAnimation = {
  'gx-ict-nod': 'gx-ict-nod 3.6s ease-in-out 2',
  'gx-ict-whisker': 'gx-ict-whisker 3.2s ease-in-out 2',
  'gx-ict-point': 'gx-ict-point 1.4s ease-in-out 3',
  'gx-ict-wobble': 'gx-ict-wobble 1.6s ease-in-out 2',
  'gx-ict-shut': 'gx-ict-shut 520ms cubic-bezier(0, 0, 0.2, 1) 1',
  'gx-ict-ring': 'gx-ict-ring 900ms ease-out 1 forwards',
  'gx-ict-pulse': 'gx-ict-pulse 1.2s ease-in-out 2',
  'gx-ict-flow': 'gx-ict-flow 1.2s ease-in-out 3',
};
// ---- end ICT game art motion ----

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
        // Badge art. Slow and soft: nothing faster than a ~3s loop, no flashing.
        'badge-glow': { '0%, 100%': { opacity: '0.25', transform: 'scale(0.97)' }, '50%': { opacity: '0.6', transform: 'scale(1.05)' } },
        'badge-twinkle': { '0%, 100%': { opacity: '0', transform: 'scale(0.5)' }, '50%': { opacity: '1', transform: 'scale(1)' } },
        'badge-shine': { from: { transform: 'translateX(-70px)' }, to: { transform: 'translateX(70px)' } },
        'badge-pop': { '0%': { opacity: '0', transform: 'scale(0.6)' }, '60%': { opacity: '1', transform: 'scale(1.08)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        ...fxKeyframes,
        ...gxKeyframes,
        ...gxMathsKeyframes,
        ...gxSinhalaKeyframes,
        ...gxIctKeyframes,
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
        ...fxAnimation,
        ...gxAnimation,
        ...gxMathsAnimation,
        ...gxSinhalaAnimation,
        ...gxIctAnimation,
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
