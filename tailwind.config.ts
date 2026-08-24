import type { Config } from 'tailwindcss'

// Tailwind v4 reads its theme from `@theme` in src/assets/main.css (the
// CSS-first config). This file used to duplicate the color palette here,
// but it was never actually loaded (no `@config` import in the CSS), so it
// silently did nothing — that mismatch was the root cause of the dark-mode
// background bug. Kept minimal now; extend here only for JS-only features
// (plugins, safelist) if ever needed.
export default {
  darkMode: 'class',
} satisfies Config