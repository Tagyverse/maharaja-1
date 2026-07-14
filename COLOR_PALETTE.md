# Admin Panel Color Palette Guide

## Design System Overview

### Core Colors

#### Background & Containers
```
Primary Background:    #0F172A (slate-900)
Secondary Background:  #0F172A (slate-900)  
Tertiary Background:   #1E293B (slate-800)
Border Color:          #475569 (slate-700)
Input Background:      #334155 (slate-700)
Input Border:          #475569 (slate-600)
```

#### Text Colors
```
Primary Text:          #FFFFFF (white)
Secondary Text:        #CBD5E1 (slate-300)
Tertiary Text:         #94A3B8 (slate-400)
Disabled Text:         #64748B (slate-500)
Error Text:            #F87171 (red-400)
```

## Tab Color Scheme

Each tab has its own distinct color for visual organization:

### 🔵 Blue Spectrum
- **Products:**          `from-cyan-500 to-blue-500`  - #06B6D4 / #3B82F6
- **Carousel:**          `from-cyan-500`              - #06B6D4
- **Gallery (R2):**      `from-cyan-500`              - #06B6D4
- **Navigation:**        `from-sky-500`               - #0EA5E9
- **Footer:**            `from-blue-500`              - #3B82F6

### 🟣 Purple Spectrum
- **Categories:**        `from-purple-500`            - #A855F7
- **Coupons:**           `from-fuchsia-500`           - #D946EF
- **Order Channels:**    `from-purple-500`            - #A855F7
- **AI Assistant:**      `from-emerald-500`           - #10B981
- **Card Design:**       `from-violet-500`            - #7C3AED

### 🟠 Warm Spectrum
- **Offers:**            `from-orange-500`            - #EA580C
- **Banner & Social:**   `from-amber-500`             - #F59E0B
- **Bill Design:**       `from-orange-500`            - #EA580C
- **Marquee:**           `from-pink-500`              - #EC4899

### 🟢 Green Spectrum
- **Tax Settings:**      `from-lime-500`              - #84CC16
- **Publish to Live:**   `from-green-500`             - #22C55E
- **Bulk Operations:**   `from-teal-500`              - #14B8A6

### 🔴 Red Spectrum
- **Video Sections:**    `from-red-500`               - #EF4444

### ⚫ Neutral Spectrum
- **Settings:**          `from-slate-500`             - #64748B
- **Homepage Sections:** `from-indigo-500`            - #4F46E5
- **Try-On Models:**     `from-rose-500`              - #F43F5E

## Button Styles

### Primary Action Buttons
```
Background Gradient:    from-cyan-500 to-blue-500
Hover Gradient:         from-cyan-600 to-blue-600
Focus Ring:             cyan-500
Text Color:             white
Shadow:                 shadow-lg shadow-cyan-500/50
Transform:              hover:scale-105
Transition:             transition-all duration-300
```

### Success Action Buttons (Publish)
```
Background Gradient:    from-green-500 to-emerald-600
Hover Gradient:         from-green-600 to-emerald-700
Focus Ring:             green-500
Text Color:             white
Shadow:                 shadow-lg shadow-green-500/50
Transform:              hover:scale-105
Transition:             transition-all duration-300
```

### Danger Action Buttons (Logout)
```
Background:             bg-red-600
Hover:                  hover:bg-red-700
Focus Ring:             red-500
Text Color:             white
Shadow:                 shadow-lg shadow-red-500/50
Transform:              hover:scale-105
Transition:             transition-all duration-300
```

## Form Elements

### Input Fields
```
Background:             bg-slate-700
Border:                 border-2 border-slate-600
Border Focus:           focus:border-cyan-500
Ring Focus:             focus:ring-2 focus:ring-cyan-500
Text Color:             text-white
Placeholder:            text-slate-400
Transition:             transition-all duration-300
```

### Labels
```
Text Color:             text-slate-300
Font Weight:            font-semibold
Font Size:              text-sm
Margin Bottom:          mb-2
```

