# Spec Requirements Document

> Spec: Signals State Updates
> Created: 2025-09-16

## Overview

Add reactive signal primitives and subscriptions so Render-X can propagate global or shared state changes without re-rendering entire trees, keeping updates isolated to components that read the changed values. Bundle these mechanics behind ergonomic context helpers (`createStateContext`, `StateProvider`, `useStateContext`) so adopters can opt into fine-grained updates without learning new primitives or rewriting existing provider trees.

## User Stories

### Targeted component rerendering

As a library adopter building dashboards, I want to declare global signals that drive props through multiple component layers, so that only components reading a given signal rerender when it changes instead of the full tree.

Developers register a `createSignal` value in a parent module, pass signal getters through props, and observe only the consuming components re-render via instrumentation hooks when the setter is called.

### Derived reactive values

As a component author, I want to compose computed signals from other signals, so that derived props stay fresh without wiring memo hooks or manual invalidation in every component.

Authors wrap calculations in `computed` helpers that subscribe to upstream dependencies and reuse the memoized value across renders, with automatic recomputation when any dependency signal updates.

### Context-first consumption

As an application team adopting Render-X, I want to expose shared state via a `StateProvider` and consume it through `useStateContext`, so that the transparent API feels familiar to React users while still delivering signal-level rendering performance.

Teams call `createStateContext` once, wrap their tree with the generated provider, and destructure `[value, setValue]` from the hook without ever interacting with signals directly or changing how they drill props today. Optional selector support lets advanced consumers subscribe to slices while retaining default tuple ergonomics.

### Signal-driven documentation and QA

As a maintainer, I want example code and guidance that show how signals coexist with existing hooks, so that I can onboard teams quickly and verify behavior via tests and benchmarks.

Maintainers run new examples in the playground bundle, execute automated tests that assert minimal DOM updates, and reference written guidance covering migration from `useState` to shared signals.

## Spec Scope

1. **Signal primitives** - Implement `createSignal` (value, setter) plus readonly accessors usable inside and outside components and ensure they cooperate with existing `useState` calls within the same component.
2. **Reactive derivations** - Provide `computed` helpers and `effect` observers that integrate with hook scheduling and batch updates.
3. **Context wrapper API** - Deliver `createStateContext`, `StateProvider`, and `useStateContext` helpers that encapsulate signals while keeping consumer ergonomics aligned with React context patterns, including optional selector functions and stable tuple identity guarantees.
4. **Targeted subscriptions** - Integrate HookHost and VDOM so only virtual nodes that dereference a signal trigger DOM updates when the signal changes, and ensure subscriptions clean up on component unmount.
5. **Developer ergonomics** - Document signal and context usage, add TS typings, migration notes, and provide playground examples and tests demonstrating partial rerenders and selector behavior.

## Out of Scope

- Server-side rendering or hydration semantics for signals.
- Direct integrations with external state libraries (e.g., Redux, Zustand, RxJS).
- Debug tooling such as devtools inspectors or time-travel visualization for signals.
- Memoization helpers beyond the provided selector API (e.g., deep equality heuristics) unless required for baseline selector support.

## Expected Deliverable

1. Exported `createSignal`, `computed`, and `effect` APIs with TypeScript definitions and tests verifying targeted rerender behavior alongside existing hook state.
2. `createStateContext`, generated `StateProvider`, and `useStateContext` utilities with examples showing identical ergonomics to React context while relying on signals internally, including optional selector usage and tuple stability guarantees verified by tests.
3. Benchmark or test artifacts showing at least a 30% reduction in unnecessary renders for a 1k-node tree compared to the current hook-only implementation.
4. Playground or docs example demonstrating a global state context update where only subscribed child components mutate the DOM (validated via test or instrumentation snapshot), plus migration notes outlining how to convert an existing `useState` + `Context.Provider` pair to the new helpers.
