# Happy Homes Jaipur — Master Project Context & AI Handoff Document

> **How to use this file:** Share or copy-paste this document into any AI (ChatGPT, Claude, Gemini, Cursor, Windsurf) at the start of any conversation. It gives complete, comprehensive context about the company, identity, tech stack, codebase, design system, past decisions, and future roadmap.

---

## 1. Executive Summary & Brand Identity

* **Company Name:** Happy Homes
* **Location:** Jaipur, Rajasthan (Focus: Jagatpura, Kusum Vihar, Vidhyadhar Nagar, OBC Colony)
* **Core Identity:** **Architectural Builders & Direct Developers** (STRICT RULE: NOT property dealers, brokers, agents, or middleman consultants).
* **Business Model:** Happy Homes builds, develops, and sells its **own** exclusive residential assets directly to buyers:
  * Turnkey Luxury Villas
  * Boutique Independent Floors
  * Master-Planned JDA Approved Freehold Plots (Section 90-A)
* **Value Proposition:** End-to-end structural control, high-grade construction materials (Tata Tiscon Fe-550D, German UPVC soundproofing, Statuario/Botticino Italian marble), strict JDA Section 90-A title compliance, zero dealer markups, and direct builder accountability.

---

## 2. Core Linguistic & Tone of Voice Rules (Strict Anti-Broker Guardrails)

When writing copy or code for Happy Homes, enforce these terms:

| ❌ NEVER USE (Broker / Dealer Language) | ✅ ALWAYS USE (Builder / Developer Language) |
| :--- | :--- |
| "Property Dealers", "Brokers", "Agents" | "Architectural Builders", "Direct Developers", "Master-Planned Builders" |
| "Listings", "Inventory", "Market Aggregator" | "Developments", "Projects", "Residences", "Estates" |
| "We source properties from sellers" | "We construct, engineer, and develop our own projects" |
| "Brokerage Advisory", "Property Consultancy" | "Construction Project Desk", "Builder Consultation" |
| "Broker commission", "Advisory fee" | "Development value", "Milestone-based construction cost" |
| "Due diligence on seller properties" | "Rigorous site vetting, structural audits, and JDA 90-A engineering" |
| "Request Private Access / Brokered Deal" | "Schedule Builder Consultation / Request Construction Feasibility" |

---

## 3. Tech Stack & Architecture

* **Frontend Framework:** React 19 + TypeScript (`.tsx`)
* **Bundler & Build Tool:** Vite 6
* **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` plugin)
* **Icons:** `lucide-react`
* **Animations:** `motion` (`motion/react` & `framer-motion`)
* **Charting / Visualization:** `recharts`
* **Deployment Target:** Vercel (Configured with `vercel.json` SPA rewrites and hardened HTTP security headers)
* **Domain:** `happyhomesjaipur.com` & `www.happyhomesjaipur.com` (Registered via Hostinger, DNS connected to Vercel)

---

## 4. UI/UX Design System Specifications

### A. Color Palette (Architectural Luxury / Warm Minimalist)
* **Canvas / Background:** `#F8F8F8` (Warm Off-White / Alabaster)
* **Surface / Cards:** `#FFFFFF` (Pristine White) with border `border-black/10` or `border-black/5`
* **Obsidian Charcoal (Primary Text & Accents):** `#141414` / `#1A1A1A`
* **Muted Editorial Greys:** `#4B4B4B`, `#555555`, `#666666`, `#737373`
* **Architectural Terracotta Accent:** `#B5623A` (Warm terracotta/brick tone used for micro-highlights, progress bars, check icons, and focal text)
* **Dark Surfaces (Footer & Night Accents):** `#121212` / `#141414`

### B. Typography & Micro-Design
* **Headings:** Editorial serif / sans-serif with light & extralight weights (`font-light`, `tracking-[-0.03em]`, tight leading `leading-[1.05]`).
* **Sub-labels & Eyebrows:** Monospace uppercase with wide tracking (`text-[10px]` or `text-[11px]`, `font-mono uppercase tracking-[0.25em]`).
* **Border Radii:** Soft architectural curves — pill buttons (`rounded-full`), cards (`rounded-2xl` to `rounded-[2rem]`).
* **Buttons:** High-contrast pill buttons (`bg-[#141414] text-white rounded-full` or `border border-[#141414] rounded-full hover:bg-[#141414] hover:text-white`).

---

## 5. Directory Structure & Key Files

