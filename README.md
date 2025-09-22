# Render-X Core

> A micro JSX runtime with a DOM renderer, React-compatible hooks, and a focus on lean bundles.

Render-X Core delivers the essentials for building interactive interfaces without hauling in a full framework. It keeps the familiar ergonomics of JSX, hooks, and portals while relying on a tiny fiberless renderer, delegated DOM events, and strict TypeScript typings.

---

## Table of Contents

1. [Features](#features)
2. [Quick Start](#quick-start)
3. [Usage Guide](#usage-guide)
4. [Core Concepts](#core-concepts)
5. [API Reference](#api-reference)
6. [Build & Tooling](#build--tooling)
7. [License](#license)

---

## Features

- **Lightweight runtime target** &mdash; JSX runtime, DOM renderer, and hooks packaged with aggressive Rollup + terser builds (`dist/index.js`, `dist/index.min.js`).
- **React-compatible hooks** &mdash; `useState`, `useEffect`, and `useRef` behave like their React counterparts with batched updates handled by `HookHost`.
- **Fiberless reconciliation** &mdash; simple VDOM diffing keeps re-renders predictable and easy to debug (`src/hook-host.ts`, `src/render.ts`).
- **Delegated DOM events** &mdash; event listeners register once per root, reducing memory churn while preserving synthetic-style bubbling (`src/event-manager.ts`).
- **Portals & fragments out of the box** &mdash; Render anywhere in the DOM tree and compose children lists without wrappers (`src/portal.ts`, `src/fragment.ts`).
- **TypeScript-first design** &mdash; strict typings for JSX factories (`jsx`, `jsxs`) and runtime exports ensure great editor support.
- **Context API** &mdash; `createContext`, `<Provider>`, and `useContext` mirror React-style ergonomics for shared state.

---

## Quick Start

### 1. Install

```bash
yarn add @render-x/core
```

### 2. Configure JSX runtime (TypeScript)

Add the following to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@render-x/core"
  }
}
```

> **Important:** Automatic JSX runtime import is still being stabilized. Until then, add `import { jsx } from '@render-x/core'` to every file that uses JSX (or rely on your bundler's equivalent pragma comment).

### 3. Render your first component

```tsx
import { jsx, render, useState } from '@render-x/core'

const Counter = () => {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount((n) => n + 1)}>Clicked {count} times</button>
}

render(document.getElementById('root')!, <Counter />)
```

Run your bundler (Vite, esbuild, Webpack, etc.) as normal. Render-X emits standard DOM nodes, so no special runtime integration is required beyond the JSX configuration and temporary explicit `jsx` import.

---

## Usage Guide

### Hooks

- `useState(initial)`: local component state with stable setters.
- `useEffect(callback, deps?)`: post-render effects with cleanup support.
- `useRef(initial)`: mutable containers preserved between renders.
- `useMemo(factory, deps?)`: memoize expensive computations aligned to dependency arrays.
- `useCallback(callback, deps?)`: memoized function references, built atop `useMemo`.
- `useContext(ctx)`: read a context value created by `createContext`, honoring nested providers and fallbacks.

Hook execution is coordinated through an internal `HookContext` stored per component instance, mirroring the React mental model. Updates schedule via a microtask queue to batch rerenders.

### Portals

```tsx
import { createPortal } from '@render-x/core'

const Modal = ({ children }) => createPortal(children, '#modal-root')
```

### CSS & attributes

Use standard DOM props: `className`, `style`, `data-*`, handlers like `onClick`. Render-X normalizes class order, merges style objects, and delegates events from the root to the target element.

### Event Delegation

Supported delegated events: `click`, `input`, `submit`, `keydown`, `focus`, `blur`. Handlers are automatically registered the first time an element with `on<Event>` props renders.

### Context

```tsx
import { createContext, jsx, render, useContext, useState } from '@render-x/core'

const CounterContext = createContext(0)

const CounterDisplay = () => {
  const count = useContext(CounterContext)
  return <p>Count: {count}</p>
}

const CounterProvider = () => {
  const [count, setCount] = useState(0)
  return (
    <CounterContext.Provider value={count}>
      <button onClick={() => setCount((n) => n + 1)}>Increment</button>
      <CounterDisplay />
    </CounterContext.Provider>
  )
}

render(document.getElementById('root')!, <CounterProvider />)
```

## Core Concepts

### Fiberless Rendering Pipeline

`render.ts` translates VNodes into DOM nodes using a straightforward depth-first strategy. Diffing on updates happens inside the hook runtime (`src/hooks/internal/with-hooks.ts`), where component instances reuse their hook arrays on subsequent renders.

### Hook Host

`withHooks` wraps functional components to:

1. Maintain hook state arrays.
2. Schedule microtask flushes after state updates.
3. Re-run effects on animation frames to avoid layout thrash.
4. Clean up effect subscriptions when nodes unmount.

### Virtual DOM Helpers

- `jsx`/`jsxs`/`Fragment` compose tree nodes.
- `vdom.ts` normalizes children and enforces stable `key` handling.
- `dom-props.ts` reconciles attributes and inline styles, minimizing DOM writes.

---

## API Reference

| Export                                                      | Description                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| `render(root: Element, vnode: VNodeChild)`                  | Mounts a VNode tree into a DOM container, cleaning previous content.     |
| `jsx`, `jsxs`, `Fragment`                                   | JSX factory functions used by the compiler (do not call directly).       |
| `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback` | React-compatible hook implementations.                                   |
| `useContext`, `createContext`, `<Provider>`                 | Basic context API for propagating shared state.                          |
| `createPortal(children, target)` / `Portal`                 | Render subtree into another DOM node.                                    |
| `setCssVariable`, `setCssVariables`                         | Utilities from `css-variables.ts` for theming via CSS custom properties. |
| `HookContext`, `HookData`, `VNode*` types                   | Public TypeScript types for authoring bindings.                          |

> Tip: The package exports ESM only. When targeting CJS, bundle with a tool like Rollup, esbuild, or Webpack 5.

---

## Build & Tooling

| Command      | Description                                                                |
| ------------ | -------------------------------------------------------------------------- |
| `yarn clean` | Remove `dist/` artifacts.                                                  |
| `yarn build` | Run Rollup to produce JS + `.d.ts` bundles with minified variants.         |
| `yarn pub`   | Clean, build, and (placeholder) publish to npm. Configure auth before use. |

- Rollup configuration lives in [`rollup.config.js`](rollup.config.js) with esbuild for TypeScript transpilation and terser for minification.
- TypeScript config is in [`tsconfig.json`](tsconfig.json) and enforces strict JSX usage with `@render-x/core` as the factory import source.

---

## License

TBD. Until a license is published, treat this project as “all rights reserved.”
