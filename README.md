# @mrmartineau/pretext-react-minimap

A tiny React minimap component. Renders section headings as a vertical stack of horizontal bars whose **widths reflect each heading's measured text width**, computed without DOM reflow via [`@chenglou/pretext`](https://github.com/chenglou/pretext). Hover a bar to see the heading label.

It is *not* a VS Code-style minimap (every word rendered) — it is a structural outline.

## Features

- Bar widths driven by `@chenglou/pretext` text measurement (no `getBoundingClientRect` thrash).
- Active section tracked via `IntersectionObserver` + a distance-to-top tie-break.
- Viewport indicator showing the visible scroll window.
- Auto-extract sections from any heading container with `useSections`.
- Works with `window` scroll or a custom scroll container.
- All visuals exposed as CSS variables — bring your own theme.

## Install

```sh
bun add @mrmartineau/pretext-react-minimap
# or
npm install @mrmartineau/pretext-react-minimap
```

Peer dependencies: `react`, `react-dom` (>=18).

## Usage

```tsx
import { Minimap } from '@mrmartineau/pretext-react-minimap'
import '@mrmartineau/pretext-react-minimap/styles.css'

export function Docs() {
  const sections = [
    { id: 'intro', title: 'Introduction', level: 1 },
    { id: 'install', title: 'Installation', level: 2 },
    { id: 'usage', title: 'Usage', level: 2 },
    { id: 'usage-react', title: 'React', level: 3 },
    { id: 'api', title: 'API', level: 1 },
  ]

  return (
    <div className="layout">
      <article>{/* …headings with matching `id` attributes… */}</article>
      <aside><Minimap sections={sections} /></aside>
    </div>
  )
}
```

Each section's `id` must match an element id in your document — that is the scroll target.

### Auto-extract sections from the DOM

```tsx
import { useRef } from 'react'
import { Minimap, useSections } from '@mrmartineau/pretext-react-minimap'

function Article() {
  const ref = useRef<HTMLElement>(null)
  const sections = useSections(ref) // watches via MutationObserver

  return (
    <>
      <article ref={ref}>{/* h1…h6 with ids */}</article>
      <Minimap sections={sections} />
    </>
  )
}
```

`useSections(ref, { selector, map })` defaults to all `h1…h6` with ids. Pass `selector` to narrow the match, or `map` to derive custom titles/levels.

### Custom scroll container

```tsx
const scrollRef = useRef<HTMLDivElement>(null)
<div ref={scrollRef} className="scroll-area">…</div>
<Minimap sections={sections} scrollTarget={scrollRef.current} topInset={64} />
```

Pass `topInset` if a sticky header occludes the top of the scroll area.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `sections` | `MinimapSection[]` | required | `{ id, title, level? }` for each entry. |
| `scrollTarget` | `HTMLElement \| Window \| null` | `window` | Scroll source for the active-section tracker and viewport indicator. |
| `getFont` | `(s) => string` | level-based defaults | Canvas-font shorthand used to measure bar widths. |
| `topInset` | `number` | `0` | Pixels at the top of the scroll area to treat as occluded. |
| `showViewport` | `boolean` | `true` | Render the translucent viewport indicator. |
| `smoothScroll` | `boolean` | `true` | Smooth-scroll on click. |
| `tooltipSide` | `'left' \| 'right'` | `'left'` | Tooltip placement relative to bars. |
| `onSectionClick` | `(s, ev) => boolean \| void` | — | Click handler. Return `false` to suppress the default scroll. |
| `className`, `style`, `aria-label` | — | — | Standard pass-throughs. |

## Theming

Import the CSS file once, then override the CSS variables on the `.prm-minimap` element (or any ancestor). All defaults live on the root — every value is a variable.

```css
.prm-minimap {
  --prm-width: 44px;
  --prm-bar-color: color-mix(in oklab, currentColor 40%, transparent);
  --prm-bar-active: dodgerblue;
  --prm-viewport-bg: rgba(0, 110, 255, 0.12);
  --prm-tooltip-bg: #111;
  --prm-tooltip-color: #fff;
}
```

See [`src/Minimap.css`](src/Minimap.css) for the full variable list.

## Demo

```sh
bun install
bun run example
```

Then open <http://localhost:5173>.

## License

[ISC](https://choosealicense.com/licenses/isc/) © [Zander Martineau](https://zander.wtf)
