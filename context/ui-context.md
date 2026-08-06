⛔ **MANDATORY**: This is the authoritative UI specification. Every color, font, radius, layout pattern, and component convention listed here is a hard constraint. You MUST follow every specification exactly. You MUST NOT deviate from the design system defined here.

# UI Context

## Theme

Dark mode only. No light mode. You MUST NOT implement a light mode or theme toggle. The design language is a professional monochrome dashboard — near-black backgrounds, layered dark surfaces, and white as the primary interactive accent. Visual inspiration is freemodel.dev: clean, modern, technical, and minimal. No decorative gradients or colorful branding — the aesthetic is strictly black, white, and functional grays with state-specific colors (red for errors, green for success) used only where necessary.

## Colors

All components MUST use these CSS variable tokens — you MUST NEVER hardcode hex values anywhere.

| Role            | CSS Variable       | Value    |
| --------------- | ------------------ | -------- |
| Page background | `--bg-base`        | `#0A0A0A` |
| Surface         | `--bg-surface`     | `#141414` |
| Surface raised  | `--bg-surface-alt` | `#1C1C1C` |
| Primary text    | `--text-primary`   | `#FFFFFF` |
| Muted text      | `--text-muted`     | `#A1A1A1` |
| Faint text      | `--text-faint`     | `#525252` |
| Primary accent  | `--accent-primary` | `#FFFFFF` |
| Accent hover    | `--accent-hover`   | `#E5E5E5` |
| Border          | `--border-default` | `#262626` |
| Border muted    | `--border-muted`   | `#1A1A1A` |
| Error           | `--state-error`    | `#EF4444` |
| Success         | `--state-success`  | `#22C55E` |
| Warning         | `--state-warning`  | `#F59E0B` |

> ⛔ **HARD CONSTRAINT**: If a color is not in the table above, it MUST NOT be used. Every color in every component MUST reference a CSS variable from this table. No hardcoded hex, rgb, or hsl values anywhere in component styles.

## Typography

| Role      | Font            | Variable      |
| --------- | --------------- | ------------- |
| UI text   | Inter           | `--font-sans` |
| Code/mono | JetBrains Mono  | `--font-mono` |

You MUST use Inter for all UI text and JetBrains Mono for monospace data (invoice numbers, barcodes, IDs). You MUST NOT use any other font.

Inter is a variable font crafted for screen readability with a tall x-height, ideal for dashboards and data-heavy tables. JetBrains Mono is used for invoice numbers, barcodes, and any monospace data.

## Border Radius

You MUST follow this exact radius scale:

| Context           | Radius |
| ----------------- | ------ |
| Inline / small UI | `6px`  |
| Cards / panels    | `10px` |
| Modals / overlays | `14px` |
| Buttons / inputs  | `8px`  |

Slightly rounded — not sharp, not pill-shaped. You MUST NOT use arbitrary radius values outside this scale.

## Component Library

Two-tier approach:

- **Radix UI** for behavioral primitives (dialogs, menus, dropdowns, tooltips, popovers) — installed via `@radix-ui/react-*` packages. Radix is headless and unstyled — you style everything with the design tokens above.
- **Hand-styled components** as React functional components with co-located `.css` or `.module.css` files — each component owns its own styles
- Reusable shared components live in `components/shared/` (buttons, inputs, cards, modals, tables, badges)

> ⛔ **HARD CONSTRAINT**: You MUST NOT install Material UI, Ant Design, Chakra UI, Mantine, or any other heavy UI framework. Full visual control stays with the developer. Only Radix UI primitives are allowed for behavioral needs.

## Layout Patterns

You MUST implement these exact layout patterns:

- **Desktop: Sidebar layout** — fixed-width left sidebar (240px) with navigation links, main content area fills remaining width, top bar with store name and user avatar
- **Mobile: Bottom navigation bar** — fixed bottom bar with 4-5 primary icons (Dashboard, Inventory, Billing, Khata, More), content scrolls above, no sidebar
- **Sidebar**: Border-right separator (`--border-default`), collapsible on smaller desktop widths
- **Top bar**: Border-bottom separator (`--border-default`), contains page title, search, notifications, user menu
- **Cards/panels**: `--bg-surface` background with `--border-default` border and `10px` radius
- **Modals**: Centered overlay with `--bg-surface-alt` background, backdrop blur (`backdrop-filter: blur(8px)`), `14px` radius
- **Tables**: Full-width with `--border-muted` row separators, `--text-muted` headers, hover row highlight using `--bg-surface-alt`
- **Empty states**: Centered icon + message + CTA button, using `--text-faint` for icon and `--text-muted` for message
- **Loading states**: Skeleton shimmer using `--bg-surface-alt` with CSS animation

## Icons

- **Library**: Lucide (`lucide-react`)
- **Rationale**: Open-source, 1000+ icons, tree-shakable (only used icons are bundled), React component support, fully typed
- **Installation**: `npm install lucide-react`
- **Usage**: Import icons as React components directly (e.g., `import { Package, Search } from 'lucide-react'`) and use as JSX elements
- **Default size**: 20px for UI, 16px for inline, 24px for navigation
- **Stroke width**: 1.5px (thinner, more professional than default 2px)
- **Color**: Inherits `currentColor` — automatically matches text color token

> ⛔ **HARD CONSTRAINT**: You MUST use Lucide (`lucide-react`) for all icons. You MUST NOT use Font Awesome, Heroicons, Material Icons, or any other icon library.

---

> ⛔ **REMINDER**: No UI deviation is allowed without updating this file first. Every color, font, radius, and layout pattern listed here is mandatory and non-negotiable.