```text
/
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── index.html                # Main HTML entry with SEO metadata
├── package.json              # Dependencies and scripts (dev, build, lint)
├── tsconfig.json             # TypeScript configuration
├── vercel.json               # Vercel configuration (SPA rewrites + security headers)
├── vite.config.ts            # Vite configuration with Tailwind CSS v4
├── public/
│   ├── assets/               # Images and public static assets
│   ├── sitemap.xml           # Static sitemap for SEO
│   └── happy-homes-*.zip     # Deployment artifacts
└── src/
    ├── main.tsx              # React mounting root
    ├── App.tsx               # Primary page layout integrating all sections
    ├── index.css             # Tailwind CSS imports & global styles
    └── components/
        ├── Navbar.tsx        # Floating pill navigation with section tracker & modal trigger
        ├── Hero.tsx          # Full-viewport architectural hero with live stats & primary CTA
        ├── AboutUs.tsx       # Company philosophy: Master builders vs speculative market
        ├── Investment.tsx    # 3 Asset pathways: Turnkey Villa, Independent Floor, JDA Plot
        ├── Properties.tsx    # Construction portfolio grid & detailed architectural blueprint modal
        ├── CostEstimator.tsx # Interactive construction & valuation budget calculator
        ├── StudioGuild.tsx   # 4 Specialized construction divisions & execution pillars
        ├── HowItWorks.tsx    # 4-Stage construction roadmap from mandate to handover
        ├── JaipurCorridors.tsx # Cartographic sector breakdown (Jagatpura, Kusum Vihar, etc.)
        ├── Craftsmanship.tsx# 4 Forensic construction vetting protocols
        ├── Testimonials.tsx  # Verified homeowner case studies & testimonials
        ├── FaqSection.tsx    # Categorized accordion FAQs (JDA 90-A, build quality, NRI desk)
        ├── ContactSection.tsx# Direct office coordinates, contact form, and WhatsApp hotline
        ├── Footer.tsx        # Minimal dark architectural footer with quick links & coordinates
        ├── ConsultationModal.tsx # Universal booking modal with project type selector
        ├── PropertyBlueprint.tsx # Detailed specification inspector
        └── Logo.tsx          # Custom SVG architectural brand crest and wordmark
```

---

## 6. Page Layout Hierarchy (Top to Bottom)

1. **`Navbar`**: Floating backdrop-blur pill with quick jump links (`ABOUT`, `PROPERTIES`, `ESTIMATOR`, `CORRIDORS`, `ADVISORY`) and `BUILDER CONSULTATION` CTA.
2. **`Hero`**: Architectural headline *"Bespoke villas, independent floors, and freehold plots built with structural discipline"*, video/photo background, metrics (`₹500Cr+`, `100% JDA Patta`, `1,200+ Homes`).
3. **`AboutUs`**: Details Happy Homes' architectural precision vs roadside brokers.
4. **`Investment`**: Three core build categories (Turnkey Luxury Villa, Independent Floor, JDA Freehold Plot).
5. **`Properties`**: Showcase of actual project builds with blueprints, floor plans, and specs modal.
6. **`CostEstimator`**: Interactive calculator allowing buyers to estimate build costs by area, floors, and specifications.
7. **`StudioGuild`**: The 4 construction divisions (Villa Construction, Structural Standards, NRI Remote Desk, Project Milestones).
8. **`HowItWorks`**: The 30-day timeline: Discovery → Engineering Audit → Construction Terms → Handover & Mutation.
9. **`JaipurCorridors`**: Growth corridors analyzed with infrastructure, Bisalpur sweet water grid, and road widths.
10. **`Craftsmanship`**: The 4 forensic audits behind every site (JDA 90-A, 30-year sub-registrar check, bank clearance, civic utilities).
11. **`Testimonials`**: Client stories from families and NRI investors who built with Happy Homes.
12. **`FaqSection`**: Deep-dive answers addressing legal tenure, remote build monitoring, and registry fees.
13. **`ContactSection`**: Physical office address (172, Kusum Vihar, Vidhyadhar Nagar, Jagatpura), WhatsApp button, and contact form.
14. **`Footer`**: Brand credits, coordinates (`26.8184° N, 75.8752° E`), and copyright.

---

## 7. Deployment & Security Setup (Vercel + Hostinger)

* **Vercel Config (`vercel.json`):**
  * Rewrites all routes to `/index.html` for single-page application routing.
  * Security headers enabled:
    * `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
    * `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
    * `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
    * `Referrer-Policy: origin-when-cross-origin`
    * `Permissions-Policy: camera=(), microphone=(), geolocation=()`
* **Hostinger Custom Domain DNS:**
  * **A Record (`@`):** `216.198.79.1` (or Vercel designated IP `76.76.21.21`)
  * **CNAME Record (`www`):** `7ad1ae2ef748d494.vercel-dns-017.com` (or `cname.vercel-dns.com`)

---

## 8. Contacts & Official Coordinates

* **Phone / WhatsApp:** `+91 91660 54964`
* **Email:** `contact@happyhomesjpr.com`
* **Headquarters:** 172, Near Suresh Gyan Vihar University, Kusum Vihar, Vidhyadhar Nagar, OBC Colony, Jagatpura, Jaipur, Rajasthan 303905
* **Geo-Coordinates:** `26.8184° N, 75.8752° E`
