# SIGAP Design System

## Visual direction

**Community garden utility.** SIGAP should feel like a well-run neighborhood growing space: cared for, open to everyone, and easy to navigate. The garden reference informs the palette, type, information density, and one repeating field-row detail. It does not change familiar web navigation or controls.

## Palette

- Soil / shell: `#203A2C`
- Leaf / primary: `#47784E`
- Deep leaf / action: `#315D3C`
- Leaf wash: `#E4EADC`
- Paper: `#F4F2E9`
- Card: `#FFFEF9`
- Ink: `#23342B`
- Muted: `#6D786C`
- Divider: `#DCE1D3`
- Clay: `#B95F42`
- Seed gold: `#E7BD59`
- Water blue: `#557B85`
- Danger: `#A94B3A`

Use leaf tones for service actions and healthy/complete states, clay for attention, and gold/blue sparingly for distinct schedule and category information. Keep text contrast high on both soil and paper surfaces.

## Typography

- Display and section headings: Newsreader, then Georgia fallback; medium weight, close tracking.
- Interface and body: DM Sans, then system sans-serif; clear labels, restrained size steps.
- Ticket numbers and times use tabular numerals. Monospace is reserved for actual codes.

## Layout and components

- App shell: deep-soil navigation rail on desktop, compact horizontal navigation on mobile, warm paper work area, simple utility header.
- Use standard links, buttons, tabs, form fields, tables, and status indicators. The garden world never turns them into themed props.
- Work surfaces use warm near-white, a single fine botanical divider, and one soft shadow at most. Radii range from 8px on controls to 13px on larger surfaces.
- Preserve legibility in dense admin and officer tables. Allow horizontal table scrolling on narrow screens.
- Primary actions use deep leaf with white text; secondary actions remain quiet and clearly interactive.
- The signature field-row detail uses thin, muted bands to distinguish grouped pickup times and related category/status data. Never use decorative texture behind text.

## States and accessibility

- Waiting: amber/gold; processing: water blue; complete: leaf; errors: clay/red. State labels remain visible in text.
- Provide clear focus rings, keyboard access, associated input labels, and reduced-motion behavior.
- Keep empty, loading, disabled, and error states readable and useful.
