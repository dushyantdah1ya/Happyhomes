# Happy Homes — UI/UX Design System & Architectural Aesthetic Guide

## 1. Visual Philosophy: "Architectural Editorial Luxury"
The website avoids generic SaaS templates, loud gradient banners, or cheap property portal aesthetics. Instead, it mirrors high-end architectural monographs and luxury European shelter publications (like *Architectural Digest*, *Kinfolk*, and *Cereal*).

---

## 2. Color Palette & Token Hierarchy

| Token Name | Hex Code | Tailwind Equivalent | Usage |
| :--- | :--- | :--- | :--- |
| **Alabaster Canvas** | `#F8F8F8` | `bg-[#F8F8F8]` | Page background, alternating section backgrounds |
| **Pristine Surface** | `#FFFFFF` | `bg-white` | Cards, modals, contrast elements |
| **Obsidian Charcoal** | `#141414` / `#1A1A1A` | `text-[#141414]`, `bg-[#141414]` | Primary typography, CTA buttons, dark accents |
| **Muted Charcoal** | `#4B4B4B` / `#555555` | `text-[#4B4B4B]`, `text-[#555]` | Body text, sub-descriptions |
| **Editorial Grey** | `#666666` / `#737373` | `text-[#666]`, `text-[#737373]` | Captions, stats labels, meta badges |
| **Architectural Terracotta** | `#B5623A` | `text-[#B5623A]`, `bg-[#B5623A]` | Accent highlights, active progress bars, checkmarks |
| **Soft Border / Hairline** | `rgba(0, 0, 0, 0.1)` | `border-black/10`, `border-black/5` | Structural hairline dividers and card outlines |
| **Nocturne Base** | `#121212` | `bg-[#121212]` | Deep dark footer background |

---

## 3. Typography Rules

1. **Headings (`h1`, `h2`, `h3`):**
   * Font Weight: `font-light` (300) or `font-extralight` (200)
   * Letter Spacing: `tracking-[-0.03em]`
   * Line Height: `leading-[1.05]` to `leading-[1.1]`
   * Punctuation & Style: High-contrast mix where keywords receive italic or terracotta accents (`<span className="text-[#B5623A] font-light">...</span>`).

2. **Eyebrow Tags & Metadata:**
   * Style: Monospace uppercase
   * Class: `text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#737373]`

3. **Numeric Data & Metrics:**
   * Style: Monospace light
   * Class: `text-2xl sm:text-3xl font-light font-mono text-[#141414]`

4. **Body Copy:**
   * Class: `text-[13px] sm:text-[14px] text-[#555] font-light leading-relaxed`

---

## 4. Component Design Patterns

### Floating Navigation Pill
* **Shape:** Fully rounded capsule (`rounded-full`)
* **Effect:** Backdrop blur (`backdrop-blur-lg bg-white/10 border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.03)]`)
* **Behavior:** Fades down when scrolling down; springs back into full focus when scrolling up or hovering.

### Interactive Steppers & Filters
* **Chips:** Rounded pills (`rounded-full`) with active indicator line and animated time bars (`framer-motion`).
* **Active State:** Solid obsidian (`bg-[#141414] text-white`) with thin terracotta bottom accent bar.
* **Inactive State:** Soft grey (`bg-[#F8F8F8] text-[#666] border border-black/10 hover:border-black/30`).

### Cards & Modular Grids
* **Corner Radius:** `rounded-2xl` for cards, `rounded-[2rem]` for major feature containers.
* **Borders:** Thin, crisp `border border-black/10`.
* **Hover State:** Gentle image scale (`group-hover:scale-105 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`) with zero layout shift.

### Call-to-Action (CTA) Buttons
* **Primary:** `bg-[#141414] hover:bg-black text-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] rounded-full inline-flex items-center gap-2 transition-all`
* **Secondary:** `border border-[#141414] hover:bg-[#141414] hover:text-white text-[#141414] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] rounded-full inline-flex items-center gap-2 transition-all`
* **Icon:** Accompanied by `<ArrowUpRight size={13} />` icon.

---

## 5. Animation & Micro-Interactions
* **Motion Library:** `motion` (`motion/react` / `framer-motion`)
* **Timing Curves:** `ease: [0.16, 1, 0.3, 1]` (architectural spring/deceleration)
* **Auto-rotation Timers:** 8-second cycles on Steppers and Pillars with automatic pause on user hover or click.
