# Admin Panel Color Palette Guide

## Base Colors (Dark Theme)

### Background Gradient
```css
background: linear-gradient(to bottom right, 
  rgb(15, 23, 42) /* slate-900 */,
  rgb(30, 41, 59) /* slate-800 */,
  rgb(15, 23, 42) /* slate-900 */
);
```

### Main Container
- Base: `bg-slate-800/40` with `backdrop-blur-xl`
- Border: `border-slate-700/50`
- Hover: `hover:shadow-xl hover:shadow-slate-600/20`

### Forms & Inputs
- Background: `bg-slate-700`
- Border: `border-slate-600`
- Focus Ring: `focus:ring-cyan-500`
- Text: `text-white`
- Placeholder: `text-slate-500`

## Section Tab Colors

Each admin section has a unique accent color for easy visual identification:

### Tab Border & Highlight Colors

| Section | Color | Border Class | Text Class | Shadow |
|---------|-------|--------------|-----------|--------|
| Products | Cyan | `border-cyan-500` | `text-cyan-400` | `shadow-cyan-500/20` |
| Categories | Purple | `border-purple-500` | `text-purple-400` | `shadow-purple-500/20` |
| Offers | Orange | `border-orange-500` | `text-orange-400` | `shadow-orange-500/20` |
| Video Sections | Red | `border-red-500` | `text-red-400` | `shadow-red-500/20` |
| Carousel | Cyan | `border-cyan-500` | `text-cyan-400` | `shadow-cyan-500/20` |
| Marquee | Pink | `border-pink-500` | `text-pink-400` | `shadow-pink-500/20` |
| Sections | Indigo | `border-indigo-500` | `text-indigo-400` | `shadow-indigo-500/20` |
| Card Design | Violet | `border-violet-500` | `text-violet-400` | `shadow-violet-500/20` |
| Banner & Social | Amber | `border-amber-500` | `text-amber-400` | `shadow-amber-500/20` |
| Navigation | Sky | `border-sky-500` | `text-sky-400` | `shadow-sky-500/20` |
| Coupons | Fuchsia | `border-fuchsia-500` | `text-fuchsia-400` | `shadow-fuchsia-500/20` |
| Bulk Operations | Teal | `border-teal-500` | `text-teal-400` | `shadow-teal-500/20` |
| Try-On | Rose | `border-rose-500` | `text-rose-400` | `shadow-rose-500/20` |
| Tax | Lime | `border-lime-500` | `text-lime-400` | `shadow-lime-500/20` |
| Order Channels | Purple | `border-purple-500` | `text-purple-400` | `shadow-purple-500/20` |
| Footer | Blue | `border-blue-500` | `text-blue-400` | `shadow-blue-500/20` |
| AI Assistant | Emerald | `border-emerald-500` | `text-emerald-400` | `shadow-emerald-500/20` |
| Gallery | Cyan | `border-cyan-500` | `text-cyan-400` | `shadow-cyan-500/20` |
| Bill Customizer | Orange | `border-orange-500` | `text-orange-400` | `shadow-orange-500/20` |
| Settings | Slate | `border-slate-500` | `text-slate-300` | `shadow-slate-500/20` |
| Publish | Green | `border-green-500` | `text-green-400` | `shadow-green-500/20` |

## Button Colors by Function

### Primary Action Buttons
- **Add/Create**: Gradient (from-color to-color variants)
- **Preview**: `from-blue-500 to-cyan-500`
- **Publish**: `from-green-500 to-emerald-600`
- **Logout**: `bg-red-600 hover:bg-red-700`

### Status Buttons
- **Featured**: `bg-amber-500 hover:bg-amber-600`
- **In Stock**: `bg-green-500 hover:bg-green-600`
- **Out of Stock**: `bg-red-600 hover:bg-red-700`
- **Not Featured**: `bg-slate-600 hover:bg-slate-500`

## Interactive Elements

### Checkboxes
- **Featured**: `text-cyan-500`
- **In Stock**: `text-green-500`
- **Best Selling**: `text-blue-500`
- **Might You Like**: `text-purple-500`

### Tags & Badges
- **Category Tags**: `bg-cyan-500/20 text-cyan-300 border-cyan-500/30`
- **Color Tags**: `bg-pink-500/20 text-pink-300`
- **Status Badges**: Matching color codes

## Hover & Active States

### All Interactive Elements
- **Hover Scale**: `hover:scale-105`
- **Active Click**: `active:scale-95`
- **Transition**: `transition-all duration-300`
- **Shadow Glow**: Matching color with `/50` opacity

### Input Focus
- **Ring**: `focus:ring-2 focus:ring-[section-color]/30`
- **Border Highlight**: `focus:border-[section-color]`
- **Transition**: `transition-all duration-300`

## Text Colors

### Headings
- Primary: `text-white` (main headings)
- Secondary: `text-slate-300` (form labels)

### Body Text
- Primary: `text-slate-400` (descriptions, hints)
- Secondary: `text-slate-500` (disabled, metadata)

### Links & Highlights
- Active: Section-specific color (cyan, purple, etc.)
- Hover: Lighter shade of active color

## Special Effects

### Glassmorphism
```css
backdrop-filter: blur(12px);
background-color: rgba(15, 23, 42, 0.4);
border: 1px solid rgba(71, 85, 105, 0.5);
```

### Shadows
- **Normal**: `shadow-lg`
- **Hover**: `hover:shadow-[color]/50`
- **Card**: `shadow-2xl`
- **Focus**: Subtle inner shadow effect

## Usage Guidelines

1. **Section Consistency**: Keep the same color for all interactive elements within a section
2. **Contrast**: All text colors maintain WCAG AA compliance on dark backgrounds
3. **Animations**: Always pair hover effects with scale transforms for feedback
4. **Spacing**: Maintain consistent padding and margins using Tailwind's spacing scale
5. **Transitions**: Use 300ms duration for smooth, professional animations

## CSS Variables (If Needed)

To implement as CSS variables for easy theme switching:

```css
:root {
  --color-primary: rgb(15, 23, 42);
  --color-secondary: rgb(30, 41, 59);
  --color-tertiary: rgb(51, 65, 85);
  --color-accent-cyan: rgb(34, 211, 238);
  --color-accent-purple: rgb(168, 85, 247);
  /* ... more colors ... */
}
```

## Dark Mode Notes

- All colors are optimized for dark backgrounds
- Avoid pure white text (#FFF) - use text-white which is rgba-based
- Shadows are subtle to avoid washed-out appearance
- Borders use low opacity for definition without harshness
- Hover states increase brightness/saturation slightly
