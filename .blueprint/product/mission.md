# Product Mission

## Pitch

Render-X is a micro JSX rendering toolkit that helps frontend engineers ship interactive experiences without heavyweight frameworks by providing React-compatible hooks, portals, and DOM bindings in sub-5KB packages.

## Users

### Primary Customers

- Design system teams that need a lean rendering layer for custom component libraries
- Indie developers and startups delivering rich web apps on performance-constrained budgets

### User Personas

**Component Systems Engineer** (28-38 years old)
- **Role:** Frontend platform engineer at a SaaS company
- **Context:** Maintains a themable design system that must embed into multiple React and non-React host apps
- **Pain Points:** Bundles bloat fast, limited control over rendering lifecycle hooks
- **Goals:** Drop-in compatibility with JSX syntax, predictable hooks lifecycle, easy DOM escape hatches

**Web Performance Advocate** (26-40 years old)
- **Role:** Staff-level frontend developer at a media publisher
- **Context:** Replatforming legacy interactive widgets to meet Core Web Vitals and ad-tech constraints
- **Pain Points:** Large framework boot times, complex build pipelines, conflicting dependency trees
- **Goals:** Deliver <100ms interaction readiness, avoid framework lock-in, keep bundle size under 30KB total

## The Problem

### Framework Bloat Blocks Fast Loads

Modern SPA frameworks add 120-150KB minified runtime and 30-40ms parse cost on mid-tier devices, pushing Core Web Vitals into failing thresholds.

**Our Solution:** Provide a JSX runtime and DOM renderer that ship under 5KB gzipped combined, cutting parse and boot overhead by >70% compared to React.

### Hooks Without React Are Hard

Teams wanting React-like hooks patterns outside React often recreate lifecycle plumbing manually, increasing defects ~25% per migration sprint.

**Our Solution:** Offer a stable hook scheduler that mirrors React semantics and TypeScript types, so teams can reuse patterns without rewriting state management.

### Embedding Widgets Across Hosts Is Fragile

Porting interactive widgets into CMSs or native shells demands portal-like escapes, yet bespoke implementations take 2-3 weeks and break under hydration.

**Our Solution:** Provide first-class portals targeting raw DOM nodes with hydration-safe reconciliation, shrinking integration time to 2 days.

## Differentiators

### Micro Footprint by Design

Unlike React or Preact, we provide dual packages (@render-x/jsx and @render-x/dom) so teams include only what they ship, resulting in <5KB gzipped runtime overhead.

### React-Compatible Hooks Without Dependencies

Unlike nano-framework competitors that require React or third-party schedulers, we provide a zero-dependency hook engine that keeps behavior predictable across SSR and CSR contexts.

### Portal Support for Host-Oriented Apps

Unlike compile-only JSX libraries that stop at template expansion, we provide DOM-level portals and hydration guards, letting teams embed widgets into modals, shadow DOM, and native layers confidently.

## Key Features

### Core Features

- **Dual-package architecture:** Separate @render-x/jsx compiler helpers and @render-x/dom runtime keep bundles modular and tree-shakeable.
- **React-compatible hooks:** `useState`, `useEffect`, `useMemo`, and custom hooks run on a lightweight scheduler with strict mode warnings for consistency.
- **Hydration-aware portals:** Render into arbitrary DOM targets with lifecycle safeguards for SSR/CSR boundary conditions.
- **TypeScript-first APIs:** Ship exhaustive .d.ts files with inferred props and hook signatures to guarantee developer ergonomics.
- **SSR-ready rendering:** Provide `renderToString` and streaming adapters so teams can pre-render and hydrate on demand.

### Collaboration Features

- **Plugin-ready renderer:** Extension points for devtools hooks, logging, and profiling enable team-wide tooling without forking the core.
- **Deterministic dev mode:** Debug builds surface lifecycle traces and strict effect ordering checks to unblock code reviews.
- **Starter templates:** Lightweight create scripts scaffold testing and bundling baselines for teams onboarding new packages fast.
- **Interoperable component model:** JSX factory compatibility keeps components portable across React, Preact, and Render-X ecosystems.
- **Documentation playbook:** Recipes for migrating React components help teams share knowledge and align patterns across repos.