### Checkboxes
```
Checked Color:          text-cyan-500
Border:                 border-2 border-slate-600
Unchecked Border:       border-slate-600
Focus Ring:             focus:ring-2 focus:ring-cyan-500
```

### Textareas
```
Background:             bg-slate-700
Border:                 border-2 border-slate-600
Text Color:             text-white
Focus Ring:             focus:ring-cyan-500
Rows:                   3
Padding:                p-4
```

## Active Tab Styling

```
Bottom Border:          border-b-4 border-[tab-color]
Text Color:             text-[accent]-400
Shadow Glow:            shadow-lg shadow-[accent]-500/20
Transition:             transition-all duration-300
```

## Hover States

### Tab Hover (Inactive)
```
Text Color:             hover:text-[accent]-400
No Shadow:              No glow effect
Smooth Transition:      transition-all duration-300
```

### Input Hover
```
Background:             bg-slate-700 (unchanged)
Border Color:           border-slate-600 (unchanged)
Only changes on focus
```

### Button Hover
```
Scale Transform:        hover:scale-105
Shadow Enhancement:     hover:shadow-[color]-500/50
Gradient Shift:         hover:from-[lighter] hover:to-[lighter]
Duration:               transition-all duration-300
```

## Status Colors

### Success State
```
Background:             bg-green-950
Border:                 border-green-700
Text:                   text-green-300
Animation:              animate-pulse
```

### Error State
```
Text Color:             text-red-400
Background:             (inherit from context)
Font Size:              text-xs
```

### Loading State
```
Animation:              animate-spin
Color:                  text-white/80
Icon:                   Loader2 from lucide-react
```

## Accessibility Colors

### Contrast Ratios (WCAG AA)
- White (#FFF) on Slate-800 (#1E293B): 14.5:1 ✅
- Slate-300 on Slate-800:                 7.2:1 ✅
- Slate-400 on Slate-800:                 5.8:1 ✅
- Red-400 on Slate-800:                   6.5:1 ✅

### Color Blind Safe
- Using distinct colors (not just red/green)
- Adding icons alongside color indicators
- Text labels on colored elements

## CSS Custom Properties (Tailwind Classes)

### Dark Mode Colors
```
bg-slate-900   - #0F172A (primary background)
bg-slate-800   - #1E293B (containers)
bg-slate-700   - #334155 (inputs)
border-slate-700 - #475569 (borders)
border-slate-600 - #475569 (input borders)
text-white     - #FFFFFF (primary text)
text-slate-300 - #CBD5E1 (secondary text)
text-slate-400 - #94A3B8 (tertiary text)
text-slate-500 - #64748B (disabled text)
```

### Accent Colors (40+ variations)
```
From Tailwind v3:
- Cyan-500     (#06B6D4)
- Blue-500     (#3B82F6)
- Purple-500   (#A855F7)
- Pink-500     (#EC4899)
- Rose-500     (#F43F5E)
- Red-500      (#EF4444)
- Orange-500   (#EA580C)
- Amber-500    (#F59E0B)
- Green-500    (#22C55E)
- Emerald-500  (#10B981)
- Lime-500     (#84CC16)
- Teal-500     (#14B8A6)
- Sky-500      (#0EA5E9)
- Indigo-500   (#4F46E5)
- Violet-500   (#7C3AED)
- Fuchsia-500  (#D946EF)
```

## Color Psychology

- **Cyan/Blue:** Trust, stability, primary actions
- **Green:** Success, growth, confirmations
- **Red:** Alerts, importance, logout
- **Purple:** Creativity, innovation, categories
- **Orange:** Energy, warmth, offers
- **Amber:** Caution, attention, banners

## Implementation Tips

1. **Use CSS Classes:** Leverage Tailwind's color classes
2. **Consistent Shadows:** Always use color-matched shadows for glow
3. **Transition Timing:** Keep transitions at 300ms for smoothness
4. **Focus States:** Always provide visible focus indicators
5. **Hover Feedback:** Use scale + shadow for interactive elements
6. **Error Prevention:** Use color alone + text for important info

---

**Color System Version:** 2.0 Material Design Dark Theme
**Last Updated:** 2024-12-19
**Tailwind Version:** v3
