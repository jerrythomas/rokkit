# Backlog: Effects & Visual Enhancements

Priority 3 — Decorative actions and components.

---

## 53. HoverLift, Magnetic, Ripple Actions

**Source:** `docs/requirements/060-effects.md §6–8`

**What's needed:**
- [ ] `use:hoverLift` — translateY + shadow on hover
- [ ] `use:magnetic` — element shifts toward cursor on hover
- [ ] `use:ripple` — CSS-only click ripple (material style)
- [ ] All in `@rokkit/actions` package
- [ ] `prefers-reduced-motion` support

**Priority:** Medium — nice interaction polish, small scope each.

---

## 54. Glow & FloatingBubbles Components

**Source:** `docs/requirements/060-effects.md §9–10`

**What's needed:**
- [ ] `Glow` wrapper component — animated box-shadow glow with optional pulse
- [ ] `FloatingBubbles` — semi-transparent floating particles (CSS animation)
- [ ] Both in `@rokkit/ui`

**Priority:** Low — decorative, useful for marketing pages.

---

## 55. SectionDivider Component

**Source:** `docs/requirements/060-effects.md §11`

**What's needed:**
- [ ] `SectionDivider.svelte` in `@rokkit/ui` — lines scale in from edges, dots pop in center
- [ ] IntersectionObserver trigger
- [ ] Configurable dot count, duration, delay
- [ ] Base CSS + `prefers-reduced-motion` support

**Priority:** Low — decorative polish.

---

## 56. GradientText Utility

**Source:** `docs/requirements/060-effects.md §12`

**What's needed:**
- [ ] `GradientText.svelte` wrapper or CSS utility class
- [ ] Configurable `from`, `to` colors and direction
- [ ] Uses `background-clip: text` approach

**Priority:** Low — visual utility, small scope.

---

## 57. BackgroundOrbs Component

**Source:** `docs/requirements/060-effects.md §13`

**What's needed:**
- [ ] `BackgroundOrbs.svelte` in `@rokkit/ui` — absolute-positioned blurred circles
- [ ] Configurable count, colors, blur, opacity, size
- [ ] Container requires `position: relative; overflow: hidden`

**Priority:** Low — decorative, marketing pages.

## Background Pulsing Orbs

**Reference**: `/Users/Jerry/Work/ai-labs/FizzBot/workspace/apps/app/src/lib/background`
**What's needed:**
- [ ] Analyze and migrate
- [ ] support user prefers 

**Priority:** Low — decorative, background animation.
